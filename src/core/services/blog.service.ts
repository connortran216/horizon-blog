/**
 * Blog Service - Handles blog business logic operations
 * Follows Single Responsibility Principle by focusing on blog-specific business rules
 * Uses Repository Pattern through DI for data access
 */

import {
  IBlogService,
  BlogServiceConfig,
  ApiBlogPost,
  BlogServicePostInput,
} from '../types/blog-service.types'
import {
  BlogArchiveOptions,
  BlogPost,
  BlogPostSummary,
  BlogSearchOptions,
  PublicAuthor,
  PublicAuthorPostsPage,
  PublicPostRecord,
  PublicPostTag,
  PublicPostsPage,
} from '../types/blog.types'
import { IBlogRepository } from '../types/blog-repository.types'
import { RepositoryResult } from '../types/blog-repository.types'
import { ApiError } from './api.service'
import {
  calculateReadingTime,
  enrichBlogPostDisplayFields,
  generateMarkdownExcerpt,
  mapApiPostToSummary,
} from '../utils/blog-mapping.utils'

/**
 * Default configuration for blog service
 */
const DEFAULT_CONFIG: BlogServiceConfig = {
  defaultExcerptLength: 150,
  wordsPerMinute: 200,
}

/**
 * Blog service implementation
 * Handles business logic for blog operations
 * Delegates data access to repository through DI
 */
export class BlogService implements IBlogService {
  private config: BlogServiceConfig
  private repository: IBlogRepository

  constructor(repository: IBlogRepository, config: Partial<BlogServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.repository = repository
  }

  private toServiceError<T>(result: RepositoryResult<T>, fallback: string): Error {
    if (result.statusCode) {
      return new ApiError(result.error || fallback, result.statusCode)
    }

    return new Error(result.error || fallback)
  }

  private unwrapResult<T>(result: RepositoryResult<T>, fallback: string): T {
    if (!result.success || result.data === undefined) {
      throw this.toServiceError(result, fallback)
    }

    return result.data
  }

  private toPostPayload(
    input: BlogServicePostInput,
    status: 'draft' | 'published',
  ): Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> & { tag_names?: string[] } {
    return {
      title: input.title.trim(),
      content_markdown: input.content_markdown,
      content_json: input.content_json || '{}',
      status,
      tag_names: input.tag_names,
      tags: input.tag_names || [],
      author: { username: '', avatar: undefined },
      excerpt: '',
      slug: '',
      readingTime: 1,
    }
  }

  /**
   * Generate excerpt from markdown content
   * Removes markdown syntax and truncates to specified length
   */
  generateExcerpt(content: string, maxLength?: number): string {
    const length = maxLength || this.config.defaultExcerptLength
    return generateMarkdownExcerpt(content, length)
  }

  /**
   * Calculate reading time based on word count
   * Uses configured words per minute rate
   */
  calculateReadingTime(content: string): number {
    return calculateReadingTime(content, this.config.wordsPerMinute)
  }

  /**
   * Format API blog post for display (summary view)
   * Applies business logic for excerpt and reading time
   */
  formatPostForDisplay(post: ApiBlogPost): BlogPostSummary {
    return mapApiPostToSummary(post, {
      excerptLength: this.config.defaultExcerptLength,
      wordsPerMinute: this.config.wordsPerMinute,
    })
  }

  /**
   * Get published blog posts with optional filtering
   * Delegates to repository for data access
   */
  async getPublishedPosts(options?: BlogSearchOptions): Promise<BlogPostSummary[]> {
    try {
      const result: RepositoryResult<BlogPostSummary[]> =
        await this.repository.getPublishedPosts(options)
      return result.success && result.data ? result.data : []
    } catch (error) {
      console.error('Failed to fetch published posts:', error)
      return []
    }
  }

  async getPublishedArchivePosts(options: BlogArchiveOptions): Promise<PublicPostsPage> {
    const hasSearchFilters = Boolean(options.q || options.tags?.length)
    const result = hasSearchFilters
      ? await this.repository.searchPostRecords(options)
      : await this.repository.getPublishedPostRecords(options)

    return this.unwrapResult(result, 'Failed to fetch published posts')
  }

