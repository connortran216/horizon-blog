import { describe, expect, it } from 'vitest';
import {
  injectDocument,
  renderArchive,
  renderArticle,
  renderAuthor,
  renderErrorPage,
  renderHome,
  renderPrivateShell,
  renderStaticPage,
} from './render.mjs';

const posts = [
  {
    id: 76,
    title: 'API <Performance>',
    description: 'Measure first.',
    contentMarkdown: '# Evidence\n\nMeasure **first**, then optimize.',
    createdAt: '2026-05-31T15:35:12.405931Z',
    updatedAt: '2026-05-31T15:57:35.464126Z',
    status: 'published',
    author: { id: 1, name: 'Connor Tran', slug: 'connor-tran' },
    tags: ['api', 'system design'],
  },
];

describe('SEO semantic rendering', () => {
  it('renders home and archive with crawlable post and author links', () => {
    const home = renderHome({ posts });
    const archive = renderArchive({ posts, page: 1, total: 1, totalPages: 1 });

    for (const html of [home, archive]) {
      expect(html).toContain('<main data-seo-fallback="true">');
      expect(html).toContain('href="/blog/76"');
      expect(html).toContain('href="/authors/connor-tran"');
      expect(html).toContain('API &lt;Performance&gt;');
      expect(html).not.toContain('<script>');
    }
    expect(home).toContain('<h1>Thoughtful writing for curious readers</h1>');
    expect(archive).toContain('<h1>Horizon Blog</h1>');
  });

  it('renders a full safe article representation with visible facts', () => {
    const html = renderArticle(posts[0]);

    expect(html).toContain('<article>');
    expect(html).toContain('<h1>API &lt;Performance&gt;</h1>');
    expect(html).toContain('<h1 id="evidence">Evidence</h1>');
    expect(html).toContain('<strong>first</strong>');
    expect(html).toContain('Connor Tran');
    expect(html).toContain('May 31, 2026');
    expect(html).toContain('1 min read');
    expect(html).toContain('<li>system design</li>');
    expect(html).toContain('href="/blog"');
  });

  it('renders an author profile with biography, post links, and pagination', () => {
    const html = renderAuthor({
      id: 1,
      name: 'Connor <Tran>',
      slug: 'connor-tran',
      bio: 'Backend engineer & writer.',
      posts,
      page: 2,
      total: 3,
      limit: 1,
    });

    expect(html).toContain('<h1>Connor &lt;Tran&gt;</h1>');
    expect(html).toContain('Backend engineer &amp; writer.');
    expect(html).toContain('3 published articles');
    expect(html).toContain('href="/blog/76"');
    expect(html).toContain('href="/authors/connor-tran"');
    expect(html).toContain('href="/authors/connor-tran?page=3"');
  });

  it('renders static, private, and error fallback documents', () => {
    expect(renderStaticPage('about')).toContain('About Horizon');
    expect(renderStaticPage('contact')).toContain('canhtran210699@gmail.com');
    expect(renderStaticPage('cv')).toContain('Backend Engineer');
    expect(renderPrivateShell()).toContain('JavaScript is required for this account page');
    expect(renderErrorPage(404)).toContain('Page not found');
    expect(renderErrorPage(503)).toContain('Temporarily unavailable');
  });

  it('injects one metadata block and semantic root while preserving immediate entry loading', () => {
    const indexHtml = `<!doctype html>
<html><head>
<!--app-meta:start--><meta name="description" content="old"><!--app-meta:end-->
<title>Horizon</title>
</head><body><div id="root"></div><script type="module" crossorigin src="/assets/app.js"></script></body></html>`;
    const headHtml = `<!--app-meta:start-->
<title>Article | Horizon</title>
<link rel="canonical" href="https://example.com/blog/76" />
<!--app-meta:end-->`;
    const result = injectDocument(indexHtml, {
      headHtml,
      bodyHtml: '<main data-seo-fallback="true"><h1>Article</h1></main>',
      entryMode: 'immediate',
    });

    expect(result.match(/<title(?:\s[^>]*)?>/g)).toHaveLength(1);
    expect(result.match(/rel="canonical"/g)).toHaveLength(1);
    expect(result).toContain(
      '<div id="root"><main data-seo-fallback="true"><h1>Article</h1></main></div>',
    );
    expect(result).toContain(
      '<script type="module" crossorigin src="/assets/app.js"></script>',
    );
    expect(result).not.toContain('data-horizon-entry-loader="deferred"');
  });

  it('defers the Vite entry for public fallback documents', () => {
    const indexHtml = `<!doctype html>
<html><head><title>Horizon</title></head>
<body><div id="root"></div><script type="module" crossorigin src="/assets/app.js"></script></body></html>`;

    const result = injectDocument(indexHtml, {
      headHtml: '<title>Horizon</title>',
      bodyHtml: '<main data-seo-fallback="true"><h1>Horizon</h1></main>',
      entryMode: 'deferred',
    });

    expect(result).not.toContain(
      '<script type="module" crossorigin src="/assets/app.js"></script>',
    );
    expect(result).toContain('data-horizon-entry-loader="deferred"');
    expect(result).toContain('import(source)');
    expect(result).toContain('horizon_blog_token');
    expect(result).toContain('pointerdown');
    expect(result).toContain('keydown');
    expect(result).toContain('touchstart');
    expect(result).toContain('focusin');
    expect(result).toContain('8000');
    expect(result).toContain('data-horizon-fallback-style="true"');
    expect(result).toContain('[data-seo-fallback] li > p > a:only-child');
    expect(result).toContain('min-height: 44px');
    expect(result).not.toContain('@media (prefers-color-scheme: dark)');
    expect(result.match(/data-horizon-entry-loader="deferred"/g)).toHaveLength(1);
  });

  it('omits the Vite entry from static error documents', () => {
    const indexHtml = `<!doctype html>
<html><head><title>Horizon</title></head>
<body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>`;

    const result = injectDocument(indexHtml, {
      headHtml: '<title>Page not found</title>',
      bodyHtml: '<main data-seo-fallback="true"><h1>Page not found</h1></main>',
      entryMode: 'omit',
    });

    expect(result).not.toContain('src="/assets/app.js"');
    expect(result).not.toContain('data-horizon-entry-loader');
    expect(result).not.toContain('data-horizon-fallback-style');
  });
});
