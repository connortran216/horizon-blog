import { BlogPost, BlogPostSummary, BlogStatus, PublicPostRecord } from '../types/blog.types'
import { buildExcerptFromMarkdown } from './markdown-preview.utils'

const DEFAULT_EXCERPT_LENGTH = 150
const DEFAULT_WORDS_PER_MINUTE = 200

export interface BlogMappingConfig {
  excerptLength?: number
  wordsPerMinute?: number
}

export function extractFirstImageFromMarkdown(content: string): string | undefined {
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

export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE,
): number {
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export function generateMarkdownExcerpt(
  content: string,
  maxLength: number = DEFAULT_EXCERPT_LENGTH,
): string {
  return buildExcerptFromMarkdown(content, maxLength)
}

export function mapApiPostToSummary(
  post: PublicPostRecord,
  config: BlogMappingConfig = {},
): BlogPostSummary {
  const excerptLength = config.excerptLength ?? DEFAULT_EXCERPT_LENGTH
  const wordsPerMinute = config.wordsPerMinute ?? DEFAULT_WORDS_PER_MINUTE

  return {
    id: post.id.toString(),
    title: post.title,
    excerpt: generateMarkdownExcerpt(post.content_markdown, excerptLength),
    author: {
      id: post.owner?.id ?? post.user_id,
      username: post.owner?.name || post.user?.name || 'Anonymous',
      avatar: post.owner?.avatar_url || post.user?.avatar_url || undefined,
    },
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    readingTime: calculateReadingTime(post.content_markdown, wordsPerMinute),
    tags: post.tags?.map((tag) => tag.name) || [],
    featuredImage: extractFirstImageFromMarkdown(post.content_markdown),
    status: post.status as BlogStatus,
    slug: post.id.toString(),
  }
}

export function enrichBlogPostDisplayFields(
  post: BlogPost,
  config: BlogMappingConfig = {},
): BlogPost {
  const excerptLength = config.excerptLength ?? DEFAULT_EXCERPT_LENGTH
  const wordsPerMinute = config.wordsPerMinute ?? DEFAULT_WORDS_PER_MINUTE

  return {
    ...post,
    excerpt: post.excerpt || generateMarkdownExcerpt(post.content_markdown, excerptLength),
    readingTime: post.readingTime || calculateReadingTime(post.content_markdown, wordsPerMinute),
    featuredImage: extractFirstImageFromMarkdown(post.content_markdown) || post.featuredImage,
  }
}
