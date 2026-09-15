/**
 * Common HTML entities that show up in markdown pulled through a CMS or
 * pasted from a rich editor. Decoded to the character a reader expects to
 * see on a card - `&amp;` should read as `&`, not as four extra letters.
 */
const HTML_ENTITIES: ReadonlyArray<readonly [RegExp, string]> = [
  [/&nbsp;/gi, ' '],
  [/&amp;/gi, '&'],
  [/&lt;/gi, '<'],
  [/&gt;/gi, '>'],
  [/&quot;/gi, '"'],
  [/&#0?39;|&apos;/gi, "'"],
]

export const extractPreviewText = (content: string): string => {
  if (!content) return ''

  let text = content
    // A line that is only `---`, `***` or `___` is a horizontal rule, and a
    // line of only `===` is a Setext heading underline. Both are pure layout
    // - there is no reader-facing text to preserve - so they are dropped
    // before anything else runs. Doing this first matters: `**bold**`'s own
    // regex cannot tell "a rule" from "an unterminated bold marker" once the
    // two are mixed with surrounding prose, so a lone `***` line has to be
    // gone before that pass ever sees an asterisk.
    .replace(/^[ \t]*-{3,}[ \t]*$/gm, ' ')
    .replace(/^[ \t]*\*{3,}[ \t]*$/gm, ' ')
    .replace(/^[ \t]*_{3,}[ \t]*$/gm, ' ')
    .replace(/^[ \t]*={3,}[ \t]*$/gm, ' ')
    // A table separator row (`|---|:--:|`) carries no text at all.
    .replace(/^[ \t]*\|?[ \t]*:?-{1,}:?[ \t]*(\|[ \t]*:?-{1,}:?[ \t]*)+\|?[ \t]*$/gm, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/!\[[^\]]*]\[[^\]]*]/g, ' ')
    .replace(/<img\b[^>]*>/gi, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, ' $1 ')
    .replace(/\[([^\]]+)\]\[[^\]]*]/g, ' $1 ')
    // A footnote reference is attached directly to the preceding word
    // (`claim[^1].`), so it is dropped rather than replaced with a space -
    // a space would open a gap that was never there in the sentence.
    .replace(/\[\^[^\]]+]/g, '')
    // A reference-style link/image definition (`[ref]: https://...`) has no
    // reader-facing text of its own; it only resolves the links above.
    .replace(/^[ \t]*\[[^\]]+]:\s*\S+.*$/gm, ' ')
    .replace(/<((?:https?:\/\/|mailto:)[^>]+)>/gi, '$1')
    .replace(/<br\b[^>]*\/?>/gi, ' ')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/(^|\s)<\/?[a-z][^\s>]*(?=\s|$)/gi, ' ')
    // The closing `##` some ATX headings repeat (`## Heading ##`) is stripped
    // after the leading marker below; done here as a trailing-only pattern so
    // a real hashtag at the end of a sentence - which is never preceded by
    // more than one `#` glued to bare word characters - is left alone.
    .replace(/[ \t]+#{1,6}[ \t]*$/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    // A task-list checkbox (`- [ ] ` / `- [x] `) is consumed together with
    // its bullet, before the plain bullet pattern below would otherwise
    // leave the literal `[ ]`/`[x]` behind as stray text.
    .replace(/^\s*[-*+]\s+\[[ xX]]\s+/gm, '')
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // A table row that survived the separator-row removal above still has
    // its cell dividers; blog prose otherwise has no reason to contain a
    // literal `|`, so every remaining one is safe to fold into whitespace.
    .replace(/\|/g, ' ')

  HTML_ENTITIES.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement)
  })

  return text
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const buildExcerptFromMarkdown = (
  content: string,
  maxLength: number = 150,
  fallback: string = 'No content',
): string => {
  const plainText = extractPreviewText(content)

  if (!plainText) {
    return fallback
  }

  return plainText.length > maxLength ? `${plainText.slice(0, maxLength).trimEnd()}...` : plainText
}
