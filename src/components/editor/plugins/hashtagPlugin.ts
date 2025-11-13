/**
 * Hashtag Plugin for Milkdown
 *
 * Supports hashtag detection: #tag
 */

import { EDITOR_CONFIG } from '../../../config/editor.config'

/**
 * Parse hashtags in markdown and convert to links
 */
export function parseHashtags(markdown: string): string {
  if (!EDITOR_CONFIG.features.hashtags) {
    return markdown
  }

  const { pattern, urlTemplate } = EDITOR_CONFIG.customSyntax.hashtag

  return markdown.replace(pattern, (_match, prefix, tag) => {
    const url = urlTemplate.replace('{tag}', tag)
    return `${prefix}[#${tag}](${url})`
  })
}

/**
 * Convert hashtag links back to simple hashtag syntax for editing
 */
export function unparseHashtags(markdown: string): string {
  if (!EDITOR_CONFIG.features.hashtags) {
    return markdown
  }

  // Convert [#tag](url) back to #tag
  return markdown.replace(/\[#([a-zA-Z0-9_-]+)\]\([^)]+\)/g, '#$1')
}
