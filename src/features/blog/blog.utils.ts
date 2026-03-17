export const extractFirstImageUrl = (content: string): string | undefined => {
  if (!content) return undefined

  const markdownMatch = content.match(/!\[[^\]]*]\(([^)]+)\)/)
  if (markdownMatch?.[1]) {
    const raw = markdownMatch[1].trim()
    const urlMatch = raw.match(/^<([^>]+)>|^(\S+)/)
    const markdownUrl = urlMatch?.[1] || urlMatch?.[2]
    if (markdownUrl) return markdownUrl
  }

  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
  if (htmlMatch?.[1]) return htmlMatch[1]

  return undefined
}

export const getExcerpt = (markdown: string): string => {
  if (!markdown) return 'Fresh thoughts are on the way.'

  const plainText = markdown
    .replace(/#{1,6}\s+/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<img[^>]*>/gi, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/>\s+/g, '')
    .replace(/[-*+]\s+/g, '')
    .replace(/\n+/g, ' ')
    .trim()

  if (!plainText) return 'Fresh thoughts are on the way.'

  return plainText.substring(0, 180) + (plainText.length > 180 ? '...' : '')
}

export const getReadingTime = (markdown: string): number => {
  const words = markdown.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export const formatArchiveDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export const getPostEyebrow = (index: number) => {
  if (index === 0) return 'Featured note'
  if (index < 3) return 'Latest entry'
  return 'From the archive'
}
