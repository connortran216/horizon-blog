import { describe, expect, it, vi } from 'vitest';
import { createBackendClient, BackendError } from './backend.mjs';
import { createSeoConfig } from './config.mjs';

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const post = (overrides = {}) => ({
  id: 76,
  title: 'API Performance',
  content_markdown: 'Measure first.\n\n![cover](media://37)',
  created_at: '2026-05-31T15:35:12.405931Z',
  updated_at: '2026-05-31T15:57:35.464126Z',
  status: 'published',
  owner: { id: 1, name: 'Connor Tran' },
  tags: [{ name: 'api' }],
  ...overrides,
});

describe('SEO backend adapter', () => {
  it('falls back across backend hosts and normalizes a published post', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('primary unavailable'))
      .mockResolvedValueOnce(jsonResponse({ data: post() }));
    const config = {
      ...createSeoConfig({ BE_HOST: 'https://primary.example' }),
      backendHosts: ['https://primary.example', 'https://fallback.example'],
    };
    const backend = createBackendClient(config, { fetchImpl });

    await expect(backend.getPublishedPost('76')).resolves.toMatchObject({
      id: 76,
      title: 'API Performance',
      contentMarkdown: 'Measure first.\n\n![cover](media://37)',
      status: 'published',
      author: { id: 1, name: 'Connor Tran', slug: 'connor-tran' },
      tags: ['api'],
    });
    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      'https://primary.example/posts/76',
      'https://fallback.example/posts/76',
    ]);
  });

  it('maps missing and non-published records to not found', async () => {
    const missing = createBackendClient(createSeoConfig({}), {
      fetchImpl: vi.fn().mockResolvedValue(jsonResponse({ error: 'not found' }, 404)),
    });
    await expect(missing.getPublishedPost('999')).rejects.toMatchObject({
      name: 'BackendError',
      status: 404,
      transient: false,
    });

    const draft = createBackendClient(createSeoConfig({}), {
      fetchImpl: vi.fn().mockResolvedValue(jsonResponse({ data: post({ status: 'draft' }) })),
    });
    const draftRequest = draft.getPublishedPost('76');
    await expect(draftRequest).rejects.toBeInstanceOf(BackendError);
    await expect(draftRequest).rejects.toMatchObject({ status: 404 });
  });

  it('loads every published page exactly once', async () => {
    const fetchImpl = vi.fn(async (url) => {
      const parsed = new URL(url);
      const page = Number(parsed.searchParams.get('page'));
      return jsonResponse({
        data: page === 1 ? [post({ id: 3 }), post({ id: 2 })] : [post({ id: 1 })],
        page,
        limit: 2,
        total: 3,
      });
    });
    const backend = createBackendClient(createSeoConfig({}), { fetchImpl });

    const posts = await backend.listAllPublishedPosts({ limit: 2 });

    expect(posts.map((item) => item.id)).toEqual([3, 2, 1]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('resolves direct author slugs from public ownership and paginates posts', async () => {
    const fetchImpl = vi.fn(async (url) => {
      if (url.includes('/users/1/public-profile')) {
        return jsonResponse({
          data: { id: 1, name: 'Connor Tran', bio: 'Backend engineer and writer.' },
        });
      }
      return jsonResponse({
        data: [post({ id: 2 }), post({ id: 1 })],
        page: 1,
        limit: 100,
        total: 2,
      });
    });
    const backend = createBackendClient(createSeoConfig({}), { fetchImpl });

    await expect(backend.getAuthorBySlug('connor-tran', { page: 2, limit: 1 })).resolves.toMatchObject({
      id: 1,
      name: 'Connor Tran',
      slug: 'connor-tran',
      bio: 'Backend engineer and writer.',
      page: 2,
      limit: 1,
      total: 2,
      posts: [{ id: 1 }],
    });
  });

  it('resolves protected image tokens but never returns a disallowed host', async () => {
    const fetchImpl = vi.fn(async (url) => {
      if (url.endsWith('/posts/76')) return jsonResponse({ data: post() });
      if (url.endsWith('/media/resolve')) {
        return jsonResponse({
          data: [{ media_id: 37, signed_url: 'https://minio.connortran.io.vn/post.png?X-Amz=1' }],
        });
      }
      throw new Error(`unexpected ${url}`);
    });
    const backend = createBackendClient(createSeoConfig({}), { fetchImpl });

    await expect(backend.resolvePostImageSource('76')).resolves.toBe(
      'https://minio.connortran.io.vn/post.png?X-Amz=1',
    );

    const unsafe = createBackendClient(createSeoConfig({}), {
      fetchImpl: vi.fn(async (url) => {
        if (url.endsWith('/posts/76')) {
          return jsonResponse({
            data: post({ content_markdown: '![cover](https://evil.example/tracker.png)' }),
          });
        }
        throw new Error(`unexpected ${url}`);
      }),
    });
    await expect(unsafe.resolvePostImageSource('76')).resolves.toBeUndefined();
  });

  it('serves a stale successful value during a transient failure', async () => {
    let now = 1000;
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ data: post() }))
      .mockRejectedValueOnce(new Error('temporary outage'));
    const config = { ...createSeoConfig({}), cacheTtlMs: 10, staleTtlMs: 1000 };
    const backend = createBackendClient(config, { fetchImpl, now: () => now });

    await expect(backend.getPublishedPost('76')).resolves.toMatchObject({ id: 76 });
    now = 1100;
    await expect(backend.getPublishedPost('76')).resolves.toMatchObject({ id: 76 });
  });
});
