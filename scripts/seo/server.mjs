import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BackendError, createBackendClient } from './backend.mjs';
import { createSeoConfig } from './config.mjs';
import { buildExcerpt } from './content.mjs';
import { renderRobots, renderRss, renderSitemap } from './feeds.mjs';
import {
  createArticleSchemas,
  createAuthorSchemas,
  createBlogSchemas,
  createPageMetadata,
  createSiteSchemas,
  renderHead,
} from './metadata.mjs';
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
import { classifyRoute, getRequestOrigin, getSafeAssetPath } from './urls.mjs';

const moduleDir = fileURLToPath(new URL('.', import.meta.url));
const defaultRootDir = resolve(moduleDir, '../..');

const MIME_TYPES = new Map([
  ['.avif', 'image/avif'],
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

const ALLOWED_PROXY_IMAGE_TYPES = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
]);
const MAX_IMAGE_REDIRECTS = 3;

const STATIC_METADATA = {
  about: {
    title: 'About Horizon and Connor Tran',
    description:
      'Learn about Horizon, Connor Tran, and the ideas behind this writing about engineering, technology, and personal growth.',
  },
  contact: {
    title: 'Contact Connor Tran',
    description:
      'Contact Connor Tran about backend engineering, software architecture, writing, or Horizon.',
  },
  cv: {
    title: 'Connor Tran - Backend Engineer CV',
    description:
      'Professional experience, projects, and technical background for Connor Tran, a backend engineer in Ho Chi Minh City.',
  },
};

const securityHeaders = (config) => ({
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'content-security-policy': `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ${config.backendHosts.join(' ')}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`,
});

const isFile = async (path) => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};