  /**
   * Get blog post by ID
   * Delegates to repository for data access
   */
  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const result: RepositoryResult<BlogPost> = await this.repository.getPostById(id)
      return result.success && result.data ? result.data : null
    } catch (error) {
      console.error(`Failed to fetch post ${id}:`, error)
      return null
    }
  }

  async getPublicPostDetail(id: string): Promise<PublicPostRecord> {
    const result = await this.repository.getPublicPostRecordById(id)
    return this.unwrapResult(result, 'Failed to fetch blog post')
  }

  async getPopularTags(limit: number = 8): Promise<PublicPostTag[]> {
    const result = await this.repository.getPopularTags(limit)
    return this.unwrapResult(result, 'Failed to fetch popular tags')
  }

  async getPublicAuthorProfile(authorId: string): Promise<PublicAuthor> {
    const result = await this.repository.getPublicAuthorProfile(authorId)

    if (!result.success || !result.data) {
      if (result.statusCode) {
        throw new ApiError(
          result.error || 'Failed to fetch public author profile',
          result.statusCode,
        )
      }

      throw new Error(result.error || 'Failed to fetch public author profile')
    }

    return result.data
  }

  async getPublicAuthorPosts(
    authorId: string,
    page: number = 1,
    limit: number = 6,
  ): Promise<PublicAuthorPostsPage> {
    const result = await this.repository.getPublicAuthorPosts(authorId, page, limit)

    if (!result.success || !result.data) {
      if (result.statusCode) {
        throw new ApiError(result.error || 'Failed to fetch public author posts', result.statusCode)
      }

      throw new Error(result.error || 'Failed to fetch public author posts')
    }

    return result.data
  }

  /**
   * Search blog posts by query
   * Delegates to repository for data access
   */
  async searchPosts(query: string, options?: BlogSearchOptions): Promise<BlogPostSummary[]> {
    try {
      const result: RepositoryResult<BlogPostSummary[]> = await this.repository.searchPosts(
        query,
        options,
      )
      return result.success && result.data ? result.data : []
    } catch (error) {
      console.error(`Failed to search posts with query "${query}":`, error)
      return []
    }
  }

  /**
   * Get user posts
   * Delegates to repository for data access
   */
  async getUserPosts(username: string, options?: BlogSearchOptions): Promise<BlogPostSummary[]> {
    try {
      const result: RepositoryResult<BlogPostSummary[]> = await this.repository.getUserPosts(
        username,
        options,
      )
      return result.success && result.data ? result.data : []
    } catch (error) {
      console.error(`Failed to fetch user posts for ${username}:`, error)
      return []
    }
  }

  /**
   * Get current user posts
   * Delegates to repository for data access
   */
  async getCurrentUserPosts(
    status?: 'draft' | 'published',
    page?: number,
    limit?: number,
  ): Promise<BlogPostSummary[]> {
    try {
      const result: RepositoryResult<BlogPostSummary[]> = await this.repository.getCurrentUserPosts(
        status,
        page,
        limit,
      )
      return result.success && result.data ? result.data : []
    } catch (error) {
      console.error('Failed to fetch current user posts:', error)
      return []
    }
  }

  async getCurrentUserPostsPage(
    status: 'draft' | 'published',
    page: number,
    limit: number,
  ): Promise<{ posts: BlogPostSummary[]; page: number; limit: number; total: number }> {
    const result = await this.repository.getCurrentUserPosts(status, page, limit)
    const posts = this.unwrapResult(result, 'Failed to fetch current user posts')

    return {
      posts,
      page: result.metadata?.page ?? page,
      limit: result.metadata?.limit ?? limit,
      total: result.metadata?.total ?? posts.length,
    }
  }

  async getEditablePostById(id: string, currentUserId: number): Promise<PublicPostRecord> {
    const result = await this.repository.getCurrentUserPostById(id)
    const post = this.unwrapResult(result, 'Failed to load post')

    if (post.user_id !== currentUserId) {
      throw new ApiError('You do not have permission to edit this post.', 403)
    }

    return post
  }

  /**
   * Create new blog post
   * Delegates to repository for data access
   */
  async createPost(
    post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BlogPost | null> {
    try {
      const result: RepositoryResult<BlogPost> = await this.repository.createPost(post)
      return result.success && result.data ? result.data : null
    } catch (error) {
      console.error('Failed to create post:', error)
      return null
    }
  }

  async createDraft(input: BlogServicePostInput): Promise<BlogPost> {
    const result = await this.repository.createPost(this.toPostPayload(input, 'draft'))
    return this.unwrapResult(result, 'Failed to create draft')
  }

  /**
   * Update blog post
   * Delegates to repository for data access
   */
  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const result: RepositoryResult<BlogPost> = await this.repository.updatePost(id, updates)
      return result.success && result.data ? result.data : null
    } catch (error) {
      console.error(`Failed to update post ${id}:`, error)
      return null
    }
  }

  async updateDraft(id: string, input: BlogServicePostInput): Promise<BlogPost> {
    const updates = this.toPostPayload(input, 'draft') as Partial<BlogPost> & {
      tag_names?: string[]
    }
    const result = await this.repository.updatePost(id, updates)
    return this.unwrapResult(result, 'Failed to update draft')
  }

  async publishPost(id: string | null, input: BlogServicePostInput): Promise<BlogPost> {
    const payload = this.toPostPayload(input, 'published')

    if (id) {
      const result = await this.repository.updatePost(
        id,
        payload as Partial<BlogPost> & { tag_names?: string[] },
      )
      return this.unwrapResult(result, 'Failed to publish blog post')
    }

    const result = await this.repository.createPost(payload)
    return this.unwrapResult(result, 'Failed to publish blog post')
  }

  /**
   * Delete blog post
   * Delegates to repository for data access
   */
  async deletePost(id: string): Promise<boolean> {
    try {
      const result: RepositoryResult<boolean> = await this.repository.deletePost(id)
      return result.success && result.data ? true : false
    } catch (error) {
      console.error(`Failed to delete post ${id}:`, error)
      return false
    }
  }

  async deletePostOrThrow(id: string): Promise<void> {
    const result = await this.repository.deletePost(id)
    this.unwrapResult(result, 'Failed to delete blog post')
  }

  /**
   * Get blog post by ID with enriched data
   * Combines repository data with business logic formatting
   */
  async getPostByIdEnriched(id: string): Promise<BlogPost | null> {
    try {
      const result: RepositoryResult<BlogPost> = await this.repository.getPostById(id)
      if (!result.success || !result.data) {
        return null
      }

      const post = result.data

      const enrichedPost = enrichBlogPostDisplayFields(post, {
        excerptLength: this.config.defaultExcerptLength,
        wordsPerMinute: this.config.wordsPerMinute,
      })

      return enrichedPost
    } catch (error) {
      console.error(`Failed to fetch enriched post ${id}:`, error)
      return null
    }
  }
}

// Export singleton instance factory to avoid circular dependency
export const createBlogServiceInstance = (repository: IBlogRepository): BlogService =>
  new BlogService(repository)
