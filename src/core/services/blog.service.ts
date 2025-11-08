/**
 * Blog Service - Handles blog business logic operations
 * Follows Single Responsibility Principle by focusing on blog-specific business rules
 */

import { IBlogService, BlogServiceConfig, ApiBlogPost, ApiListPostsResponse } from '../types/blog-service.types';
import { BlogPost, BlogPostSummary, BlogSearchOptions } from '../types/blog.types';
import { apiService } from './api.service';

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
 */
export class BlogService implements IBlogService {
  private config: BlogServiceConfig;

  constructor(config: Partial<BlogServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
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
   */
  async getPublishedPosts(options?: BlogSearchOptions): Promise<BlogPostSummary[]> {
    try {
      const params: Record<string, any> = {
        status: 'published',
        ...options,
      };

      const response = await apiService.get<ApiListPostsResponse>('/posts', params);

      // Transform API response to business objects
      return response.data.map(post => this.formatPostForDisplay(post));
    } catch (error) {
      console.error('Failed to fetch published posts:', error);
      return [];
    }
  }

  /**
   * Get blog post by ID
   */
  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const response = await apiService.get<{ data: BlogPost }>(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch post ${id}:`, error);
      return null;
    }
  }

  /**
   * Search blog posts by query
   */
  async searchPosts(query: string): Promise<BlogPostSummary[]> {
    try {
      const response = await apiService.get<{
        data: ApiBlogPost[];
      }>('/posts/search', { q: query });

      return response.data
        .filter(post => post.status === 'published')
        .map(post => this.formatPostForDisplay(post));
    } catch (error) {
      console.error(`Failed to search posts with query "${query}":`, error);
      return [];
    }
  }
}

// Export singleton instance
export const blogService = new BlogService();