const writeResponse = (request, response, status, headers, body = '') => {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  response.writeHead(status, {
    ...headers,
    'content-length': String(payload.byteLength),
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  response.end(payload);
};

const redirectResponse = (request, response, location, config, status = 302) =>
  writeResponse(
    request,
    response,
    status,
    {
      ...securityHeaders(config),
      location,
      'cache-control': 'public, max-age=300',
      'content-type': 'text/plain; charset=utf-8',
    },
    `Redirecting to ${location}`,
  );

const withDescriptions = (posts) =>
  posts.map((post) => ({
    ...post,
    description:
      post.description || buildExcerpt(post.contentMarkdown) || 'Read this Horizon article.',
  }));

const pagePath = (basePath, page) => (page > 1 ? `${basePath}?page=${page}` : basePath);

const normalizeContentType = (value) => String(value || '').split(';', 1)[0].trim().toLowerCase();

const getAllowedImageRedirect = (location, sourceUrl, config) => {
  if (!location) return undefined;

  try {
    const target = new URL(location, sourceUrl);
    return target.protocol === 'https:' && config.allowedImageHosts.has(target.hostname)
      ? target.toString()
      : undefined;
  } catch {
    return undefined;
  }
};

const readBoundedBody = async (source, maxBytes) => {
  if (!source.body) return Buffer.alloc(0);

  const reader = source.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks, total);
};

export const createSeoServer = ({
  config,
  distDir,
  backend,
  fetchImpl = globalThis.fetch,
  logger = console,
}) => {
  const indexPromise = readFile(resolve(distDir, 'index.html'), 'utf8');

  const renderHtml = async (request, response, policy, origin) => {
    const indexHtml = await indexPromise;
    let status = 200;
    let bodyHtml;
    let metadataInput;

    try {
      if (policy.kind === 'home') {
        const result = await backend.listPublishedPostSummaries({ page: 1, limit: 9 });
        const posts = withDescriptions(result.posts);
        bodyHtml = renderHome({ posts });
        metadataInput = {
          title: config.siteName,
          description: config.siteDescription,
          canonicalPath: policy.canonicalPath,
          indexing: policy.indexing,
          type: 'website',
          jsonLd: createSiteSchemas({ config, origin }),
        };
      } else if (policy.kind === 'archive') {
        const result = await backend.listPublishedPostSummaries({
          page: policy.page,
          limit: 9,
        });
        const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
        if (policy.page > totalPages) {
          throw new BackendError('Archive page not found', { status: 404, transient: false });
        }
        const posts = withDescriptions(result.posts);
        bodyHtml = renderArchive({
          posts,
          page: policy.page,
          total: result.total,
          totalPages,
        });
        metadataInput = {
          title: policy.page > 1 ? `Blog - Page ${policy.page}` : 'Blog',
          description:
            'Browse Horizon articles about backend engineering, software architecture, technology, and personal growth.',
          canonicalPath: policy.canonicalPath,
          indexing: policy.indexing,
          type: 'website',
          previousUrl:
            policy.page > 1 ? pagePath('/blog', Math.max(1, policy.page - 1)) : undefined,
          nextUrl: policy.page < totalPages ? pagePath('/blog', policy.page + 1) : undefined,
          jsonLd: createBlogSchemas({ config, origin, posts }),
        };
      } else if (policy.kind === 'article') {
        const normalized = await backend.getPublishedPost(policy.id);
        const post = {
          ...normalized,
          description: buildExcerpt(normalized.contentMarkdown) || 'Read this Horizon article.',
        };
        bodyHtml = renderArticle(post);
        metadataInput = {
          title: post.title,
          description: post.description,
          canonicalPath: policy.canonicalPath,
          indexing: policy.indexing,
          type: 'article',
          imageUrl: `${origin}/seo/post-image/${post.id}`,
          publishedTime: post.createdAt,
          modifiedTime: post.updatedAt,
          author: post.author.name,
          tags: post.tags,
          jsonLd: createArticleSchemas({ config, origin, post }),
        };
      } else if (policy.kind === 'author') {
        const author = await backend.getAuthorBySlug(policy.slug, {
          page: policy.page,
          limit: 6,
        });
        author.posts = withDescriptions(author.posts);
        const totalPages = Math.max(1, Math.ceil(author.total / author.limit));
        bodyHtml = renderAuthor(author);
        metadataInput = {
          title:
            policy.page > 1
              ? `${author.name} - Author - Page ${policy.page}`
              : `${author.name} - Author`,
          description: author.bio || `Published writing by ${author.name} on Horizon.`,
          canonicalPath: policy.canonicalPath,
          indexing: policy.indexing,
          type: 'profile',
          previousUrl:
            policy.page > 1
              ? pagePath(`/authors/${author.slug}`, Math.max(1, policy.page - 1))
              : undefined,
          nextUrl:
            policy.page < totalPages
              ? pagePath(`/authors/${author.slug}`, policy.page + 1)
              : undefined,
          jsonLd: [
            ...createSiteSchemas({ config, origin }),
            ...createAuthorSchemas({ config, origin, author }),
          ],
        };
      } else if (policy.kind === 'static') {
        const page = STATIC_METADATA[policy.route];
        bodyHtml = renderStaticPage(policy.route);
        metadataInput = {
          ...page,
          canonicalPath: policy.canonicalPath,
          indexing: policy.indexing,
          type: 'website',
          jsonLd: createSiteSchemas({ config, origin }),
        };
      } else if (policy.kind === 'private') {
        bodyHtml = renderPrivateShell();
        metadataInput = {
          title: 'Account',
          description: 'Private Horizon account page.',
          indexing: 'noindex-nofollow',
          type: 'website',
        };
      } else {
        status = 404;
        bodyHtml = renderErrorPage(404);
        metadataInput = {
          title: 'Page Not Found',
          description: 'The requested Horizon page does not exist or is no longer public.',
          indexing: 'noindex-nofollow',
          type: 'website',
        };
      }
    } catch (error) {
      status = error instanceof BackendError && error.status === 404 ? 404 : 503;
      if (status === 503) logger.error('Failed to render SEO page:', error);
      bodyHtml = renderErrorPage(status);
      metadataInput = {
        title: status === 404 ? 'Page Not Found' : 'Temporarily Unavailable',
        description:
          status === 404
            ? 'The requested Horizon page does not exist or is no longer public.'
            : 'Horizon could not load this public page right now.',
        indexing: 'noindex-nofollow',
        type: 'website',
      };
    }

    const metadata = createPageMetadata({
      config,
      origin,
      imageUrl: `${origin}${config.defaultImagePath}`,
      ...metadataInput,
    });
    const entryMode =
      status >= 400 ? 'omit' : policy.kind === 'private' ? 'immediate' : 'deferred';
    const html = injectDocument(indexHtml, {
      headHtml: renderHead(metadata),
      bodyHtml,
      entryMode,
    });
    const cacheControl =
      status === 503
        ? 'no-store'
        : status === 404 || policy.kind === 'private'
          ? 'public, max-age=60'
          : policy.kind === 'article' || policy.kind === 'author'
            ? 'public, max-age=300, stale-while-revalidate=3600'
            : 'public, max-age=60, stale-while-revalidate=300';

    writeResponse(
      request,
      response,
      status,
      {
        ...securityHeaders(config),
        'content-type': 'text/html; charset=utf-8',
        'cache-control': cacheControl,
        ...(status === 503 ? { 'retry-after': '60' } : {}),
      },
      html,
    );
  };

  const serveAsset = async (request, response, assetPath, pathname) => {
    const fileStat = await stat(assetPath);
    const headers = {
      ...securityHeaders(config),
      'content-type': MIME_TYPES.get(extname(assetPath).toLowerCase()) || 'application/octet-stream',
      'content-length': String(fileStat.size),
      'cache-control': /^\/assets\/.+-[a-zA-Z0-9_-]{6,}\./.test(pathname)
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=3600',
    };
    response.writeHead(200, headers);
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(assetPath).pipe(response);
  };

  const servePostImage = async (request, response, policy) => {
    try {
      const sourceUrl = await backend.resolvePostImageSource(policy.id);
      if (!sourceUrl) {
        redirectResponse(request, response, config.defaultImagePath, config);
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
      let source;
      try {
        let currentUrl = sourceUrl;
        for (let redirectCount = 0; redirectCount <= MAX_IMAGE_REDIRECTS; redirectCount += 1) {
          source = await fetchImpl(currentUrl, {
            redirect: 'manual',
            headers: { accept: 'image/avif,image/webp,image/png,image/jpeg,image/*' },
            signal: controller.signal,
          });
          if (source.status < 300 || source.status >= 400) break;

          const nextUrl = getAllowedImageRedirect(
            source.headers.get('location'),
            currentUrl,
            config,
          );
          if (!nextUrl || redirectCount === MAX_IMAGE_REDIRECTS) {
            redirectResponse(request, response, config.defaultImagePath, config);
            return;
          }
          currentUrl = nextUrl;
        }
      } finally {
        clearTimeout(timeout);
      }
      if (!source.ok) {
        if (source.status === 404) {
          redirectResponse(request, response, config.defaultImagePath, config);
          return;
        }
        throw new BackendError(`Image source returned ${source.status}`);
      }

      const contentType = normalizeContentType(source.headers.get('content-type'));
      const declaredLength = Number(source.headers.get('content-length') || 0);
      if (
        !ALLOWED_PROXY_IMAGE_TYPES.has(contentType) ||
        declaredLength > config.maxImageBytes
      ) {
        redirectResponse(request, response, config.defaultImagePath, config);
        return;
      }

      const body = await readBoundedBody(source, config.maxImageBytes);
      if (!body) {
        redirectResponse(request, response, config.defaultImagePath, config);
        return;
      }

      writeResponse(
        request,
        response,
        200,
        {
          ...securityHeaders(config),
          'content-type': contentType,
          ...(contentType === 'image/svg+xml'
            ? {
              'content-security-policy':
                'default-src \'none\'; style-src \'unsafe-inline\'; sandbox',
            }
            : {}),
          'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
        body,
      );
    } catch (error) {
      const status = error instanceof BackendError && error.status === 404 ? 404 : 503;
      if (status === 503) logger.error('Failed to serve SEO post image:', error);
      writeResponse(
        request,
        response,
        status,
        {
          ...securityHeaders(config),
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store',
          ...(status === 503 ? { 'retry-after': '60' } : {}),
        },
        status === 404 ? 'Post image not found' : 'Post image temporarily unavailable',
      );
    }
  };

  return createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      writeResponse(
        request,
        response,
        405,
        {
          ...securityHeaders(config),
          allow: 'GET, HEAD',
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store',
        },
        'Method Not Allowed',
      );
      return;
    }

    try {
      const url = new URL(request.url || '/', 'http://localhost');
      const origin = getRequestOrigin(request, config);
      if (url.pathname === '/index.html') {
        redirectResponse(request, response, '/', config, 301);
        return;
      }
      const assetPath = getSafeAssetPath(distDir, url.pathname);
      if (assetPath && (await isFile(assetPath))) {
        await serveAsset(request, response, assetPath, url.pathname);
        return;
      }

      const policy = classifyRoute(url);
      if (policy.kind === 'robots') {
        writeResponse(
          request,
          response,
          200,
          {
            ...securityHeaders(config),
            'content-type': 'text/plain; charset=utf-8',
            'cache-control': 'public, max-age=300',
          },
          renderRobots(origin),
        );
        return;
      }

      if (policy.kind === 'sitemap' || policy.kind === 'feed') {
        try {
          const posts = await backend.listAllPublishedPosts();
          const isSitemap = policy.kind === 'sitemap';
          writeResponse(
            request,
            response,
            200,
            {
              ...securityHeaders(config),
              'content-type': isSitemap
                ? 'application/xml; charset=utf-8'
                : 'application/rss+xml; charset=utf-8',
              'cache-control': 'public, max-age=300, stale-while-revalidate=3600',
            },
            isSitemap
              ? renderSitemap({ origin, posts })
              : renderRss({ origin, posts, config }),
          );
        } catch (error) {
          logger.error(`Failed to render ${policy.kind}:`, error);
          writeResponse(
            request,
            response,
            503,
            {
              ...securityHeaders(config),
              'content-type': 'text/plain; charset=utf-8',
              'cache-control': 'no-store',
              'retry-after': '60',
            },
            'Temporarily unavailable',
          );
        }
        return;
      }

      if (policy.kind === 'image') {
        await servePostImage(request, response, policy);
        return;
      }

      if (policy.kind === 'asset') {
        writeResponse(
          request,
          response,
          404,
          {
            ...securityHeaders(config),
            'content-type': 'text/plain; charset=utf-8',
            'cache-control': 'public, max-age=60',
          },
          'Asset not found',
        );
        return;
      }

      await renderHtml(request, response, policy, origin);
    } catch (error) {
      logger.error('Failed to serve request:', error);
      writeResponse(
        request,
        response,
        500,
        {
          ...securityHeaders(config),
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store',
        },
        'Internal Server Error',
      );
    }
  });
};

export const startSeoServer = ({
  config = createSeoConfig(process.env),
  distDir = resolve(defaultRootDir, 'dist'),
  backend = createBackendClient(config),
  fetchImpl = globalThis.fetch,
  logger = console,
  port = Number(process.env.PORT || 3000),
} = {}) => {
  const server = createSeoServer({ config, distDir, backend, fetchImpl, logger });
  server.listen(port, '0.0.0.0', () => {
    logger.info(`Serving Horizon Blog with SEO rendering on port ${port}`);
  });
  return server;
};
