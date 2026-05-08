import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const indexPath = join(distDir, 'index.html');

const port = Number(process.env.PORT || 3000);
const beHost = (process.env.BE_HOST || 'https://blog-api.connortran.io.vn').replace(/\/+$/, '');
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '');
const defaultDescription =
  'A personal blog for thoughtful writing about life, experience, and technology.';
const defaultImagePath = '/branding/horizon-app-icon-512.png';
const metadataCacheTtlMs = Number(process.env.OG_METADATA_CACHE_TTL_MS || 5 * 60 * 1000);
const metadataCache = new Map();

const mimeTypes = new Map([
  ['.avif', 'image/avif'],
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
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

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const stripMarkdown = (markdown) =>
  String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[-#>*_~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildExcerpt = (markdown, maxLength = 180) => {
  const text = stripMarkdown(markdown);
  if (!text) return defaultDescription;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
};

const extractFirstImageUrl = (markdown) => {
  if (!markdown) return undefined;

  const markdownMatch = markdown.match(/!\[[^\]]*]\(([^)]+)\)/);
  if (markdownMatch?.[1]) {
    const raw = markdownMatch[1].trim();
    const urlMatch = raw.match(/^<([^>]+)>|^(\S+)/);
    const markdownUrl = urlMatch?.[1] || urlMatch?.[2];
    if (markdownUrl) return markdownUrl;
  }

  const htmlMatch = markdown.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return htmlMatch?.[1];
};

const getRequestOrigin = (request) => {
  if (publicSiteUrl) return publicSiteUrl;

  const forwardedProto = request.headers['x-forwarded-proto'];
  const forwardedHost = request.headers['x-forwarded-host'];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  const host =
    (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || request.headers.host;

  return `${proto || 'https'}://${host || 'blog.connortran.io.vn'}`;
};

const toAbsoluteUrl = (value, origin) => {
  if (!value) return undefined;

  const trimmed = String(value).trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return `${origin}${trimmed}`;

  return undefined;
};

const resolveMediaToken = async (imageUrl) => {
  const mediaMatch = imageUrl?.match(/^media:\/\/([a-zA-Z0-9_-]+)$/);
  const mediaId = mediaMatch?.[1];
  const numericMediaId = Number(mediaId);

  if (!Number.isInteger(numericMediaId) || numericMediaId <= 0) return undefined;

  const response = await fetch(`${beHost}/media/resolve`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ media_ids: [numericMediaId] }),
  });

  if (!response.ok) return undefined;

  const payload = await response.json();
  const data = payload?.data ?? payload;
  const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  const resolved = items.find((item) => {
    const resolvedId = item?.media_id ?? item?.mediaId ?? item?.id ?? item?.token;
    return String(resolvedId) === String(mediaId);
  });

  return (
    resolved?.signed_url ||
    resolved?.signedUrl ||
    resolved?.presigned_url ||
    resolved?.url ||
    resolved?.media_url
  );
};

const fetchPostMetadata = async (postId, origin) => {
  const cacheKey = `${postId}:${origin}`;
  const cached = metadataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < metadataCacheTtlMs) return cached.metadata;

  const response = await fetch(`${beHost}/posts/${encodeURIComponent(postId)}`);
  if (!response.ok) return undefined;

  const payload = await response.json();
  const post = payload?.data;
  if (!post?.title) return undefined;

  const rawImage =
    extractFirstImageUrl(post.content_markdown) ||
    post.owner?.avatar_url ||
    post.user?.avatar_url;
  const resolvedImage = rawImage?.startsWith('media://')
    ? await resolveMediaToken(rawImage)
    : rawImage;
  const metadata = {
    title: post.title,
    description: buildExcerpt(post.content_markdown),
    type: 'article',
    url: `${origin}/blog/${encodeURIComponent(postId)}`,
    image: toAbsoluteUrl(resolvedImage, origin) || `${origin}${defaultImagePath}`,
    publishedTime: post.created_at,
    modifiedTime: post.updated_at,
    author: post.owner?.name || post.user?.name,
    tags: Array.isArray(post.tags) ? post.tags.map((tag) => tag?.name).filter(Boolean) : [],
  };

  metadataCache.set(cacheKey, { metadata, timestamp: Date.now() });
  return metadata;
};

const buildMetaBlock = (metadata) => {
  const tags = [
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:type" content="${escapeHtml(metadata.type)}" />`,
    `<meta property="og:url" content="${escapeHtml(metadata.url)}" />`,
    `<meta property="og:image" content="${escapeHtml(metadata.image)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.image)}" />`,
  ];

  if (metadata.publishedTime) {
    tags.push(
      `<meta property="article:published_time" content="${escapeHtml(metadata.publishedTime)}" />`,
    );
  }

  if (metadata.modifiedTime) {
    tags.push(
      `<meta property="article:modified_time" content="${escapeHtml(metadata.modifiedTime)}" />`,
    );
  }

  if (metadata.author) {
    tags.push(`<meta property="article:author" content="${escapeHtml(metadata.author)}" />`);
  }

  metadata.tags.forEach((tag) => {
    tags.push(`<meta property="article:tag" content="${escapeHtml(tag)}" />`);
  });

  return `<!--app-meta:start-->\n    ${tags.join('\n    ')}\n    <!--app-meta:end-->`;
};

const injectMetadata = (html, metadata) =>
  html
    .replace(/<!--app-meta:start-->[\s\S]*?<!--app-meta:end-->/, buildMetaBlock(metadata))
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escapeHtml(metadata.title)} | Horizon</title>`,
    );

const getBlogPostId = (pathname) => {
  const match = pathname.match(/^\/blog\/([^/?#]+)\/?$/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
};

const getSafeAssetPath = (pathname) => {
  const decodedPath = decodeURIComponent(pathname);
  const safePath = normalize(decodedPath)
    .replace(/^(\.\.[/\\])+/, '')
    .replace(/^[/\\]+/, '');
  const assetPath = join(distDir, safePath);

  return assetPath === distDir || assetPath.startsWith(`${distDir}/`)
    ? assetPath
    : undefined;
};

const isStaticFile = (assetPath) => {
  try {
    return statSync(assetPath).isFile();
  } catch {
    return false;
  }
};

const serveIndex = async (request, response, pathname) => {
  let html = await readFile(indexPath, 'utf8');
  const origin = getRequestOrigin(request);
  const postId = getBlogPostId(pathname);

  if (postId) {
    try {
      const metadata = await fetchPostMetadata(postId, origin);
      if (metadata) html = injectMetadata(html, metadata);
    } catch (error) {
      console.error(`Failed to inject metadata for blog post ${postId}:`, error);
    }
  }

  response.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': postId ? 'no-cache' : 'public, max-age=60',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  response.end(html);
};

const serveAsset = (request, response, assetPath) => {
  const contentType = mimeTypes.get(extname(assetPath)) || 'application/octet-stream';
  response.writeHead(200, {
    'content-type': contentType,
    'cache-control': 'public, max-age=31536000, immutable',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(assetPath).pipe(response);
};

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' });
    response.end();
    return;
  }

  try {
    const url = new URL(request.url || '/', 'http://localhost');
    const assetPath = getSafeAssetPath(url.pathname);

    if (assetPath && isStaticFile(assetPath)) {
      serveAsset(request, response, assetPath);
      return;
    }

    await serveIndex(request, response, url.pathname);
  } catch (error) {
    console.error('Failed to serve request:', error);
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Internal Server Error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving Horizon Blog from dist on port ${port}`);
});
