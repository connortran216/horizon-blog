const trimTrailingSlash = (value) => String(value || '').trim().replace(/\/+$/, '');

export const createSeoConfig = (env = process.env) => {
  const configuredBackend = trimTrailingSlash(env.BE_HOST);

  return {
    siteName: 'Horizon',
    siteUrl: trimTrailingSlash(env.PUBLIC_SITE_URL) || 'https://blog.connortran.io.vn',
    siteDescription:
      'Thoughtful writing about backend engineering, software architecture, technology, and personal growth.',
    locale: 'en_US',
    language: 'en',
    authorName: 'Connor Tran',
    authorSlug: 'connor-tran',
    defaultImagePath: '/branding/horizon-app-icon-512.png',
    feedPath: '/feed.xml',
    sitemapPath: '/sitemap.xml',
    backendHosts: Array.from(
      new Set([configuredBackend, 'https://blog-api.connortran.io.vn'].filter(Boolean)),
    ),
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
