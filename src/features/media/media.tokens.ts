const MEDIA_TOKEN_PATTERN = /media:\/\/([a-zA-Z0-9_-]+)/g

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const parseMediaIdsFromMarkdown = (markdown: string): string[] => {
  if (!markdown) return []

  const ids = new Set<string>()
  for (const match of markdown.matchAll(MEDIA_TOKEN_PATTERN)) {
    if (match[1]) ids.add(match[1])
  }

  return Array.from(ids)
}

export const replaceMediaTokensWithUrls = (
  markdown: string,
  mediaMap: Record<string, { url: string }>,
): string => {
  if (!markdown) return markdown

  return markdown.replace(MEDIA_TOKEN_PATTERN, (_, mediaId: string) => {
    const resolved = mediaMap[mediaId]
    return resolved?.url || `media://${mediaId}`
  })
}

export const normalizeMarkdownToMediaTokens = (
  markdown: string,
  urlToMediaId: Record<string, string>,
): string => {
  if (!markdown) return markdown

  let normalized = markdown
  Object.entries(urlToMediaId).forEach(([url, mediaId]) => {
    normalized = normalized.replace(new RegExp(escapeRegex(url), 'g'), `media://${mediaId}`)
  })

  return normalized
}
