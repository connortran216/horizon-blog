export const extractPreviewText = (content: string): string => {
  if (!content) return ''

  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, ' $1 ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, ' $1 ')
    .replace(/<((?:https?:\/\/|mailto:)[^>]+)>/gi, '$1')
    .replace(/<br\b[^>]*\/?>/gi, ' ')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/(^|\s)<\/?[a-z][^\s>]*(?=\s|$)/gi, ' ')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/&nbsp;/gi, ' ')
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
