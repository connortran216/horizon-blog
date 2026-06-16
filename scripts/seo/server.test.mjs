import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackendError } from './backend.mjs';
import { createSeoConfig } from './config.mjs';
import { createSeoServer } from './server.mjs';

const post = {
  id: 76,
  title: 'API Performance',
  contentMarkdown: '# Evidence\n\nMeasure first, then optimize.',
  createdAt: '2026-05-31T15:35:12.405931Z',
  updatedAt: '2026-05-31T15:57:35.464126Z',
  status: 'published',
  author: { id: 1, name: 'Connor Tran', slug: 'connor-tran' },
  tags: ['api'],
};

const indexHtml = `<!doctype html>
<html lang="en"><head>
<!--app-meta:start--><meta name="description" content="old"><!--app-meta:end-->
<title>Horizon</title>
</head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>`;

const createBackend = () => ({
  getPublishedPost: vi.fn().mockResolvedValue(post),
  listPublishedPosts: vi.fn().mockResolvedValue({
    posts: [post],
    page: 1,
    limit: 9,
    total: 1,
  }),
  listPublishedPostSummaries: vi.fn().mockResolvedValue({
    posts: [{ ...post, description: 'Measure first, then optimize.' }],
    page: 1,
    limit: 9,
    total: 1,
  }),
  listAllPublishedPosts: vi.fn().mockResolvedValue([post]),
  getAuthorBySlug: vi.fn().mockResolvedValue({
    id: 1,
    name: 'Connor Tran',
    slug: 'connor-tran',
    bio: 'Backend engineer and writer.',
    posts: [post],
    page: 1,
    limit: 6,
    total: 1,
  }),
  resolvePostImageSource: vi
    .fn()
    .mockResolvedValue('https://minio.connortran.io.vn/cover.png?X-Amz-Signature=secret'),
});

