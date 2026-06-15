import { slugify } from './urls.mjs';

export class BackendError extends Error {
  constructor(message, { status = 503, transient = true, cause } = {}) {
    super(message, { cause });
    this.name = 'BackendError';
    this.status = status;
    this.transient = transient;
  }
}

const normalizeOptionalText = (value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

const normalizePost = (record) => {
  if (!record || record.status !== 'published' || !record.title || !record.id) {
    throw new BackendError('Published post not found', { status: 404, transient: false });
  }

  const sourceAuthor = record.owner?.name ? record.owner : record.user;
  const authorId = sourceAuthor?.id ?? record.user_id;
  const authorName = normalizeOptionalText(sourceAuthor?.name);
  if (!authorId || !authorName) {
    throw new BackendError('Published post author not found', { status: 404, transient: false });
  }

  return {
    id: record.id,
    title: String(record.title),
    contentMarkdown: String(record.content_markdown || ''),
    createdAt: normalizeOptionalText(record.created_at),
    updatedAt: normalizeOptionalText(record.updated_at),
    status: 'published',
    author: {
      id: authorId,
      name: authorName,
      slug: slugify(authorName),
      avatarUrl: normalizeOptionalText(sourceAuthor?.avatar_url),
    },
    tags: Array.isArray(record.tags)
      ? record.tags.map((tag) => normalizeOptionalText(tag?.name)).filter(Boolean)
      : [],
  };
};

const extractFirstImageUrl = (markdown) => {
  const markdownMatch = String(markdown || '').match(/!\[[^\]]*]\(([^)]+)\)/);
  if (markdownMatch?.[1]) {
    const raw = markdownMatch[1].trim();
    const match = raw.match(/^<([^>]+)>|^(\S+)/);
    if (match?.[1] || match?.[2]) return match[1] || match[2];
  }

  const htmlMatch = String(markdown || '').match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return htmlMatch?.[1];
};

const createCache = ({ ttlMs, staleTtlMs, now }) => {
  const values = new Map();
  const pending = new Map();

  const load = async (key, loader) => {
    const cached = values.get(key);
    const age = cached ? now() - cached.timestamp : Infinity;
    if (cached && age < ttlMs) return cached.value;
    if (pending.has(key)) return pending.get(key);

    const promise = Promise.resolve()
      .then(loader)
      .then((value) => {
        values.set(key, { value, timestamp: now() });
        return value;
      })
      .catch((error) => {
        if (cached && age < staleTtlMs && error?.transient !== false) {
          return cached.value;
        }
        throw error;
      })
      .finally(() => {
        pending.delete(key);
      });

    pending.set(key, promise);
    return promise;
  };

  return { load };
};

