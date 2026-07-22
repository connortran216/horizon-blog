import { describe, expect, it } from 'vitest';
import { createSeoConfig } from './config.mjs';
import {
  classifyRoute,
  firstForwardedValue,
  getRequestOrigin,
  getSafeAssetPath,
  slugify,
  toCanonicalUrl,
  toPublicPostPath,
} from './urls.mjs';

const articlePath = toPublicPostPath(76);

describe('SEO URL policy', () => {
  it('uses one configured canonical origin even with comma-separated proxy headers', () => {
    const config = createSeoConfig({});
    const request = {
      headers: {
        host: 'internal:3000',
        'x-forwarded-host': 'internal, blog.connortran.io.vn',
        'x-forwarded-proto': 'http, https',
      },
    };

    expect(firstForwardedValue('http, https')).toBe('http');
    expect(getRequestOrigin(request, config)).toBe('https://blog.connortran.io.vn');
    expect(getRequestOrigin(request, createSeoConfig({ PUBLIC_SITE_URL: 'http://localhost:3100/' }))).toBe(
      'http://localhost:3100',
    );
  });

  it('builds safe slugs and absolute canonical URLs', () => {
    expect(slugify(' Connor Trần  ')).toBe('connor-tran');
    expect(toCanonicalUrl('https://blog.connortran.io.vn', '/blog?page=2')).toBe(
      'https://blog.connortran.io.vn/blog?page=2',
    );
  });

  it('classifies clean public and discovery routes as indexable', () => {
    expect(classifyRoute(new URL('https://example.com/'))).toMatchObject({
      kind: 'home',
      indexing: 'index-follow',
      canonicalPath: '/',
    });
    expect(classifyRoute(new URL(`https://example.com${articlePath}`))).toMatchObject({
      kind: 'article',
      id: '76',
      indexing: 'index-follow',
      canonicalPath: articlePath,
    });
    expect(classifyRoute(new URL('https://example.com/blog/76'))).toMatchObject({
      kind: 'legacy-article',
      id: '76',
      indexing: 'noindex-nofollow',
      canonicalPath: articlePath,
    });
    expect(classifyRoute(new URL('https://example.com/authors/connor-tran?page=2'))).toMatchObject({
      kind: 'author',
      slug: 'connor-tran',
      page: 2,
      indexing: 'index-follow',
      canonicalPath: '/authors/connor-tran?page=2',
    });
    expect(classifyRoute(new URL('https://example.com/sitemap.xml'))).toMatchObject({
      kind: 'sitemap',
      indexing: 'noindex-nofollow',
    });
  });

  it('consolidates filtered and tracking variants without indexing them', () => {
    expect(classifyRoute(new URL('https://example.com/blog?query=api&page=3'))).toMatchObject({
      kind: 'archive',
      indexing: 'noindex-follow',
      canonicalPath: '/blog',
      page: 3,
    });
    expect(
      classifyRoute(new URL(`https://example.com${articlePath}?utm_source=test`)),
    ).toMatchObject({
      kind: 'article',
      indexing: 'noindex-follow',
      canonicalPath: articlePath,
    });
    expect(classifyRoute(new URL('https://example.com/about?ref=footer'))).toMatchObject({
      kind: 'static',
      indexing: 'noindex-follow',
      canonicalPath: '/about',
    });
  });

  it('marks private routes noindex and unknown or invalid routes missing', () => {
    for (const pathname of [
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/oauth/authorize',
      '/blog-editor',
      '/profile/connor',
      '/analytics',
      '/analytics/blog/76',
    ]) {
      expect(classifyRoute(new URL(`https://example.com${pathname}`))).toMatchObject({
        kind: 'private',
        indexing: 'noindex-nofollow',
      });
    }

    for (const pathname of ['/blog/abc', '/authors/Bad Slug', '/blog?page=0', '/unknown']) {
      expect(classifyRoute(new URL(`https://example.com${pathname}`))).toMatchObject({
        kind: 'not-found',
        indexing: 'noindex-nofollow',
      });
    }

    expect(classifyRoute(new URL('https://example.com/missing.png'))).toMatchObject({
      kind: 'asset',
      indexing: 'noindex-nofollow',
    });
  });

  it('keeps resolved asset paths inside dist', () => {
    expect(getSafeAssetPath('/tmp/dist', '/assets/app.js')).toBe('/tmp/dist/assets/app.js');
    expect(getSafeAssetPath('/tmp/dist', '/../secret')).toBeUndefined();
    expect(getSafeAssetPath('/tmp/dist', '/%2e%2e/secret')).toBeUndefined();
  });
});
