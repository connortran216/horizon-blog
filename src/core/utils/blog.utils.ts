import { LexicalEditorState, LexicalNode } from '../types/blog.types';

/**
 * Utility functions for blog-related operations
 */

/**
 * Calculate estimated reading time for blog content
 * Based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(content: LexicalEditorState): number {
  try {
    const textContent = extractTextFromLexical(content.root);

    if (!textContent.trim()) {
      return 1; // Minimum 1 minute for empty content
    }

    // Average word length is approximately 5 characters + 1 space
    const words = textContent.length / 6;
    const readingTime = Math.ceil(words / 200);

    return Math.max(readingTime, 1); // Minimum 1 minute
  } catch (error) {
    console.error('Error calculating reading time:', error);
    return 1; // Default to 1 minute on error
  }
}

/**
 * Extract plain text content from Lexical editor state
 */
export function extractTextFromLexical(root: { children: LexicalNode[] }): string {
  if (!root || !root.children) {
    return '';
  }

  return root.children
    .map(node => extractTextFromNode(node))
    .join(' ')
    .trim();
}

/**
 * Extract text from a single Lexical node
 */
function extractTextFromNode(node: LexicalNode): string {
  if (!node) return '';

  // If it's a text node, return its text
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }

  // If it has children, recursively extract text from them
  if (node.children && Array.isArray(node.children)) {
    return node.children
      .map(child => extractTextFromNode(child))
      .join(' ');
  }

  return '';
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate excerpt from blog content (first few sentences)
 */
export function generateExcerpt(content: LexicalEditorState, maxLength: number = 150): string {
  const text = extractTextFromLexical(content.root);

  if (text.length <= maxLength) {
    return text;
  }

  // Try to cut at sentence boundary
  const sentences = text.split(/[.!?]+/);
  let excerpt = '';

  for (const sentence of sentences) {
    if ((excerpt + sentence).length <= maxLength) {
      excerpt += sentence + '.';
    } else {
      break;
    }
  }

  // If we couldn't find a good sentence boundary, cut at word boundary
  if (!excerpt.trim()) {
    const words = text.split(' ');
    excerpt = words.slice(0, Math.floor(maxLength / 5)).join(' ') + '...';
  }

  return excerpt.trim();
}

/**
 * Validate blog post data
 */
export function validateBlogPost(data: {
  title: string;
  content: LexicalEditorState;
  author: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!data.author || data.author.trim().length < 1) {
    errors.push('Author is required');
  }

  const textContent = extractTextFromLexical(data.content.root);
  if (!textContent || textContent.trim().length < 10) {
    errors.push('Content must be at least 10 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return dateObj.toLocaleDateString(undefined, { ...defaultOptions, ...options });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}
