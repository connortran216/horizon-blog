import { resolve, sep } from 'node:path';

const PRIVATE_PATHS = new Set([
  '/login',
  '/login/callback',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/oauth/authorize',
  '/blog-editor',
  '/analytics',
]);

const STATIC_PATHS = new Set(['/about', '/contact', '/cv']);
const TRACKING_QUERY = /^(utm_.+|fbclid|gclid|ref)$/i;

export const firstForwardedValue = (value) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw || '')
    .split(',')[0]
    .trim();
};

export const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getRequestOrigin = (_request, config) => config.siteUrl;

export const toCanonicalUrl = (origin, canonicalPath) =>
  new URL(canonicalPath, `${String(origin).replace(/\/+$/, '')}/`).toString();

const noindexForQuery = (searchParams, allowedKeys = new Set()) => {
  for (const key of searchParams.keys()) {
    if (!allowedKeys.has(key) || TRACKING_QUERY.test(key)) {
      return true;
    }
  }
  return false;
};

const parsePage = (searchParams) => {
  const values = searchParams.getAll('page');
  if (values.length === 0) return { page: 1, valid: true };
  if (values.length !== 1 || !/^\d+$/.test(values[0])) return { page: 1, valid: false };

  const page = Number(values[0]);
  return { page, valid: Number.isSafeInteger(page) && page > 0 };
};

const canonicalPagePath = (pathname, page) => (page > 1 ? `${pathname}?page=${page}` : pathname);

const decodePathname = (pathname) => {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
};

export const classifyRoute = (url) => {
  const pathname = decodePathname(url.pathname);
  if (!pathname || pathname.includes('\0')) {
    return { kind: 'not-found', indexing: 'noindex-nofollow', canonicalPath: undefined };
  }

  if (pathname === '/robots.txt') {
    return { kind: 'robots', indexing: 'noindex-nofollow', canonicalPath: undefined };
  }
  if (pathname === '/sitemap.xml') {
    return { kind: 'sitemap', indexing: 'noindex-nofollow', canonicalPath: undefined };
  }
  if (pathname === '/feed.xml') {
    return { kind: 'feed', indexing: 'noindex-nofollow', canonicalPath: undefined };
  }

  const imageMatch = pathname.match(/^\/seo\/post-image\/(\d+)\/?$/);
  if (imageMatch && Number(imageMatch[1]) > 0) {
    return {
      kind: 'image',
      id: imageMatch[1],
      indexing: 'noindex-nofollow',
      canonicalPath: undefined,
    };
  }

  if (
    PRIVATE_PATHS.has(pathname) ||
    pathname.startsWith('/profile/') ||
    pathname.startsWith('/analytics/') ||
    pathname.startsWith('/blog-editor/')
  ) {
    return { kind: 'private', indexing: 'noindex-nofollow', canonicalPath: undefined };
  }

  if (pathname === '/') {
    return {
      kind: 'home',
      indexing: url.search ? 'noindex-follow' : 'index-follow',
      canonicalPath: '/',
    };
  }

  if (pathname === '/blog' || pathname === '/blog/') {
    const { page, valid } = parsePage(url.searchParams);
    if (!valid) {
      return { kind: 'not-found', indexing: 'noindex-nofollow', canonicalPath: undefined };
    }

    const duplicate = noindexForQuery(url.searchParams, new Set(['page']));
    return {
      kind: 'archive',
      page,
      indexing: duplicate ? 'noindex-follow' : 'index-follow',
      canonicalPath: duplicate ? '/blog' : canonicalPagePath('/blog', page),
    };
  }

  const articleMatch = pathname.match(/^\/blog\/(\d+)\/?$/);
  if (articleMatch && Number(articleMatch[1]) > 0) {
    return {
      kind: 'article',
      id: articleMatch[1],
      indexing: url.search ? 'noindex-follow' : 'index-follow',
      canonicalPath: `/blog/${articleMatch[1]}`,
    };
  }

  const authorMatch = pathname.match(/^\/authors\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
  if (authorMatch) {
    const { page, valid } = parsePage(url.searchParams);
    if (!valid) {
      return { kind: 'not-found', indexing: 'noindex-nofollow', canonicalPath: undefined };
    }

    const basePath = `/authors/${authorMatch[1]}`;
    const duplicate = noindexForQuery(url.searchParams, new Set(['page']));
    return {
      kind: 'author',
      slug: authorMatch[1],
      page,
      indexing: duplicate ? 'noindex-follow' : 'index-follow',
      canonicalPath: duplicate ? basePath : canonicalPagePath(basePath, page),
    };
  }

  if (STATIC_PATHS.has(pathname)) {
    return {
      kind: 'static',
      route: pathname.slice(1),
      indexing: url.search ? 'noindex-follow' : 'index-follow',
      canonicalPath: pathname,
    };
  }

  if (/\.[a-z0-9]{1,12}$/i.test(pathname)) {
    return { kind: 'asset', indexing: 'noindex-nofollow', canonicalPath: undefined };
  }

  return { kind: 'not-found', indexing: 'noindex-nofollow', canonicalPath: undefined };
};

export const getSafeAssetPath = (distDir, pathname) => {
  const decoded = decodePathname(pathname);
  if (!decoded || decoded.includes('\0')) return undefined;

  const root = resolve(distDir);
  const assetPath = resolve(root, `.${decoded.startsWith('/') ? decoded : `/${decoded}`}`);
  return assetPath === root || assetPath.startsWith(`${root}${sep}`) ? assetPath : undefined;
};
