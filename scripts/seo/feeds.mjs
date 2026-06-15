import { buildExcerpt } from './content.mjs';
import { toCanonicalUrl } from './urls.mjs';

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

export const renderRobots = (origin) => `User-agent: *
Allow: /

Sitemap: ${toCanonicalUrl(origin, '/sitemap.xml')}
`;

export const renderSitemap = ({ origin, posts }) => {
  const urls = [
    { location: toCanonicalUrl(origin, '/') },
    { location: toCanonicalUrl(origin, '/blog') },
    { location: toCanonicalUrl(origin, '/about') },
    { location: toCanonicalUrl(origin, '/cv') },
    { location: toCanonicalUrl(origin, '/contact') },
  ];

  const authorSlugs = new Set();
  for (const post of posts) {
    if (post.status !== 'published') continue;
    authorSlugs.add(post.author.slug);
    urls.push({
      location: toCanonicalUrl(origin, `/blog/${post.id}`),
      lastModified: toIsoDate(post.updatedAt || post.createdAt),
    });
  }

  for (const slug of [...authorSlugs].sort()) {
    urls.push({ location: toCanonicalUrl(origin, `/authors/${slug}`) });
  }

  const unique = new Map(urls.map((entry) => [entry.location, entry]));
  const body = [...unique.values()]
    .map(
      ({ location, lastModified }) =>
        `  <url>\n    <loc>${escapeXml(location)}</loc>${lastModified ? `\n    <lastmod>${escapeXml(lastModified)}</lastmod>` : ''}\n  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
      const url = toCanonicalUrl(origin, `/blog/${post.id}`);
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
