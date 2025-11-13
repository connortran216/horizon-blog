/**
 * API Blog Repository - Implementation of IBlogRepository
 * Handles all data access operations for blog posts
 * Follows Repository Pattern for SOLID principles
 */

import {
  IBlogRepository,
  RepositoryResult,
  RepositoryConfig,
  RepositoryCacheConfig,
} from '../types/blog-repository.types'
import { BlogPost, BlogPostSummary, BlogSearchOptions, BlogStatus } from '../types/blog.types'
import { ApiBlogPost, ApiListPostsResponse } from '../types/blog-service.types'
import { apiService } from '../services/api.service'

/**
 * Default configuration for blog repository
 */
const DEFAULT_CACHE_CONFIG: RepositoryCacheConfig = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
}

const DEFAULT_CONFIG: RepositoryConfig = {
  cache: DEFAULT_CACHE_CONFIG,
  retryAttempts: 3,
  retryDelay: 1000,
}

/**
 * API Blog Repository Implementation
 * Provides data access layer with caching, retry logic, and error handling
 */
export class ApiBlogRepository implements IBlogRepository {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map()
  private config: RepositoryConfig
  private lastUpdate: Date = new Date()

  constructor(config: RepositoryConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      cache: { ...DEFAULT_CACHE_CONFIG, ...config.cache },
    }
  }

  /**
   * Generate cache key for operations
   */
  private generateCacheKey(operation: string, params?: unknown): string {
    return `${operation}_${JSON.stringify(params || {})}`
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > (this.config.cache?.ttl || 0)
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: unknown): void {
    if (!this.config.cache?.enabled) return

    // Evict oldest entries if cache is full
    if (this.cache.size >= (this.config.cache.maxSize || 100)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Remove specific cache entry
   */
  private removeFromCache(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all related caches
   */
  private clearRelatedCaches(): void {
    // Clear all caches since data has changed
    this.cache.clear()
  }

  /**
   * Transform API post for display (summary view)
   */
  private transformPostForDisplay(post: ApiBlogPost): BlogPostSummary {
    return {
      id: post.id.toString(),
      title: post.title,
      excerpt: this.generateExcerpt(post.content_markdown),
      author: {
        username: post.user?.name || 'Anonymous',
        avatar: undefined,
      },
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      readingTime: this.calculateReadingTime(post.content_markdown),
      tags: [],
      status: post.status as BlogStatus,
      slug: post.id.toString(),
    }
  }

  /**
   * Transform full blog post
   */
  private transformFullPost(post: BlogPost): BlogPost {
    // For now, return as-is since it's already in the right format
    return post
  }

  /**
   * Transform business object to API format
   */
  private transformToApiPost(post: unknown): unknown {
    // For now, return as-is since the API accepts the same format
    return post
  }

  /**
   * Generate excerpt from markdown content
   */
  private generateExcerpt(content: string, maxLength: number = 150): string {
    if (!content) return 'No content'

    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headings
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/>\s+/g, '') // Remove blockquotes
      .replace(/[-*+]\s+/g, '') // Remove list markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()

    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText
  }

  /**
   * Calculate reading time based on word count
   */
  private calculateReadingTime(content: string): number {
    const words = content.split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200)) // 200 words per minute
  }

  /**
   * Get published blog posts with optional filtering
   */
  async getPublishedPosts(
    options?: BlogSearchOptions,
  ): Promise<RepositoryResult<BlogPostSummary[]>> {
    try {
      const cacheKey = this.generateCacheKey('published', options)

      // Check cache first
      const cached = this.getFromCache(cacheKey) as BlogPostSummary[] | null
      if (cached) {
        return { success: true, data: cached }
      }

      const params: Record<string, unknown> = {
        status: 'published',
        ...options,
      }

      const response = await apiService.get<ApiListPostsResponse>('/posts', params)

      // Transform API data to business objects
      const posts = response.data.map((post) => this.transformPostForDisplay(post))

      // Cache the result
      this.setCache(cacheKey, posts)

      this.lastUpdate = new Date()

      return {
        success: true,
        data: posts,
        metadata: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasNext: response.page * response.limit < response.total,
          hasPrev: response.page > 1,
        },
      }
    } catch (error: unknown) {
      console.error('Failed to fetch published posts:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch published posts',
      }
    }
  }

  /**
   * Get blog post by ID
   */
  async getPostById(id: string): Promise<RepositoryResult<BlogPost>> {
    try {
      const cacheKey = `post_${id}`

      // Check cache first
      const cached = this.getFromCache(cacheKey) as BlogPost | null
      if (cached) {
        return { success: true, data: cached }
      }

      const response = await apiService.get<{ data: BlogPost }>(`/posts/${id}`)

      // Transform API data if needed
      const post = this.transformFullPost(response.data)

      // Cache the result
      this.setCache(cacheKey, post)

      this.lastUpdate = new Date()

      return { success: true, data: post }
    } catch (error: unknown) {
      console.error(`Failed to fetch post ${id}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog post',
      }
    }
  }

  /**
   * Create new blog post
   */
  async createPost(
    post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<RepositoryResult<BlogPost>> {
    try {
      // Transform business object to API format
      const apiPost = this.transformToApiPost(post)

      const response = await apiService.post<{ data: BlogPost }>('/posts', apiPost)

      // Clear relevant caches
      this.clearRelatedCaches()

      return { success: true, data: response.data }
    } catch (error: unknown) {
      console.error('Failed to create post:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create blog post',
      }
    }
  }

  /**
   * Update existing blog post
   */
  async updatePost(id: string, updates: Partial<BlogPost>): Promise<RepositoryResult<BlogPost>> {
    try {
      // Transform updates to API format
      const apiUpdates = this.transformToApiPost(updates)

      const response = await apiService.put<{ data: BlogPost }>(`/posts/${id}`, apiUpdates)

      // Clear relevant caches
      this.clearRelatedCaches()
      this.removeFromCache(`post_${id}`)

      return { success: true, data: response.data }
    } catch (error: unknown) {
      console.error(`Failed to update post ${id}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update blog post',
      }
    }
  }

  /**
   * Delete blog post
   */
  async deletePost(id: string): Promise<RepositoryResult<boolean>> {
    try {
      await apiService.delete<{ message: string }>(`/posts/${id}`)

      // Clear relevant caches
      this.clearRelatedCaches()
      this.removeFromCache(`post_${id}`)

      return { success: true, data: true }
    } catch (error: unknown) {
      console.error(`Failed to delete post ${id}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete blog post',
      }
    }
  }

  /**
   * Get blog posts by a specific user
   */
  async getUserPosts(
    username: string,
    options?: BlogSearchOptions,
  ): Promise<RepositoryResult<BlogPostSummary[]>> {
    try {
      const cacheKey = this.generateCacheKey('user', { ...options, author: username })

      // Check cache first
      const cached = this.getFromCache(cacheKey) as BlogPostSummary[] | null
      if (cached) {
        return { success: true, data: cached }
      }

      const params: Record<string, unknown> = { author: username, ...options }
      const response = await apiService.get<ApiListPostsResponse>('/posts', params)

      const posts = response.data.map((post) => this.transformPostForDisplay(post))

      // Cache the result
      this.setCache(cacheKey, posts)

      return { success: true, data: posts }
    } catch (error: unknown) {
      console.error(`Failed to fetch user posts for ${username}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve user blog posts',
      }
    }
  }

  /**
   * Get draft posts by a specific user
   */
  async getUserDrafts(username: string): Promise<RepositoryResult<BlogPostSummary[]>> {
    return this.getUserPosts(username, { status: 'draft' })
  }

  /**
   * Get current authenticated user's posts
   */
  async getCurrentUserPosts(
    status?: 'draft' | 'published',
    page: number = 1,
    limit: number = 10,
  ): Promise<RepositoryResult<BlogPostSummary[]>> {
    try {
      const cacheKey = this.generateCacheKey('current-user', { status, page, limit })

      // Check cache first
      const cached = this.getFromCache(cacheKey) as BlogPostSummary[] | null
      if (cached) {
        return { success: true, data: cached }
      }

      const params: Record<string, unknown> = { page, limit }
      if (status) params.status = status

      const response = await apiService.get<{ data: BlogPostSummary[] }>('/users/me/posts', params)

      // Cache the result
      this.setCache(cacheKey, response.data)

      return { success: true, data: response.data || [] }
    } catch (error: unknown) {
      console.error('Failed to fetch current user posts:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve current user posts',
      }
    }
  }

  /**
   * Search blog posts by query
   */
  async searchPosts(
    query: string,
    options?: BlogSearchOptions,
  ): Promise<RepositoryResult<BlogPostSummary[]>> {
    try {
      const cacheKey = this.generateCacheKey('search', { query, ...options })

      // Check cache first
      const cached = this.getFromCache(cacheKey) as BlogPostSummary[] | null
      if (cached) {
        return { success: true, data: cached }
      }

      const params: Record<string, unknown> = { q: query, ...options }
      const response = await apiService.get<{ data: ApiBlogPost[] }>('/posts/search', params)

      const posts = response.data
        .filter((post) => post.status === 'published')
        .map((post) => this.transformPostForDisplay(post))

      // Cache the result
      this.setCache(cacheKey, posts)

      return { success: true, data: posts }
    } catch (error: unknown) {
      console.error(`Failed to search posts with query "${query}":`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search blog posts',
      }
    }
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    this.cache.clear()
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { hasData: boolean; lastUpdated?: Date } {
    return {
      hasData: this.cache.size > 0,
      lastUpdated: this.lastUpdate,
    }
  }
}

// Export singleton instance
export const blogRepository = new ApiBlogRepository()
