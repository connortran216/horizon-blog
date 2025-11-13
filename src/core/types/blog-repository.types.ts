/**
 * Blog Repository types and interfaces
 * Defines the contract for blog data access operations
 * Follows Repository Pattern for SOLID principles
 */

import { BlogPost, BlogPostSummary, BlogSearchOptions } from './blog.types'

/**
 * Repository result wrapper
 */
export interface RepositoryResult<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    page?: number
    limit?: number
    total?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

/**
 * Blog Repository interface
 * Abstracts data access layer, following Interface Segregation and Dependency Inversion
 */
export interface IBlogRepository {
  // Basic CRUD operations
  getPublishedPosts(options?: BlogSearchOptions): Promise<RepositoryResult<BlogPostSummary[]>>
  getPostById(id: string): Promise<RepositoryResult<BlogPost>>
  createPost(
    post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<RepositoryResult<BlogPost>>
  updatePost(id: string, updates: Partial<BlogPost>): Promise<RepositoryResult<BlogPost>>
  deletePost(id: string): Promise<RepositoryResult<boolean>>

  // User-specific operations
  getUserPosts(
    username: string,
    options?: BlogSearchOptions,
  ): Promise<RepositoryResult<BlogPostSummary[]>>
  getUserDrafts(username: string): Promise<RepositoryResult<BlogPostSummary[]>>
  getCurrentUserPosts(
    status?: 'draft' | 'published',
    page?: number,
    limit?: number,
  ): Promise<RepositoryResult<BlogPostSummary[]>>

  // Search operations
  searchPosts(
    query: string,
    options?: BlogSearchOptions,
  ): Promise<RepositoryResult<BlogPostSummary[]>>

  // Utility operations
  clearCache(): Promise<void>
  getCacheStatus(): { hasData: boolean; lastUpdated?: Date }
}

/**
 * Cache configuration
 */
export interface RepositoryCacheConfig {
  enabled: boolean
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum number of items to cache
}

/**
 * Repository configuration
 */
export interface RepositoryConfig {
  cache?: Partial<RepositoryCacheConfig>
  retryAttempts?: number
  retryDelay?: number
}
