import { buildExcerpt } from './content.mjs';
import { toCanonicalUrl, toPublicPostPath } from './urls.mjs';

const BLOG_PAGE_SIZE = 9;
const AUTHOR_PAGE_SIZE = 6;

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toIsoDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const toRssDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toUTCString();
};

const newestModifiedDate = (posts) => {
  const timestamps = posts
    .map((post) => post.updatedAt || post.createdAt)
    .map((value) => new Date(value || 0).getTime())
    .filter(Number.isFinite);
  return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : undefined;
};

const addPaginatedUrls = ({ urls, origin, basePath, posts, pageSize }) => {
  const pageCount = Math.max(1, Math.ceil(posts.length / pageSize));
  const lastModified = newestModifiedDate(posts);
  for (let page = 1; page <= pageCount; page += 1) {
    urls.push({
      location: toCanonicalUrl(origin, page === 1 ? basePath : `${basePath}?page=${page}`),
      lastModified,
    });
  }
};

export const renderRobots = (origin) => `User-agent: *
Allow: /

Sitemap: ${toCanonicalUrl(origin, '/sitemap.xml')}
`;

export const renderSitemap = ({ origin, posts }) => {
  const published = posts.filter((post) => post.status === 'published');
  const urls = [
    { location: toCanonicalUrl(origin, '/') },
    { location: toCanonicalUrl(origin, '/about') },
    { location: toCanonicalUrl(origin, '/cv') },
    { location: toCanonicalUrl(origin, '/contact') },
  ];

  addPaginatedUrls({
    urls,
    origin,
    basePath: '/blog',
    posts: published,
    pageSize: BLOG_PAGE_SIZE,
  });

  const postsByAuthor = new Map();
  for (const post of published) {
    const authorPosts = postsByAuthor.get(post.author.slug) || [];
    authorPosts.push(post);
    postsByAuthor.set(post.author.slug, authorPosts);
    urls.push({
      location: toCanonicalUrl(origin, toPublicPostPath(post.id)),
      lastModified: toIsoDate(post.updatedAt || post.createdAt),
      imageLocation: post.hasImage
        ? toCanonicalUrl(origin, `/seo/post-image/${post.id}`)
        : undefined,
    });
  }

  for (const [slug, authorPosts] of [...postsByAuthor.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    addPaginatedUrls({
      urls,
      origin,
      basePath: `/authors/${slug}`,
      posts: authorPosts,
      pageSize: AUTHOR_PAGE_SIZE,
    });
  }

  const unique = new Map(urls.map((entry) => [entry.location, entry]));
  const body = [...unique.values()]
    .map(
      ({ location, lastModified, imageLocation }) =>
        `  <url>\n    <loc>${escapeXml(location)}</loc>${lastModified ? `\n    <lastmod>${escapeXml(lastModified)}</lastmod>` : ''}${imageLocation ? `\n    <image:image>\n      <image:loc>${escapeXml(imageLocation)}</image:loc>\n    </image:image>` : ''}\n  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;
};

export const renderRss = ({ origin, posts, config }) => {
  const published = posts
    .filter((post) => post.status === 'published')
    .toSorted(
      (left, right) =>
        new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime(),
    )
    .slice(0, 50);

  const items = published
    .map((post) => {
      const url = toCanonicalUrl(origin, toPublicPostPath(post.id));
      const pubDate = toRssDate(post.createdAt);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(buildExcerpt(post.contentMarkdown, 300))}</description>
      <dc:creator>${escapeXml(post.author.name)}</dc:creator>${pubDate ? `\n      <pubDate>${escapeXml(pubDate)}</pubDate>` : ''}${post.tags.map((tag) => `\n      <category>${escapeXml(tag)}</category>`).join('')}
    </item>`;
    })
    .join('\n');

  const lastBuildDate = toRssDate(published[0]?.updatedAt || published[0]?.createdAt);
  const feedUrl = toCanonicalUrl(origin, config.feedPath);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${config.siteName} Blog`)}</title>
    <link>${escapeXml(toCanonicalUrl(origin, '/blog'))}</link>
    <description>${escapeXml(config.siteDescription)}</description>
    <language>${escapeXml(config.language)}</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />${lastBuildDate ? `\n    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>` : ''}
${items}
  </channel>
</rss>
`;
};
