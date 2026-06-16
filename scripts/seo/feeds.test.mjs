import { describe, expect, it } from 'vitest';
import { createSeoConfig } from './config.mjs';
import { renderRobots, renderRss, renderSitemap } from './feeds.mjs';

const config = createSeoConfig({});
const origin = config.siteUrl;
const posts = [
  {
    id: 2,
    title: 'New <Post>',
    contentMarkdown: 'New & useful writing.\n\n![cover](media://37)',
    hasImage: true,
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-11T10:00:00Z',
    status: 'published',
    author: { id: 1, name: 'Connor Tran', slug: 'connor-tran' },
    tags: ['api', 'reliability'],
  },
  {
    id: 1,
    title: 'Older Post',
    contentMarkdown: 'Older writing.',
    hasImage: false,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
    status: 'published',
    author: { id: 1, name: 'Connor Tran', slug: 'connor-tran' },
    tags: [],
  },
];

describe('SEO discovery documents', () => {
  it('renders crawler policy as plain directives with one sitemap', () => {
    const robots = renderRobots(origin);

    expect(robots).toBe(`User-agent: *
Allow: /

Sitemap: https://blog.connortran.io.vn/sitemap.xml
`);
    expect(robots).not.toContain('<html');
  });

  it('renders unique canonical public URLs and article modification dates in sitemap XML', () => {
    const sitemap = renderSitemap({ origin, posts });

    expect(sitemap).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(sitemap).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    for (const path of ['/', '/blog', '/about', '/cv', '/contact', '/authors/connor-tran']) {
      expect(sitemap).toContain(`<loc>${origin}${path}</loc>`);
    }
    expect(sitemap.match(/<loc>https:\/\/blog\.connortran\.io\.vn\/blog\/2<\/loc>/g)).toHaveLength(1);
    expect(sitemap.match(/<loc>https:\/\/blog\.connortran\.io\.vn\/blog\/1<\/loc>/g)).toHaveLength(1);
    expect(sitemap).toContain('<lastmod>2026-06-11T10:00:00.000Z</lastmod>');
    expect(sitemap).toContain(
      '<image:loc>https://blog.connortran.io.vn/seo/post-image/2</image:loc>',
    );
    expect(sitemap).not.toContain('<image:title>');
    expect(sitemap).not.toContain('/seo/post-image/1');
    expect(sitemap).not.toContain('/login');
    expect(sitemap).not.toMatch(/<loc>[^<]*(?:utm_|q=|tags=)/);
    expect(sitemap).not.toContain('<!doctype html>');
  });

  it('includes every canonical archive and author pagination page', () => {
    const paginatedPosts = Array.from({ length: 19 }, (_, index) => ({
      ...posts[0],
      id: index + 1,
      updatedAt:
        index === 0
          ? '2026-06-30T10:00:00Z'
          : `2026-06-${String((index % 9) + 1).padStart(2, '0')}T10:00:00Z`,
      author:
        index < 13
          ? { id: 1, name: 'Connor Tran', slug: 'connor-tran' }
          : { id: 2, name: 'Ada Lovelace', slug: 'ada-lovelace' },
    }));

    const sitemap = renderSitemap({ origin, posts: paginatedPosts });

    expect(sitemap).toContain(`<loc>${origin}/blog?page=2</loc>`);
    expect(sitemap).toContain(`<loc>${origin}/blog?page=3</loc>`);
    expect(sitemap).toContain(`<loc>${origin}/authors/connor-tran?page=2</loc>`);
    expect(sitemap).toContain(`<loc>${origin}/authors/connor-tran?page=3</loc>`);
    expect(sitemap).not.toContain(`${origin}/authors/ada-lovelace?page=2`);
    expect(sitemap).toContain(
      `<loc>${origin}/blog?page=2</loc>\n    <lastmod>2026-06-30T10:00:00.000Z</lastmod>`,
    );
    expect(sitemap).toContain(
      `<loc>${origin}/authors/connor-tran?page=3</loc>\n    <lastmod>2026-06-30T10:00:00.000Z</lastmod>`,
    );
  });

  it('renders newest-first RSS entries with stable canonical links and escaped text', () => {
    const rss = renderRss({ origin, posts, config });

    expect(rss).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(rss).toContain('<rss version="2.0"');
    expect(rss).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
    expect(rss.indexOf('/blog/2')).toBeLessThan(rss.indexOf('/blog/1'));
    expect(rss).toContain('<title>New &lt;Post&gt;</title>');
    expect(rss).toContain('<description>New &amp; useful writing.</description>');
    expect(rss).toContain('<guid isPermaLink="true">https://blog.connortran.io.vn/blog/2</guid>');
    expect(rss).toContain('<dc:creator>Connor Tran</dc:creator>');
    expect(rss).not.toContain('<author>Connor Tran</author>');
    expect(rss).toContain('<category>api</category>');
    expect(rss).not.toContain('X-Amz-');
    expect(rss).not.toContain('/analytics');
  });
});
