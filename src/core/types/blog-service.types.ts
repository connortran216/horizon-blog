/**
 * Blog Service types and interfaces
 * Defines the contract for blog business logic operations
 */

import { BlogPost, BlogPostSummary, BlogSearchOptions } from './blog.types';

/**
 * API response format for blog posts (matches backend API)
 */
export interface ApiBlogPost {
  id: number;
  title: string;
  content_markdown: string;
  content_json: string;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    email: string;
  };
}

/**
 * API response for list posts endpoint
 */
export interface ApiListPostsResponse {
  data: ApiBlogPost[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Blog service interface - defines business logic operations for blogs
 * Follows Interface Segregation Principle by focusing on blog-specific operations
 */
export interface IBlogService {
  // Business logic operations
  generateExcerpt(content: string, maxLength?: number): string;
  calculateReadingTime(content: string): number;
  formatPostForDisplay(post: ApiBlogPost): BlogPostSummary;

  // Data operations (delegated to repositories)
  getPublishedPosts(options?: BlogSearchOptions): Promise<BlogPostSummary[]>;
  getPostById(id: string): Promise<BlogPost | null>;
  searchPosts(query: string): Promise<BlogPostSummary[]>;
}

/**
 * Blog service configuration
 */
export interface BlogServiceConfig {
  defaultExcerptLength: number;
  wordsPerMinute: number;
}

/**
 * Business logic result wrapper
 */
export interface BlogServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
