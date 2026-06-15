import { describe, expect, it } from 'vitest';
import { createSeoConfig } from './config.mjs';
import {
  createArticleSchemas,
  createAuthorSchemas,
  createPageMetadata,
  createSiteSchemas,
  renderHead,
  serializeJsonLd,
} from './metadata.mjs';

const config = createSeoConfig({});
const origin = config.siteUrl;

describe('SEO metadata', () => {
  it('renders one escaped canonical and complete social metadata', () => {
    const metadata = createPageMetadata({
      config,
      origin,
      canonicalPath: '/blog/76',
      indexing: 'index-follow',
      title: 'API <Performance> & "Safety"',
      description: 'Measure <first> & optimize "second".',
      type: 'article',
      imageUrl: `${origin}/seo/post-image/76`,
      publishedTime: '2026-05-31T15:35:12.405931Z',
      modifiedTime: '2026-05-31T15:57:35.464126Z',
      author: 'Connor Tran',
      tags: ['api', 'reliability'],
      jsonLd: [{ '@context': 'https://schema.org', '@type': 'BlogPosting' }],
    });

    const head = renderHead(metadata);

    expect(head.match(/rel="canonical"/g)).toHaveLength(1);
    expect(head).toContain(
      '<link rel="canonical" href="https://blog.connortran.io.vn/blog/76" />',
    );
    expect(head).toContain('API &lt;Performance&gt; &amp; &quot;Safety&quot; | Horizon');
    expect(head).toContain('content="index,follow,max-image-preview:large"');
    expect(head).toContain('property="og:type" content="article"');
    expect(head).toContain('property="og:site_name" content="Horizon"');
    expect(head).toContain('name="twitter:card" content="summary_large_image"');
    expect(head).toContain('content="https://blog.connortran.io.vn/seo/post-image/76"');
    expect(head).not.toContain('X-Amz-');
    expect(head).toContain('property="article:tag" content="api"');
    expect(head).toContain('type="application/rss+xml"');
  });

  it('serializes JSON-LD without allowing script termination', () => {
    const serialized = serializeJsonLd({
      '@context': 'https://schema.org',
      name: '</script><script>alert("x")</script>\u2028',
    });

    expect(serialized).not.toContain('</script>');
    expect(serialized).not.toContain('<script>');
    expect(serialized).not.toContain('\u2028');
    expect(JSON.parse(serialized)).toMatchObject({
      '@context': 'https://schema.org',
      name: '</script><script>alert("x")</script>\u2028',
    });
  });

  it('builds site, article, breadcrumb, person, and profile schemas from visible facts', () => {
    const siteSchemas = createSiteSchemas({ config, origin });
    const articleSchemas = createArticleSchemas({
      config,
      origin,
      post: {
        id: 76,
        title: 'Measure APIs',
        description: 'A practical guide.',
        createdAt: '2026-05-31T15:35:12.405931Z',
        updatedAt: '2026-05-31T15:57:35.464126Z',
        author: { name: 'Connor Tran', slug: 'connor-tran' },
        tags: ['api'],
      },
    });
    const authorSchemas = createAuthorSchemas({
      config,
      origin,
      author: {
        name: 'Connor Tran',
        slug: 'connor-tran',
        bio: 'Backend engineer and writer.',
      },
    });

    expect(siteSchemas.map((schema) => schema['@type'])).toEqual(['WebSite', 'Person']);
    expect(articleSchemas.map((schema) => schema['@type'])).toEqual([
      'BlogPosting',
      'BreadcrumbList',
    ]);
    expect(articleSchemas[0]).toMatchObject({
      headline: 'Measure APIs',
      url: 'https://blog.connortran.io.vn/blog/76',
      image: 'https://blog.connortran.io.vn/seo/post-image/76',
      author: {
        '@type': 'Person',
        name: 'Connor Tran',
        url: 'https://blog.connortran.io.vn/authors/connor-tran',
      },
      publisher: {
        '@type': 'Person',
        name: 'Connor Tran',
        url: 'https://blog.connortran.io.vn/authors/connor-tran',
      },
    });
    expect(authorSchemas[0]).toMatchObject({
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: 'Connor Tran',
      },
    });
  });

  it('omits canonical for private pages and emits strict noindex', () => {
    const head = renderHead(
      createPageMetadata({
        config,
        origin,
        indexing: 'noindex-nofollow',
        title: 'Sign in',
        description: 'Private account access.',
        type: 'website',
      }),
    );

    expect(head).not.toContain('rel="canonical"');
    expect(head).toContain('content="noindex,nofollow,noarchive"');
  });
});
