import { Marked } from 'marked';
import { escapeHtml } from './metadata.mjs';
import { slugify } from './urls.mjs';

export const stripMarkdown = (markdown) =>
  String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*(?:[-+*]|\d+\.)\s+/gm, '')
    .replace(/[*_~>`|\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const buildExcerpt = (markdown, maxLength = 180) => {
  const text = stripMarkdown(markdown);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
};

export const getReadingTime = (markdown) => {
  const words = stripMarkdown(markdown).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const extractFirstImageUrl = (markdown) => {
  const content = String(markdown || '');
  const markdownMatch = content.match(/!\[[^\]]*]\(([^)]+)\)/);
  if (markdownMatch?.[1]) {
    const raw = markdownMatch[1].trim();
    const match = raw.match(/^<([^>]+)>|^(\S+)/);
    if (match?.[1] || match?.[2]) return match[1] || match[2];
  }

  return content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)?.[1];
};

const safeUrl = (value, { image = false } = {}) => {
  const href = String(value || '').trim();
  if (!href || href.startsWith('//')) return undefined;
  if (href.startsWith('#')) return /^#[a-zA-Z0-9_.:-]+$/.test(href) ? href : undefined;
  if (/^\/@[a-zA-Z0-9._-]+\/[a-zA-Z0-9][^\s]*$/.test(href)) {
    return `https://medium.com${href}`;
  }
  if (href.startsWith('/')) return href;
  if (href.startsWith('./') || href.startsWith('../')) return href;
  if (!image && href.startsWith('mailto:')) return href;

  try {
    const url = new URL(href);
    return url.protocol === 'http:' || url.protocol === 'https:' ? href : undefined;
  } catch {
    return undefined;
  }
};

const renderTitle = (title) => (title ? ` title="${escapeHtml(title)}"` : '');

export const renderMarkdown = (markdown) => {
  const headingCounts = new Map();
  const renderer = {
    html(token) {
      return escapeHtml(token.text);
    },
    heading(token) {
      const inline = this.parser.parseInline(token.tokens);
      const base = slugify(token.text) || 'section';
      const count = (headingCounts.get(base) || 0) + 1;
      headingCounts.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      return `<h${token.depth} id="${escapeHtml(id)}">${inline}</h${token.depth}>\n`;
    },
    link(token) {
      const text = this.parser.parseInline(token.tokens);
      const href = safeUrl(token.href);
      if (!href) return `<span>${text}</span>`;
      const external = /^https?:\/\//i.test(href);
      return `<a href="${escapeHtml(href)}"${renderTitle(token.title)}${external ? ' rel="noopener noreferrer"' : ''}>${text}</a>`;
    },
    image(token) {
      const alt = token.text || 'Image';
      const href = safeUrl(token.href, { image: true });
      if (!href) {
        return `<span role="img" aria-label="${escapeHtml(alt)}">${escapeHtml(alt)}</span>`;
      }
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(alt)}"${renderTitle(token.title)} loading="lazy" />`;
    },
    code(token) {
      const language = String(token.lang || '')
        .trim()
        .match(/^[a-zA-Z0-9_+-]+/)?.[0];
      return `<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>${escapeHtml(token.text)}\n</code></pre>\n`;
    },
  };

  const marked = new Marked({
    gfm: true,
    breaks: false,
    renderer,
  });

  return String(marked.parse(String(markdown || '')));
};
