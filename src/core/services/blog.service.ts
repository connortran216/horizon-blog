/**
 * Blog Service - Handles blog business logic operations
 * Follows Single Responsibility Principle by focusing on blog-specific business rules
 * Uses Repository Pattern through DI for data access
 */

import { IBlogService, BlogServiceConfig, ApiBlogPost } from '../types/blog-service.types';
import { BlogPost, BlogPostSummary, BlogSearchOptions } from '../types/blog.types';
import { IBlogRepository } from '../types/blog-repository.types';
import { getBlogRepository } from '../di/container';
import { RepositoryResult } from '../types/blog-repository.types';

/**
 * Default configuration for blog service
 */
const DEFAULT_CONFIG: BlogServiceConfig = {
  defaultExcerptLength: 150,
  wordsPerMinute: 200,
};

/**
 * Blog service implementation
 * Handles business logic for blog operations
 * Delegates data access to repository through DI
 */
export class BlogService implements IBlogService {
  private config: BlogServiceConfig;
  private repository: IBlogRepository;

  constructor(config: Partial<BlogServiceConfig> = {}, repository?: IBlogRepository) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.repository = repository || getBlogRepository();
  }

  /**
   * Generate excerpt from markdown content
   * Removes markdown syntax and truncates to specified length
   */
  generateExcerpt(content: string, maxLength?: number): string {
    if (!content) return 'No content';

    const length = maxLength || this.config.defaultExcerptLength;

    // Remove markdown syntax (simple approach)
    let plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headings
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/>\s+/g, '') // Remove blockquotes
      .replace(/[-*+]\s+/g, '') // Remove list markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    return plainText.length > length
      ? plainText.substring(0, length) + '...'
      : plainText;
  }

  /**
   * Calculate reading time based on word count
   * Uses configured words per minute rate
   */
  calculateReadingTime(content: string): number {
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / this.config.wordsPerMinute));
  }

  /**
   * Format API blog post for display (summary view)
   * Applies business logic for excerpt and reading time
   */
  formatPostForDisplay(post: ApiBlogPost): BlogPostSummary {
    return {
      id: post.id.toString(),
      title: post.title,
      excerpt: this.generateExcerpt(post.content_markdown),
      author: {
        username: post.user?.name || 'Anonymous',
        avatar: undefined, // API doesn't provide avatar
      },
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      readingTime: this.calculateReadingTime(post.content_markdown),
      tags: [], // API doesn't provide tags in list view
      status: post.status as any,
      slug: post.id.toString(),
    };
  }

  /**
   * Get published blog posts with optional filtering
   * Delegates to repository for data access
   */
  async getPublishedPosts(options?: BlogSearchOptions): Promise<BlogPostSummary[]> {
    try {
      const result: RepositoryResult<BlogPostSummary[]> = await this.repository.getPublishedPosts(options);
      return result.success && result.data ? result.data : [];
    } catch (error) {
      console.error('Failed to fetch published posts:', error);
      return [];
    }
  }

  /**
   * Get blog post by ID
   * Delegates to repository for data access
   */
  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const result: RepositoryResult<BlogPost> = await this.repository.getPostById(id);
      return result.success && result.data ? result.data : null;
    } catch (error) {
      console.error(`Failed to fetch post ${id}:`, error);
      return null;
    }
  }

  /**
   * Search blog posts by query
   * Delegates to repository for data access
   */
  async searchPosts(query: string, options?: BlogSearchOptions): Promise<BlogPostSummary[]> {
    try {
      const result: RepositoryResult<BlogPostSummary[]> = await this.repository.searchPosts(query, options);
      return result.success && result.data ? result.data : [];
    } catch (error) {
      console.error(`Failed to search posts with query "${query}":`, error);
      return [];
    }
  }

  /**
   * Get user posts
   * Delegates to repository for data access
   */
  async getUserPosts(username: string, options?: BlogSearchOptions): Promise<BlogPostSummary[]> {
    try {
      const result: RepositoryResult<BlogPostSummary[]> = await this.repository.getUserPosts(username, options);
      return result.success && result.data ? result.data : [];
    } catch (error) {
      console.error(`Failed to fetch user posts for ${username}:`, error);
      return [];
    }
  }

  /**
   * Get current user posts
   * Delegates to repository for data access
   */
  async getCurrentUserPosts(status?: 'draft' | 'published', page?: number, limit?: number): Promise<BlogPostSummary[]> {
    try {
      const result: RepositoryResult<BlogPostSummary[]> = await this.repository.getCurrentUserPosts(status, page, limit);
      return result.success && result.data ? result.data : [];
    } catch (error) {
      console.error('Failed to fetch current user posts:', error);
      return [];
    }
  }

  /**
   * Create new blog post
   * Delegates to repository for data access
   */
  async createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost | null> {
    try {
      const result: RepositoryResult<BlogPost> = await this.repository.createPost(post);
      return result.success && result.data ? result.data : null;
    } catch (error) {
      console.error('Failed to create post:', error);
      return null;
    }
  }

  /**
   * Update blog post
   * Delegates to repository for data access
   */
  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const result: RepositoryResult<BlogPost> = await this.repository.updatePost(id, updates);
      return result.success && result.data ? result.data : null;
    } catch (error) {
      console.error(`Failed to update post ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete blog post
   * Delegates to repository for data access
   */
  async deletePost(id: string): Promise<boolean> {
    try {
      const result: RepositoryResult<boolean> = await this.repository.deletePost(id);
      return result.success && result.data ? true : false;
    } catch (error) {
      console.error(`Failed to delete post ${id}:`, error);
      return false;
    }
  }

  /**
   * Get blog post by ID with enriched data
   * Combines repository data with business logic formatting
   */
  async getPostByIdEnriched(id: string): Promise<BlogPost | null> {
    try {
      const result: RepositoryResult<BlogPost> = await this.repository.getPostById(id);
      if (!result.success || !result.data) {
        return null;
      }

      const post = result.data;
      
      // Apply business logic enrichment
      const enrichedPost: BlogPost = {
        ...post,
        // Ensure excerpt is generated for display
        excerpt: post.excerpt || this.generateExcerpt(post.content_markdown),
        // Ensure reading time is calculated
        readingTime: post.readingTime || this.calculateReadingTime(post.content_markdown),
      };

      return enrichedPost;
    } catch (error) {
      console.error(`Failed to fetch enriched post ${id}:`, error);
      return null;
    }
  }
}

// Export singleton instance factory to avoid circular dependency
export const createBlogServiceInstance = (): BlogService => new BlogService();
