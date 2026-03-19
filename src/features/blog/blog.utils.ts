import { BlogArchiveOwner, BlogArchivePost } from './blog.types'

const slugifyAuthorName = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

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
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[^>]+>/g, ' ')
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
    .replace(/\s+/g, ' ')
    .trim()

  if (!plainText) return 'Fresh thoughts are on the way.'

  return plainText.substring(0, 180) + (plainText.length > 180 ? '...' : '')
}

export const getReadingTime = (markdown: string): number => {
  const words = markdown.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export const getPostAuthor = (
  post: Pick<BlogArchivePost, 'owner' | 'user' | 'user_id'>,
): BlogArchiveOwner | undefined => {
  if (post.owner?.name) {
    return post.owner
  }

  if (post.user?.name) {
    return {
      id: typeof post.user_id === 'number' ? post.user_id : undefined,
      name: post.user.name,
      avatar_url: post.user.avatar_url || undefined,
    }
  }

  if (typeof post.user_id === 'number') {
    return {
      id: post.user_id,
      name: 'Anonymous',
    }
  }

  return undefined
}

export const getPostAuthorName = (post: Pick<BlogArchivePost, 'owner' | 'user' | 'user_id'>) =>
  getPostAuthor(post)?.name || 'Anonymous'

export const getPostAuthorAvatar = (post: Pick<BlogArchivePost, 'owner' | 'user' | 'user_id'>) =>
  getPostAuthor(post)?.avatar_url || undefined

export const getPostAuthorId = (post: Pick<BlogArchivePost, 'owner' | 'user' | 'user_id'>) =>
  getPostAuthor(post)?.id

export const getAuthorArchivePath = (authorId?: number | null, authorName?: string | null) => {
  if (typeof authorId !== 'number' || !Number.isFinite(authorId)) {
    return null
  }

  const slug = authorName ? slugifyAuthorName(authorName) : ''

  return slug ? `/authors/${slug}` : `/authors/${authorId}`
}

export const getAuthorArchiveState = (authorId?: number | null) =>
  typeof authorId === 'number' && Number.isFinite(authorId) ? { authorId } : undefined

export const getPostAuthorArchivePath = (post: BlogArchivePost) =>
  getAuthorArchivePath(getPostAuthorId(post), getPostAuthorName(post))

export const getPostAuthorArchiveState = (post: BlogArchivePost) =>
  getAuthorArchiveState(getPostAuthorId(post))

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
