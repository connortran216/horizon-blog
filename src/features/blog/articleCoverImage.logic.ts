/**
 * The reading page's own cover.
 *
 * `/posts/:id` carries no dedicated cover field - only `content_markdown` -
 * so `BlogDetailPage` has to decide, from the markdown itself, whether the
 * article's own body opens with an image that can double as its cover.
 *
 * "Can double as" is deliberately narrow: an image is promoted only when it
 * is the article's very first block and stands there completely alone -
 * nothing else sharing its paragraph, and not nested inside a blockquote, a
 * list item or a heading. `parseImageBlock` enforces this by matching the
 * image pattern anchored to the *whole* trimmed block (`^...$`); a leading
 * `>`, a list marker, or trailing prose after the image all make that match
 * fail, which is what keeps an inline "as shown here ![x](y) below" out of
 * this - promoting it would misrepresent the article's opening line as pure
 * artwork, and demoting it here does not touch it, so it renders exactly
 * once, in place, the way it always has.
 *
 * A promoted image is removed from the block it came from rather than left
 * behind as a duplicate: without this, the reading page rendered the same
 * picture twice - once lifted into the cover slot, once again at the top of
 * the article. The removal is block-aware - split on blank lines, drop the
 * matched block, rejoin - specifically so it cannot leave an empty paragraph
 * or eat into a neighbouring block.
 *
 * Only the markdown source is handled, one level up from `Prose`; this module
 * never touches the DOM.
 */

export interface ArticleCoverImage {
  readonly src: string
  /**
   * The markdown's own alt text, trimmed. Empty when the source left it
   * blank - the caller decides what a blank alt should fall back to, since
   * only it knows the post's title.
   */
  readonly alt: string
}

export interface ExtractedArticleCover {
  readonly cover: ArticleCoverImage
  /** The markdown with the cover's own block removed. */
  readonly content: string
}

// Anchored to the whole trimmed block: a markdown image alone, optionally
// wrapping its URL in `<...>`, with an optional `"title"` that is read and
// discarded - this module has nowhere to carry a hover tooltip that
// `PostCoverImage` itself does not model, and a dropped title is a smaller
// loss than a picture rendered twice.
const MARKDOWN_IMAGE_BLOCK = /^!\[([^\]]*)\]\(\s*(?:<([^>]+)>|(\S+?))(?:\s+"[^"]*")?\s*\)$/
// A bare `<img>` tag alone on its block. `[^>]*?\/?>` rather than `[^>]*>` so
// a self-closing `/>` is not swallowed into the attribute list.
const HTML_IMAGE_BLOCK = /^<img\b[^>]*?\/?>$/i
const HTML_SRC_ATTR = /\bsrc=["']([^"']+)["']/i
const HTML_ALT_ATTR = /\balt=["']([^"']*)["']/i

/**
 * CommonMark-ish blocks - paragraphs, headings, list items, blockquotes -
 * separated by one or more blank lines. Good enough for the one question
 * this module asks ("is the very first block exactly one image"); it does
 * not need to be a full parser to answer that, and this repository has no
 * markdown AST dependency to reach for one with.
 */
function splitIntoBlocks(markdown: string): string[] {
  return markdown.split(/\n\s*\n/)
}

function parseImageBlock(block: string): ArticleCoverImage | null {
  const trimmed = block.trim()

  const markdownMatch = trimmed.match(MARKDOWN_IMAGE_BLOCK)

  if (markdownMatch) {
    const [, alt, angleUrl, bareUrl] = markdownMatch
    const src = (angleUrl ?? bareUrl ?? '').trim()

    return src.length > 0 ? { src, alt: alt.trim() } : null
  }

  const htmlMatch = trimmed.match(HTML_IMAGE_BLOCK)

  if (htmlMatch) {
    const src = htmlMatch[0].match(HTML_SRC_ATTR)?.[1]?.trim() ?? ''
    const alt = htmlMatch[0].match(HTML_ALT_ATTR)?.[1]?.trim() ?? ''

    return src.length > 0 ? { src, alt } : null
  }

  return null
}

/**
 * The article's own cover, and the body with that block removed - or `null`
 * when the article does not open with a standalone image, in which case
 * `markdown` is returned completely untouched by the caller (this function
 * itself returns nothing to touch it with).
 */
export function extractArticleCoverImage(markdown: string): ExtractedArticleCover | null {
  const blocks = splitIntoBlocks(markdown)
  const firstContentIndex = blocks.findIndex((block) => block.trim().length > 0)

  if (firstContentIndex === -1) {
    return null
  }

  const cover = parseImageBlock(blocks[firstContentIndex])

  if (!cover) {
    return null
  }

  const remaining = [...blocks.slice(0, firstContentIndex), ...blocks.slice(firstContentIndex + 1)]

  return { cover, content: remaining.join('\n\n').trim() }
}
