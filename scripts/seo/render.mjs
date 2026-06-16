import { getReadingTime, renderMarkdown } from './content.mjs';
import { escapeHtml } from './metadata.mjs';

const formatDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const renderPostList = (posts) => {
  if (!posts.length) return '<p>No published articles are available yet.</p>';

  return `<ol>
${posts
    .map((post) => {
      const date = formatDate(post.createdAt);
      return `  <li>
    <article>
      <h2><a href="/blog/${encodeURIComponent(post.id)}">${escapeHtml(post.title)}</a></h2>
      ${post.description ? `<p>${escapeHtml(post.description)}</p>` : ''}
      <p>By <a href="/authors/${escapeHtml(post.author.slug)}">${escapeHtml(post.author.name)}</a>${date ? ` on <time datetime="${escapeHtml(post.createdAt)}">${escapeHtml(date)}</time>` : ''}</p>
      ${post.tags.length ? `<ul>${post.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>` : ''}
    </article>
  </li>`;
    })
    .join('\n')}
</ol>`;
};

const fallbackMain = (content) => `<main data-seo-fallback="true">
${content}
</main>`;

export const renderHome = ({ posts }) =>
  fallbackMain(`<header>
  <p>Horizon Blog</p>
  <h1>Thoughtful writing for curious readers</h1>
  <p>Read practical notes about backend engineering, software architecture, technology, and personal growth.</p>
  <p><a href="/blog">Explore every article</a></p>
</header>
<section aria-labelledby="latest-writing">
  <h2 id="latest-writing">Latest writing</h2>
  ${renderPostList(posts)}
</section>`);

export const renderArchive = ({ posts, page, total, totalPages }) =>
  fallbackMain(`<header>
  <h1>Horizon Blog</h1>
  <p>Thoughtful articles about engineering, systems, technology, and lessons learned while building.</p>
  <p>${escapeHtml(total)} published article${total === 1 ? '' : 's'}. Page ${escapeHtml(page)} of ${escapeHtml(Math.max(totalPages, 1))}.</p>
</header>
${renderPostList(posts)}
${renderPagination('/blog', page, totalPages)}`);

const renderPagination = (basePath, page, totalPages) => {
  if (totalPages <= 1) return '';
  const previous = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : undefined;
  const next = page < totalPages ? `${basePath}?page=${page + 1}` : undefined;
  return `<nav aria-label="Pagination">
  ${previous ? `<a rel="prev" href="${escapeHtml(previous)}">Previous page</a>` : ''}
  ${next ? `<a rel="next" href="${escapeHtml(next)}">Next page</a>` : ''}
</nav>`;
};

export const renderArticle = (post) => {
  const publishedDate = formatDate(post.createdAt);
  const modifiedDate = formatDate(post.updatedAt);
  const readingTime = getReadingTime(post.contentMarkdown);

  return fallbackMain(`<nav aria-label="Breadcrumb">
  <a href="/">Home</a> / <a href="/blog">Blog</a> / <span aria-current="page">${escapeHtml(post.title)}</span>
</nav>
<article>
  <header>
    <h1>${escapeHtml(post.title)}</h1>
    <p>By <a href="/authors/${escapeHtml(post.author.slug)}">${escapeHtml(post.author.name)}</a></p>
    <p>${publishedDate ? `Published <time datetime="${escapeHtml(post.createdAt)}">${escapeHtml(publishedDate)}</time>. ` : ''}${modifiedDate && modifiedDate !== publishedDate ? `Updated <time datetime="${escapeHtml(post.updatedAt)}">${escapeHtml(modifiedDate)}</time>. ` : ''}${escapeHtml(readingTime)} min read.</p>
    ${post.tags.length ? `<ul>${post.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>` : ''}
  </header>
  <div>
${renderMarkdown(post.contentMarkdown)}
  </div>
</article>
<p><a href="/blog">Back to all articles</a></p>`);
};

export const renderAuthor = (author) => {
  const pageCount = Math.max(1, Math.ceil(author.total / author.limit));
  return fallbackMain(`<header>
  <p>Horizon author</p>
  <h1>${escapeHtml(author.name)}</h1>
  ${author.bio ? `<p>${escapeHtml(author.bio)}</p>` : ''}
  <p>${escapeHtml(author.total)} published article${author.total === 1 ? '' : 's'}.</p>
</header>
<section aria-labelledby="author-writing">
  <h2 id="author-writing">Published writing</h2>
  ${renderPostList(author.posts)}
</section>
${renderPagination(`/authors/${author.slug}`, author.page, pageCount)}
<p><a href="/blog">Browse the complete Horizon archive</a></p>`);
};

const STATIC_PAGES = {
  about: {
    title: 'About Horizon',
    body: 'Horizon is Connor Tran\'s place for thoughtful notes about backend systems, software architecture, engineering tradeoffs, personal growth, and lessons learned while building products.',
    links:
      '<p><a href="/blog">Read the blog</a> or <a href="/cv">view Connor Tran&#39;s CV</a>.</p>',
  },
  contact: {
    title: 'Contact Connor Tran',
    body: 'Reach out directly about writing, backend engineering, software architecture, or Horizon.',
    links:
      '<p>Email <a href="mailto:canhtran210699@gmail.com">canhtran210699@gmail.com</a> or browse the <a href="/blog">latest articles</a>.</p>',
  },
  cv: {
    title: 'Connor Tran - Backend Engineer',
    body: 'Professional experience, selected projects, and technical background for Connor Tran, a backend engineer based in Ho Chi Minh City.',
    links:
      '<p><a href="/about">About Connor</a>, <a href="/contact">contact Connor</a>, or <a href="/blog">read technical writing</a>.</p>',
  },
};

export const renderStaticPage = (route) => {
  const page = STATIC_PAGES[route] || STATIC_PAGES.about;
  return fallbackMain(`<article>
  <h1>${page.title}</h1>
  <p>${page.body}</p>
  ${page.links}
</article>`);
};

export const renderPrivateShell = () =>
  fallbackMain(`<h1>Account page</h1>
<p>JavaScript is required for this account page.</p>
<p><a href="/">Return to Horizon</a></p>`);

export const renderErrorPage = (status) =>
  status === 503
    ? fallbackMain(`<h1>Temporarily unavailable</h1>
<p>Horizon could not load this public page right now. Please try again shortly.</p>
<p><a href="/">Return home</a></p>`)
    : fallbackMain(`<h1>Page not found</h1>
<p>The requested Horizon page does not exist or is no longer public.</p>
<p><a href="/">Return home</a> or <a href="/blog">browse the blog</a>.</p>`);

const MODULE_ENTRY_PATTERN =
  /<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bsrc=["'](\/[^"']+)["'])[^>]*>\s*<\/script>/i;