export const createBackendClient = (
  config,
  { fetchImpl = globalThis.fetch, now = Date.now } = {},
) => {
  const cache = createCache({
    ttlMs: config.cacheTtlMs,
    staleTtlMs: config.staleTtlMs,
    now,
  });

  const requestJson = async (path, options = {}) => {
    let lastError;

    for (const host of config.backendHosts) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);

      try {
        const response = await fetchImpl(`${host}${path}`, {
          ...options,
          signal: controller.signal,
        });

        if (!response.ok) {
          const transient = response.status >= 500 || response.status === 408 || response.status === 429;
          const error = new BackendError(`Backend returned ${response.status} for ${path}`, {
            status: transient ? 503 : response.status,
            transient,
          });
          if (!transient) throw error;
          lastError = error;
          continue;
        }

        return await response.json();
      } catch (error) {
        if (error instanceof BackendError && !error.transient) throw error;
        lastError =
          error instanceof BackendError
            ? error
            : new BackendError(`Backend request failed for ${path}`, { cause: error });
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastError || new BackendError(`No backend host available for ${path}`);
  };

  const getPublishedPost = (id) =>
    cache.load(`post:${id}`, async () => {
      const payload = await requestJson(`/posts/${encodeURIComponent(id)}`);
      return normalizePost(payload?.data ?? payload);
    });

  const listPublishedPosts = ({ page = 1, limit = 100 } = {}) =>
    cache.load(`posts:${page}:${limit}`, async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: 'published',
      });
      const payload = await requestJson(`/posts?${query}`);
      const records = Array.isArray(payload?.data) ? payload.data : [];
      const posts = records.flatMap((record) => {
        try {
          return [normalizePost(record)];
        } catch (error) {
          if (error instanceof BackendError && error.status === 404) return [];
          throw error;
        }
      });

      return {
        posts,
        page: Number(payload?.page || page),
        limit: Number(payload?.limit || limit),
        total: Number(payload?.total ?? posts.length),
      };
    });

  const listAllPublishedPosts = ({ limit = 100 } = {}) =>
    cache.load(`posts:all:${limit}`, async () => {
      const first = await listPublishedPosts({ page: 1, limit });
      const pageCount = Math.max(1, Math.ceil(first.total / first.limit));
      const pages = [first.posts];
      for (let page = 2; page <= pageCount; page += 1) {
        pages.push((await listPublishedPosts({ page, limit })).posts);
      }
      return pages.flat();
    });

  const getAuthorBySlug = (slug, { page = 1, limit = 6 } = {}) =>
    cache.load(`author:${slug}:${page}:${limit}`, async () => {
      const allPosts = await listAllPublishedPosts();
      const matchingPost = allPosts.find((item) => item.author.slug === slug);
      if (!matchingPost) {
        throw new BackendError('Author not found', { status: 404, transient: false });
      }

      const authorId = matchingPost.author.id;
      const profilePayload = await requestJson(
        `/users/${encodeURIComponent(authorId)}/public-profile`,
      );
      const profile = profilePayload?.data ?? profilePayload;
      const authorPosts = allPosts.filter((item) => String(item.author.id) === String(authorId));
      const total = authorPosts.length;
      const pageCount = Math.max(1, Math.ceil(total / limit));
      if (page > pageCount) {
        throw new BackendError('Author page not found', { status: 404, transient: false });
      }

      return {
        id: authorId,
        name: normalizeOptionalText(profile?.name) || matchingPost.author.name,
        slug,
        bio: normalizeOptionalText(profile?.bio),
        avatarUrl: normalizeOptionalText(profile?.avatar_url),
        posts: authorPosts.slice((page - 1) * limit, page * limit),
        page,
        limit,
        total,
      };
    });

  const resolvePostImageSource = (id) =>
    cache.load(`image:${id}`, async () => {
      const post = await getPublishedPost(id);
      const rawImage = extractFirstImageUrl(post.contentMarkdown);
      if (!rawImage) return undefined;

      let candidate = rawImage;
      const mediaMatch = rawImage.match(/^media:\/\/(\d+)$/);
      if (mediaMatch) {
        const payload = await requestJson('/media/resolve', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ media_ids: [Number(mediaMatch[1])] }),
        });
        const data = payload?.data ?? payload;
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        const resolved = items.find((item) => {
          const itemId = item?.media_id ?? item?.mediaId ?? item?.id ?? item?.token;
          return String(itemId) === mediaMatch[1];
        });
        candidate =
          resolved?.signed_url ||
          resolved?.signedUrl ||
          resolved?.presigned_url ||
          resolved?.url ||
          resolved?.media_url;
      }

      if (!candidate) return undefined;
      try {
        const url = new URL(candidate);
        if (url.protocol !== 'https:' || !config.allowedImageHosts.has(url.hostname)) {
          return undefined;
        }
        return url.toString();
      } catch {
        return undefined;
      }
    });

  return {
    getPublishedPost,
    listPublishedPosts,
    listAllPublishedPosts,
    getAuthorBySlug,
    resolvePostImageSource,
  };
};
