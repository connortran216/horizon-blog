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

export const injectDocument = (indexHtml, { headHtml, bodyHtml }) => {
  let html = String(indexHtml).replace(/<title>[\s\S]*?<\/title>\s*/i, '');

  if (/<!--app-meta:start-->[\s\S]*?<!--app-meta:end-->/.test(html)) {
    html = html.replace(/<!--app-meta:start-->[\s\S]*?<!--app-meta:end-->/, headHtml);
  } else {
    html = html.replace('</head>', `${headHtml}\n  </head>`);
  }

  if (/<div id="root">[\s\S]*?<\/div>/.test(html)) {
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${bodyHtml}</div>`);
  }

  return html;
};
