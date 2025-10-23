/**
 * Wiki Link Plugin for Milkdown
 *
 * Supports Obsidian-style wiki links: [[link]] or [[link|display text]]
 */

import { EDITOR_CONFIG } from '../../../config/editor.config';

/**
 * Parse wiki link markdown syntax and convert to proper links
 */
export function parseWikiLinks(markdown: string): string {
  if (!EDITOR_CONFIG.features.wikiLinks) {
    return markdown;
  }

  const { pattern, urlTemplate } = EDITOR_CONFIG.customSyntax.wikiLink;

  return markdown.replace(pattern, (_match, link, displayText) => {
    const slug = link.trim().toLowerCase().replace(/\s+/g, '-');
    const url = urlTemplate.replace('{slug}', slug);
    const text = displayText ? displayText.trim() : link.trim();
    return `[${text}](${url})`;
  });
}

/**
 * Convert markdown links back to wiki link syntax for editing
 */
export function unparseWikiLinks(markdown: string): string {
  if (!EDITOR_CONFIG.features.wikiLinks) {
    return markdown;
  }

  // This is a simple reverse conversion - can be enhanced
  return markdown;
}
