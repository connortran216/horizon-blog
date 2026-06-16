const trimTrailingSlash = (value) => String(value || '').trim().replace(/\/+$/, '');

const sameOrigin = (left, right) => {
  try {
    return new URL(left).origin === new URL(right).origin;
  } catch {
    return false;
  }
};

export const createSeoConfig = (env = process.env) => {
  const configuredBackend = trimTrailingSlash(env.BE_HOST);
  const siteUrl = trimTrailingSlash(env.PUBLIC_SITE_URL) || 'https://blog.connortran.io.vn';
  const backendHosts = [configuredBackend, 'https://blog-api.connortran.io.vn'].filter(
    (host) => host && !sameOrigin(host, siteUrl),
  );

  return {
    siteName: 'Horizon',
    siteUrl,
    siteDescription:
      'Thoughtful writing about backend engineering, software architecture, technology, and personal growth.',
    locale: 'en_US',
    language: 'en',
    authorName: 'Connor Tran',
    authorAlternateName: 'Tran Tuan Canh',
    authorSlug: 'connor-tran',
    authorImageUrl:
      'https://minio.connortran.io.vn/horizon-blog-public-bucket/connortran-avatar.jpg',
    authorSameAs: [
      'https://github.com/connortran216',
      'https://www.linkedin.com/in/c%E1%BA%A3nh-tr%E1%BA%A7n-tu%E1%BA%A5n-b57564162/',
    ],
    defaultImagePath: '/branding/horizon-app-icon-512.png',
    feedPath: '/feed.xml',
    sitemapPath: '/sitemap.xml',
    backendHosts: Array.from(new Set(backendHosts)),
    requestTimeoutMs: Number(env.SEO_BACKEND_TIMEOUT_MS || 8000),
    cacheTtlMs: Number(env.SEO_CACHE_TTL_MS || 5 * 60 * 1000),
    staleTtlMs: Number(env.SEO_STALE_TTL_MS || 60 * 60 * 1000),
    maxImageBytes: Number(env.SEO_MAX_IMAGE_BYTES || 10 * 1024 * 1024),
    allowedImageHosts: new Set([
      'blog.connortran.io.vn',
      'minio.connortran.io.vn',
    ]),
  };
};
