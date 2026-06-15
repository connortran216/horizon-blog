import { toCanonicalUrl } from './urls.mjs';

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const serializeJsonLd = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

const absoluteUrl = (origin, value) => {
  if (!value) return undefined;
  try {
    return new URL(value, `${origin}/`).toString();
  } catch {
    return undefined;
  }
};

const stableImageUrl = (origin, imageUrl, config) => {
  const candidate = absoluteUrl(origin, imageUrl);
  if (!candidate || /[?&]X-Amz-/i.test(candidate)) {
    return absoluteUrl(origin, config.defaultImagePath);
  }
  return candidate;
};

const robotsContent = (indexing) => {
  if (indexing === 'index-follow') return 'index,follow,max-image-preview:large';
  if (indexing === 'noindex-follow') return 'noindex,follow,noarchive';
  return 'noindex,nofollow,noarchive';
};

export const createPageMetadata = ({
  config,
  origin,
  canonicalPath,
  indexing,
  title,
  description,
  type = 'website',
  imageUrl,
  publishedTime,
  modifiedTime,
  author,
  tags = [],
  previousUrl,
  nextUrl,
  jsonLd = [],
}) => ({
  title: title === config.siteName ? title : `${title} | ${config.siteName}`,
  socialTitle: title,
  description,
  canonicalUrl: canonicalPath ? toCanonicalUrl(origin, canonicalPath) : undefined,
  robots: robotsContent(indexing),
  type,
  imageUrl: stableImageUrl(origin, imageUrl, config),
  publishedTime,
  modifiedTime,
  author,
  tags,
  previousUrl: absoluteUrl(origin, previousUrl),
  nextUrl: absoluteUrl(origin, nextUrl),
  feedUrl: toCanonicalUrl(origin, config.feedPath),
  siteName: config.siteName,
  locale: config.locale,
  jsonLd,
});

export const createSiteSchemas = ({ config, origin }) => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: config.siteName,
    description: config.siteDescription,
    inLanguage: config.language,
    publisher: { '@id': `${origin}/#person` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${origin}/#person`,
    name: config.authorName,
    url: toCanonicalUrl(origin, `/authors/${config.authorSlug}`),
  },
];

export const createBlogSchemas = ({ config, origin, posts = [] }) => [
  ...createSiteSchemas({ config, origin }),
  {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${origin}/blog#blog`,
    url: `${origin}/blog`,
    name: `${config.siteName} Blog`,
    description: config.siteDescription,
    inLanguage: config.language,
    publisher: { '@id': `${origin}/#person` },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: toCanonicalUrl(origin, `/blog/${post.id}`),
    })),
  },
];

export const createArticleSchemas = ({ config, origin, post }) => {
  const articleUrl = toCanonicalUrl(origin, `/blog/${post.id}`);
  const authorUrl = toCanonicalUrl(origin, `/authors/${post.author.slug}`);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${articleUrl}#article`,
      url: articleUrl,
      mainEntityOfPage: articleUrl,
      headline: post.title,
      description: post.description,
      image: toCanonicalUrl(origin, `/seo/post-image/${post.id}`),
      datePublished: post.createdAt,
      dateModified: post.updatedAt || post.createdAt,
      inLanguage: config.language,
      author: {
        '@type': 'Person',
        name: post.author.name,
        url: authorUrl,
      },
      publisher: {
        '@type': 'Person',
        name: config.authorName,
        url: toCanonicalUrl(origin, `/authors/${config.authorSlug}`),
      },
      keywords: post.tags,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${origin}/blog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: articleUrl,
        },
      ],
    },
  ];
};

export const createAuthorSchemas = ({ config, origin, author }) => {
  const authorUrl = toCanonicalUrl(origin, `/authors/${author.slug}`);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      '@id': `${authorUrl}#profile`,
      url: authorUrl,
      name: `${author.name} - Author`,
      description: author.bio || `Published writing by ${author.name}.`,
      inLanguage: config.language,
      mainEntity: {
        '@type': 'Person',
        '@id': `${authorUrl}#person`,
        name: author.name,
        url: authorUrl,
        description: author.bio || undefined,
      },
    },
  ];
};

const renderMeta = (name, content, property = false) =>
  content
    ? `<meta ${property ? 'property' : 'name'}="${escapeHtml(name)}" content="${escapeHtml(content)}" />`
    : undefined;

export const renderHead = (metadata) => {
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    renderMeta('description', metadata.description),
    renderMeta('robots', metadata.robots),
    metadata.canonicalUrl
      ? `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`
      : undefined,
    metadata.previousUrl
      ? `<link rel="prev" href="${escapeHtml(metadata.previousUrl)}" />`
      : undefined,
    metadata.nextUrl ? `<link rel="next" href="${escapeHtml(metadata.nextUrl)}" />` : undefined,
    `<link rel="alternate" type="application/rss+xml" title="${escapeHtml(metadata.siteName)} RSS Feed" href="${escapeHtml(metadata.feedUrl)}" />`,
    renderMeta('og:site_name', metadata.siteName, true),
    renderMeta('og:locale', metadata.locale, true),
    renderMeta('og:title', metadata.socialTitle, true),
    renderMeta('og:description', metadata.description, true),
    renderMeta('og:type', metadata.type, true),
    renderMeta('og:url', metadata.canonicalUrl, true),
    renderMeta('og:image', metadata.imageUrl, true),
    renderMeta('twitter:card', 'summary_large_image'),
    renderMeta('twitter:title', metadata.socialTitle),
    renderMeta('twitter:description', metadata.description),
    renderMeta('twitter:image', metadata.imageUrl),
    renderMeta('article:published_time', metadata.publishedTime, true),
    renderMeta('article:modified_time', metadata.modifiedTime, true),
    renderMeta('article:author', metadata.author, true),
    ...metadata.tags.map((tag) => renderMeta('article:tag', tag, true)),
    ...metadata.jsonLd.map(
      (schema) => `<script type="application/ld+json">${serializeJsonLd(schema)}</script>`,
    ),
  ].filter(Boolean);

  return `<!--app-meta:start-->\n    ${tags.join('\n    ')}\n    <!--app-meta:end-->`;
};