const FALLBACK_STYLE = `<style data-horizon-fallback-style="true">
[data-seo-fallback] {
  box-sizing: border-box;
  width: min(100% - 2rem, 72rem);
  margin: 0 auto;
  padding: clamp(2rem, 6vw, 5rem) 0;
  color: #2c3e50;
  font: 400 1rem/1.7 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
[data-seo-fallback] header,
[data-seo-fallback] article,
[data-seo-fallback] section,
[data-seo-fallback] nav {
  margin-block-end: 2rem;
}
[data-seo-fallback] h1,
[data-seo-fallback] h2,
[data-seo-fallback] h3 {
  color: #1f2937;
  line-height: 1.15;
  letter-spacing: -0.025em;
}
[data-seo-fallback] h1 { font-size: clamp(2.25rem, 7vw, 4.5rem); }
[data-seo-fallback] h2 { font-size: clamp(1.5rem, 4vw, 2.25rem); }
[data-seo-fallback] a { color: #5b4b9a; text-underline-offset: 0.2em; }
[data-seo-fallback] a:focus-visible {
  outline: 3px solid #7c6bc4;
  outline-offset: 3px;
}
[data-seo-fallback] li > p > a:only-child {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}
[data-seo-fallback] ol,
[data-seo-fallback] ul { padding-inline-start: 1.4rem; }
[data-seo-fallback] ol > li { margin-block: 1.5rem; }
[data-seo-fallback] article {
  overflow-wrap: anywhere;
}
[data-seo-fallback] article img {
  max-width: 100%;
  height: auto;
}
[data-seo-fallback] pre {
  overflow-x: auto;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #f1f3f5;
}
</style>`;

const createDeferredEntryLoader = (source) => {
  const serializedSource = JSON.stringify(source).replace(/</g, '\\u003c');
  return `<script data-horizon-entry-loader="deferred">
(() => {
  const source = ${serializedSource};
  const events = ['pointerdown', 'keydown', 'touchstart', 'focusin'];
  let loading = false;
  let timer;
  const cleanup = () => {
    events.forEach((eventName) => window.removeEventListener(eventName, load));
    if (timer) window.clearTimeout(timer);
  };
  const load = () => {
    if (loading) return;
    loading = true;
    cleanup();
    import(source);
  };
  try {
    if (window.localStorage.getItem('horizon_blog_token')) {
      load();
      return;
    }
  } catch {}
  events.forEach((eventName) => window.addEventListener(eventName, load, { once: true }));
  timer = window.setTimeout(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(load, { timeout: 2000 });
    } else {
      load();
    }
  }, 8000);
})();
</script>`;
};

const transformModuleEntry = (html, entryMode) => {
  if (entryMode === 'immediate') return html;

  return html.replace(MODULE_ENTRY_PATTERN, (_script, source) =>
    entryMode === 'deferred' ? createDeferredEntryLoader(source) : '',
  );
};

export const injectDocument = (
  indexHtml,
  { headHtml, bodyHtml, entryMode = 'immediate' },
) => {
  let html = String(indexHtml).replace(/<title>[\s\S]*?<\/title>\s*/i, '');

  if (/<!--app-meta:start-->[\s\S]*?<!--app-meta:end-->/.test(html)) {
    html = html.replace(/<!--app-meta:start-->[\s\S]*?<!--app-meta:end-->/, headHtml);
  } else {
    html = html.replace('</head>', `${headHtml}\n  </head>`);
  }

  if (/<div id="root">[\s\S]*?<\/div>/.test(html)) {
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${bodyHtml}</div>`);
  }

  if (entryMode === 'deferred') {
    html = html.replace('</head>', `${FALLBACK_STYLE}\n  </head>`);
  }

  return transformModuleEntry(html, entryMode);
};
