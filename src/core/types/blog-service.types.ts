/**
 * Blog Service types and interfaces
 * Defines the contract for blog business logic operations
 */

import {
  BlogArchiveOptions,
  BlogPost,
  BlogPostSummariesPage,
  BlogPostSummary,
  BlogSearchOptions,
  PublicAuthor,
  PublicAuthorPostsPage,
  PublicPostTag,
  PublicPostRecord,
  PublicPostSummaryRecord,
} from './blog.types'

/**
 * API response format for blog posts (matches backend API)
 */
export type ApiBlogPost = PublicPostRecord

/**
 * API response for list posts endpoint
 */
export interface ApiListPostsResponse {
  data: ApiBlogPost[]
  page: number
  limit: number
  total: number
}

export type ApiPostSummary = PublicPostSummaryRecord

export interface ApiListPostSummariesResponse {
  data: ApiPostSummary[]
  page: number
  limit: number
  total: number
}

export interface ApiRelatedPostItem {
  post: ApiPostSummary
  score: number
}

export interface ApiRelatedPostsResponse {
  data: ApiRelatedPostItem[]
  limit: number
}

export interface ApiPublicAuthorProfileResponse {
  data: PublicAuthor
}

export interface ApiPublicAuthorPostsResponse {
  data: ApiBlogPost[]
  page: number
  limit: number
  total: number
}

/**
 * Blog service interface - defines business logic operations for blogs
 * Follows Interface Segregation Principle by focusing on blog-specific operations
 */
export interface IBlogService {
  // Business logic operations
  generateExcerpt(content: string, maxLength?: number): string
  calculateReadingTime(content: string): number
  formatPostForDisplay(post: ApiBlogPost): BlogPostSummary

  // Data operations (delegated to repositories)
  getPublishedPosts(options?: BlogSearchOptions): Promise<BlogPostSummary[]>
  getPublishedArchivePosts(options: BlogArchiveOptions): Promise<BlogPostSummariesPage>
  getPostById(id: string): Promise<BlogPost | null>
  getPublicPostDetail(id: string): Promise<PublicPostRecord>
  getRelatedPosts(id: string, limit?: number): Promise<BlogPostSummary[]>
  getPopularTags(limit?: number): Promise<PublicPostTag[]>
  getPublicAuthorProfile(authorId: string): Promise<PublicAuthor>
  getPublicAuthorPosts(
    authorId: string,
    page?: number,
    limit?: number,
  ): Promise<PublicAuthorPostsPage>
  searchPosts(query: string): Promise<BlogPostSummary[]>
  getCurrentUserPostsPage(
    status: 'draft' | 'published',
    page: number,
    limit: number,
  ): Promise<{ posts: BlogPostSummary[]; page: number; limit: number; total: number }>
  getEditablePostById(id: string, currentUserId: number): Promise<PublicPostRecord>
  createDraft(input: BlogServicePostInput): Promise<BlogPost>
  updateDraft(id: string, input: BlogServicePostInput): Promise<BlogPost>
  publishPost(id: string | null, input: BlogServicePostInput): Promise<BlogPost>
  deletePostOrThrow(id: string): Promise<void>
}

export interface BlogServicePostInput {
  title: string
  content_markdown: string
  content_json?: string
  tag_names?: string[]
}

/**
 * Blog service configuration
 */
export interface BlogServiceConfig {
  defaultExcerptLength: number
  wordsPerMinute: number
}

/**
 * Business logic result wrapper
 */
export interface BlogServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}