describe('SEO HTTP gateway', () => {
  let distDir;
  let server;
  let baseUrl;
  let backend;
  let imageFetch;

  beforeEach(async () => {
    distDir = await mkdtemp(join(tmpdir(), 'horizon-seo-'));
    await mkdir(join(distDir, 'assets'));
    await writeFile(join(distDir, 'index.html'), indexHtml);
    await writeFile(join(distDir, 'assets', 'app-ABC123.js'), 'console.log("app")');
    backend = createBackend();
    imageFetch = vi.fn().mockResolvedValue(
      new Response(Uint8Array.from([137, 80, 78, 71]), {
        status: 200,
        headers: { 'content-type': 'image/png', 'content-length': '4' },
      }),
    );
    const config = createSeoConfig({
      PUBLIC_SITE_URL: 'http://127.0.0.1',
      SEO_MAX_IMAGE_BYTES: '64',
    });
    server = createSeoServer({
      config,
      distDir,
      backend,
      fetchImpl: imageFetch,
      logger: { error: vi.fn(), info: vi.fn() },
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
    config.siteUrl = baseUrl;
  });

  afterEach(async () => {
    if (server?.listening) {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  it('serves crawler-readable public pages with route-specific metadata', async () => {
    const home = await fetch(`${baseUrl}/`);
    const homeHtml = await home.text();
    expect(home.status).toBe(200);
    expect(homeHtml).toContain('<h1>Thoughtful writing for curious readers</h1>');
    expect(homeHtml).toContain(`rel="canonical" href="${baseUrl}/"`);
    expect(homeHtml).toContain('<script type="module" src="/assets/app.js"></script>');
    expect(homeHtml).not.toContain('data-horizon-entry-loader="deferred"');
    expect(backend.listPublishedPostSummaries).toHaveBeenCalledWith({ page: 1, limit: 9 });
    expect(backend.listPublishedPosts).not.toHaveBeenCalled();

    const article = await fetch(`${baseUrl}/blog/76`);
    const articleHtml = await article.text();
    expect(article.status).toBe(200);
    expect(articleHtml).toContain('<h1>API Performance</h1>');
    expect(articleHtml).toContain('<h1 id="evidence">Evidence</h1>');
    expect(articleHtml).toContain(`content="${baseUrl}/seo/post-image/76"`);
    expect(articleHtml).not.toContain('X-Amz-');
    expect(articleHtml).toContain('"@type":"BlogPosting"');

    const author = await fetch(`${baseUrl}/authors/connor-tran`);
    expect(await author.text()).toContain('Backend engineer and writer.');
  });

  it('serves valid robots, sitemap, and RSS instead of application HTML', async () => {
    const robots = await fetch(`${baseUrl}/robots.txt`);
    expect(robots.headers.get('content-type')).toContain('text/plain');
    expect(await robots.text()).toContain(`Sitemap: ${baseUrl}/sitemap.xml`);

    const sitemap = await fetch(`${baseUrl}/sitemap.xml`);
    expect(sitemap.headers.get('content-type')).toContain('application/xml');
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain(`<loc>${baseUrl}/blog/76</loc>`);
    expect(sitemapBody).not.toContain('<!doctype html>');

    const feed = await fetch(`${baseUrl}/feed.xml`);
    expect(feed.headers.get('content-type')).toContain('application/rss+xml');
    expect(await feed.text()).toContain(`<guid isPermaLink="true">${baseUrl}/blog/76</guid>`);
  });

  it('marks private and duplicate query routes noindex with clean canonicals', async () => {
    const privateResponse = await fetch(`${baseUrl}/login`);
    const privateHtml = await privateResponse.text();
    expect(privateHtml).toContain('content="noindex,nofollow,noarchive"');
    expect(privateHtml).not.toContain('rel="canonical"');
    expect(privateHtml).toContain('<script type="module" src="/assets/app.js"></script>');
    expect(privateHtml).not.toContain('data-horizon-entry-loader="deferred"');

    const filteredResponse = await fetch(`${baseUrl}/blog?query=api&utm_source=test`);
    const filteredHtml = await filteredResponse.text();
    expect(filteredHtml).toContain('content="noindex,follow,noarchive"');
    expect(filteredHtml).toContain(`rel="canonical" href="${baseUrl}/blog"`);
    expect(filteredHtml).toContain('<script type="module" src="/assets/app.js"></script>');
    expect(filteredHtml).not.toContain('data-horizon-entry-loader="deferred"');
  });

  it('returns real 404 responses for unknown routes and missing assets', async () => {
    const route = await fetch(`${baseUrl}/definitely-missing`);
    expect(route.status).toBe(404);
    const routeHtml = await route.text();
    expect(routeHtml).toContain('Page not found');
    expect(routeHtml).not.toContain('src="/assets/app.js"');
    expect(routeHtml).not.toContain('data-horizon-entry-loader');

    const asset = await fetch(`${baseUrl}/missing.png`);
    expect(asset.status).toBe(404);
    expect(await asset.text()).not.toContain('<script type="module"');
  });

  it('redirects the physical index file to the canonical root', async () => {
    const response = await fetch(`${baseUrl}/index.html`, { redirect: 'manual' });

    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('/');
  });

  it('maps transient backend failures to retryable 503 responses', async () => {
    backend.getPublishedPost.mockRejectedValueOnce(
      new BackendError('temporary', { status: 503, transient: true }),
    );

    const response = await fetch(`${baseUrl}/blog/76`);

    expect(response.status).toBe(503);
    expect(response.headers.get('retry-after')).toBe('60');
    expect(response.headers.get('cache-control')).toBe('no-store');
    const html = await response.text();
    expect(html).toContain('Temporarily unavailable');
    expect(html).not.toContain('src="/assets/app.js"');
    expect(html).not.toContain('data-horizon-entry-loader');
  });

  it('supports HEAD and rejects unsupported methods', async () => {
    const getResponse = await fetch(`${baseUrl}/blog/76`);
    const headResponse = await fetch(`${baseUrl}/blog/76`, { method: 'HEAD' });
    expect(headResponse.status).toBe(getResponse.status);
    expect(headResponse.headers.get('content-type')).toBe(getResponse.headers.get('content-type'));
    expect(await headResponse.text()).toBe('');

    const postResponse = await fetch(`${baseUrl}/blog/76`, { method: 'POST' });
    expect(postResponse.status).toBe(405);
    expect(postResponse.headers.get('allow')).toBe('GET, HEAD');
  });

  it('serves hashed assets immutably and streams stable post images', async () => {
    const asset = await fetch(`${baseUrl}/assets/app-ABC123.js`);
    expect(asset.status).toBe(200);
    expect(asset.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');

    const image = await fetch(`${baseUrl}/seo/post-image/76`);
    expect(image.status).toBe(200);
    expect(image.headers.get('content-type')).toBe('image/png');
    expect([...new Uint8Array(await image.arrayBuffer())]).toEqual([137, 80, 78, 71]);
    expect(imageFetch).toHaveBeenCalledWith(
      'https://minio.connortran.io.vn/cover.png?X-Amz-Signature=secret',
      expect.objectContaining({ redirect: 'manual' }),
    );
  });

  it('rejects unsafe redirects and sandboxes SVG image responses', async () => {
    imageFetch.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: 'https://evil.example/tracker.png' },
      }),
    );

    const redirected = await fetch(`${baseUrl}/seo/post-image/76`, { redirect: 'manual' });

    expect(redirected.status).toBe(302);
    expect(redirected.headers.get('location')).toBe('/branding/horizon-app-icon-512.png');
    expect(imageFetch).toHaveBeenCalledTimes(1);

    imageFetch.mockResolvedValueOnce(
      new Response('<svg><script>alert(1)</script></svg>', {
        status: 200,
        headers: { 'content-type': 'image/svg+xml' },
      }),
    );

    const svg = await fetch(`${baseUrl}/seo/post-image/76`, { redirect: 'manual' });

    expect(svg.status).toBe(200);
    expect(svg.headers.get('content-type')).toBe('image/svg+xml');
    expect(svg.headers.get('content-security-policy')).toBe(
      'default-src \'none\'; style-src \'unsafe-inline\'; sandbox',
    );
  });

  it('rejects oversized image streams without a declared content length', async () => {
    imageFetch.mockResolvedValueOnce(
      new Response(Uint8Array.from({ length: 65 }, (_, index) => index), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    );

    const response = await fetch(`${baseUrl}/seo/post-image/76`, { redirect: 'manual' });

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/branding/horizon-app-icon-512.png');
  });

  it('redirects missing post images to the permanent brand image', async () => {
    backend.resolvePostImageSource.mockResolvedValueOnce(undefined);

    const response = await fetch(`${baseUrl}/seo/post-image/76`, { redirect: 'manual' });

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/branding/horizon-app-icon-512.png');
  });
});
