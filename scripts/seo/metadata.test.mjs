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
import { toPublicPostPath } from './urls.mjs';

const config = createSeoConfig({});
const origin = config.siteUrl;
const articlePath = toPublicPostPath(76);

describe('SEO metadata', () => {
  it('renders one escaped canonical and complete social metadata', () => {
    const metadata = createPageMetadata({
      config,
      origin,
      canonicalPath: articlePath,
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

    expect(head.match(/data-horizon-seo="true"/g)?.length).toBeGreaterThan(10);
    expect(head.match(/rel="canonical"/g)).toHaveLength(1);
    expect(head).toContain(
      `rel="canonical" href="https://blog.connortran.io.vn${articlePath}"`,
    );
    expect(head).toContain('API &lt;Performance&gt; &amp; &quot;Safety&quot; | Horizon');
    expect(head).toContain('content="index,follow,max-image-preview:large"');
    expect(head).toContain('property="og:type" content="article"');
    expect(head).toContain('property="og:site_name" content="Horizon"');
    expect(head).toContain('name="twitter:card" content="summary_large_image"');
    expect(head).toContain('content="https://blog.connortran.io.vn/seo/post-image/76"');
    expect(head).toContain(
      'property="og:image:alt" content="API &lt;Performance&gt; &amp; &quot;Safety&quot;"',
    );
    expect(head).toContain(
      'name="twitter:image:alt" content="API &lt;Performance&gt; &amp; &quot;Safety&quot;"',
    );
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
        hasImage: true,
        author: { name: 'Connor Tran', slug: 'connor-tran' },
        tags: ['api'],
      },
    });
    const authorSchemas = createAuthorSchemas({
      config,
      origin,
      author: {
        id: 1,
        name: 'Connor Tran',
        slug: 'connor-tran',
        bio: 'Backend engineer and writer.',
        total: 1,
        posts: [
          {
            id: 76,
            title: 'Measure APIs',
            createdAt: '2026-05-31T15:35:12.405931Z',
          },
        ],
      },
    });

    expect(siteSchemas.map((schema) => schema['@type'])).toEqual(['WebSite', 'Person']);
    expect(siteSchemas[1]).toMatchObject({
      '@id': 'https://blog.connortran.io.vn/authors/connor-tran#person',
      name: 'Connor Tran',
      alternateName: 'Tran Tuan Canh',
      image: 'https://minio.connortran.io.vn/horizon-blog-public-bucket/connortran-avatar.jpg',
      sameAs: [
        'https://github.com/connortran216',
        'https://www.linkedin.com/in/c%E1%BA%A3nh-tr%E1%BA%A7n-tu%E1%BA%A5n-b57564162/',
      ],
    });
    expect(articleSchemas.map((schema) => schema['@type'])).toEqual([
      'BlogPosting',
      'BreadcrumbList',
    ]);
    expect(articleSchemas[0]).toMatchObject({
      headline: 'Measure APIs',
      url: `https://blog.connortran.io.vn${articlePath}`,
      image: 'https://blog.connortran.io.vn/seo/post-image/76',
      author: {
        '@type': 'Person',
        '@id': 'https://blog.connortran.io.vn/authors/connor-tran#person',
        name: 'Connor Tran',
        url: 'https://blog.connortran.io.vn/authors/connor-tran',
      },
      publisher: {
        '@type': 'Person',
        '@id': 'https://blog.connortran.io.vn/authors/connor-tran#person',
        name: 'Connor Tran',
        url: 'https://blog.connortran.io.vn/authors/connor-tran',
        image:
          'https://minio.connortran.io.vn/horizon-blog-public-bucket/connortran-avatar.jpg',
      },
    });
    expect(authorSchemas[0]).toMatchObject({
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: 'Connor Tran',
        identifier: '1',
        image:
          'https://minio.connortran.io.vn/horizon-blog-public-bucket/connortran-avatar.jpg',
        agentInteractionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/WriteAction',
          userInteractionCount: 1,
        },
      },
      hasPart: [
        {
          '@type': 'Article',
          headline: 'Measure APIs',
          url: `https://blog.connortran.io.vn${articlePath}`,
          datePublished: '2026-05-31T15:35:12.405931Z',
        },
      ],
    });
  });

  it('omits article structured image when the post has no representative image', () => {
    const [article] = createArticleSchemas({
      config,
      origin,
      post: {
        id: 77,
        title: 'Text-only article',
        description: 'No image in this article.',
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
        hasImage: false,
        author: { name: 'Connor Tran', slug: 'connor-tran' },
        tags: [],
      },
    });

    expect(article).not.toHaveProperty('image');
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
