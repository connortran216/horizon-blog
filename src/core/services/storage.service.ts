import { BlogPost, BlogPostSummary, BlogSearchOptions, BlogStorageResult } from '../types/blog.types';
import { apiService } from './api.service';

/**
 * Storage service interface for data persistence operations
 * This abstraction allows us to easily switch between localStorage, API, or other storage mechanisms
 */
export interface IStorageService {
  // Blog post operations
  getBlogPosts(options?: BlogSearchOptions): Promise<BlogStorageResult<BlogPostSummary[]>>;
  getBlogPost(id: string): Promise<BlogStorageResult<BlogPost>>;
  saveBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogStorageResult<BlogPost>>;
  updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogStorageResult<BlogPost>>;
  deleteBlogPost(id: string): Promise<BlogStorageResult<boolean>>;

  // User-specific blog operations
  getUserBlogPosts(username: string, options?: BlogSearchOptions): Promise<BlogStorageResult<BlogPostSummary[]>>;
  getUserDrafts(username: string): Promise<BlogStorageResult<BlogPostSummary[]>>;
  getCurrentUserPosts(status?: 'draft' | 'published', page?: number, limit?: number): Promise<BlogStorageResult<BlogPostSummary[]>>;

  // Utility methods
  generateId(): string;
  clearAllData(): Promise<void>;
}

/**
 * Local storage implementation of the storage service
 * This is the current implementation using localStorage
 */
export class LocalStorageService implements IStorageService {
  private readonly STORAGE_KEYS = {
    BLOG_POSTS: 'horizon_blog_posts',
    USERS: 'horizon_blog_users',
  } as const;

  /**
   * Generate a unique ID for new entities
   */
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Get all blog posts with optional filtering and sorting
   */
  async getBlogPosts(options?: BlogSearchOptions): Promise<BlogStorageResult<BlogPostSummary[]>> {
    try {
      const posts = this.getStoredPosts();
      let filteredPosts = posts;

      // Apply filters
      if (options) {
        filteredPosts = this.applyFilters(posts, options);
        filteredPosts = this.applySorting(filteredPosts, options);
        filteredPosts = this.applyPagination(filteredPosts, options);
      }

      return {
        success: true,
        data: filteredPosts,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve blog posts',
      };
    }
  }

  /**
   * Get a single blog post by ID
   */
  async getBlogPost(id: string): Promise<BlogStorageResult<BlogPost>> {
    try {
      const posts = this.getStoredPosts();
      const post = posts.find(p => p.id === id);

      if (!post) {
        return {
          success: false,
          error: 'Blog post not found',
        };
      }

      return {
        success: true,
        data: post,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve blog post',
      };
    }
  }

  /**
   * Save a new blog post or update existing one
   */
  async saveBlogPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogStorageResult<BlogPost>> {
    try {
      const posts = this.getStoredPosts();
      const now = new Date().toISOString();

      // Check if post with same title and author already exists (for duplicates)
      const existingPostIndex = posts.findIndex(
        p => p.title === postData.title && p.author.username === postData.author.username
      );

      let post: BlogPost;

      if (existingPostIndex >= 0) {
        // Update existing post
        post = {
          ...posts[existingPostIndex],
          ...postData,
          updatedAt: now,
        };
        posts[existingPostIndex] = post;
      } else {
        // Create new post
        const id = this.generateId();
        post = {
          ...postData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        posts.unshift(post); // Add to beginning of array
      }

      this.savePosts(posts);

      return {
        success: true,
        data: post,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save blog post',
      };
    }
  }

  /**
   * Update an existing blog post
   */
  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogStorageResult<BlogPost>> {
    try {
      const posts = this.getStoredPosts();
      const postIndex = posts.findIndex(p => p.id === id);

      if (postIndex === -1) {
        return {
          success: false,
          error: 'Blog post not found',
        };
      }

      const updatedPost: BlogPost = {
        ...posts[postIndex],
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      posts[postIndex] = updatedPost;
      this.savePosts(posts);

      return {
        success: true,
        data: updatedPost,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update blog post',
      };
    }
  }

  /**
   * Delete a blog post
   */
  async deleteBlogPost(id: string): Promise<BlogStorageResult<boolean>> {
    try {
      // Try to delete from backend API first
      try {
        await apiService.delete<{ message: string }>(`/posts/${id}`);

        // Also remove from localStorage cache if API succeeds
        const posts = this.getStoredPosts();
        const filteredPosts = posts.filter(p => p.id !== id);
        this.savePosts(filteredPosts);

        return {
          success: true,
          data: true,
        };
      } catch (apiError) {
        console.warn('Failed to delete from backend API, falling back to localStorage:', apiError);

        // Fallback to localStorage if API fails
        const posts = this.getStoredPosts();
        const filteredPosts = posts.filter(p => p.id !== id);

        if (filteredPosts.length === posts.length) {
          return {
            success: false,
            error: 'Blog post not found',
          };
        }

        this.savePosts(filteredPosts);

        return {
          success: true,
          data: true,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete blog post',
      };
    }
  }

  /**
   * Get blog posts by a specific user
   */
  async getUserBlogPosts(username: string, options?: BlogSearchOptions): Promise<BlogStorageResult<BlogPostSummary[]>> {
    try {
      // Try to fetch from backend API first
      try {
        const params: Record<string, any> = { author: username };

        // Add pagination parameters if provided
        if (options?.limit) params.limit = options.limit;
        if (options?.offset) params.offset = options.offset;
        if (options?.status) params.status = options.status;

        const response = await apiService.get<{ data: BlogPostSummary[] }>('/posts', params);

        return {
          success: true,
          data: response.data || [],
        };
      } catch (apiError) {
        console.warn('Failed to fetch from backend API, falling back to localStorage:', apiError);

        // Fallback to localStorage if API fails
        const posts = this.getStoredPosts();
        const userPosts = posts.filter(p => p.author.username === username);

        let filteredPosts = userPosts;

        if (options) {
          filteredPosts = this.applyFilters(userPosts, options);
          filteredPosts = this.applySorting(filteredPosts, options);
          filteredPosts = this.applyPagination(filteredPosts, options);
        }

        return {
          success: true,
          data: filteredPosts,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve user blog posts',
      };
    }
  }

  /**
   * Get draft posts by a specific user
   */
  async getUserDrafts(username: string): Promise<BlogStorageResult<BlogPostSummary[]>> {
    try {
      // Try to fetch from backend API first
      try {
        const params = {
          author: username,
          status: 'draft'
        };

        const response = await apiService.get<{ data: BlogPostSummary[] }>('/posts', params);

        return {
          success: true,
          data: response.data || [],
        };
      } catch (apiError) {
        console.warn('Failed to fetch drafts from backend API, falling back to localStorage:', apiError);

        // Fallback to localStorage if API fails
        const posts = this.getStoredPosts();
        const drafts = posts.filter(p => p.author.username === username && p.status === 'draft');

        return {
          success: true,
          data: drafts,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve user drafts',
      };
    }
  }

  /**
   * Get current authenticated user's posts (using /users/me/posts endpoint)
   */
  async getCurrentUserPosts(status?: 'draft' | 'published', page: number = 1, limit: number = 10): Promise<BlogStorageResult<BlogPostSummary[]>> {
    try {
      const params: Record<string, any> = {
        page,
        limit
      };

      if (status) {
        params.status = status;
      }

      const response = await apiService.get<{ data: BlogPostSummary[] }>('/users/me/posts', params);

      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve current user posts',
      };
    }
  }

  /**
   * Clear all stored data (useful for testing or reset)
   */
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.BLOG_POSTS);
      localStorage.removeItem(this.STORAGE_KEYS.USERS);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  // Private helper methods

  private getStoredPosts(): BlogPost[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.BLOG_POSTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse stored posts:', error);
      return [];
    }
  }

  private savePosts(posts: BlogPost[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.BLOG_POSTS, JSON.stringify(posts));
    } catch (error) {
      console.error('Failed to save posts:', error);
      throw new Error('Failed to save blog posts');
    }
  }

  private applyFilters(posts: BlogPost[], options: BlogSearchOptions): BlogPost[] {
    let filtered = posts;

    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.blocks.root.children.some((node: any) =>
          node.text?.toLowerCase().includes(query)
        )
      );
    }

    if (options.author) {
      filtered = filtered.filter(post => post.author.username === options.author);
    }

    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter(post =>
        options.tags!.some(tag => post.tags?.includes(tag))
      );
    }

    if (options.status) {
      filtered = filtered.filter(post => post.status === options.status);
    }

    return filtered;
  }

  private applySorting(posts: BlogPost[], options: BlogSearchOptions): BlogPost[] {
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    return posts.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      // Handle different sort fields
      switch (sortBy) {
        case 'author':
          aValue = a.author.username;
          bValue = b.author.username;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'viewCount':
          aValue = a.viewCount || 0;
          bValue = b.viewCount || 0;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      // Compare values
      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  private applyPagination(posts: BlogPost[], options: BlogSearchOptions): BlogPost[] {
    if (!options.limit) return posts;

    const offset = options.offset || 0;
    return posts.slice(offset, offset + options.limit);
  }
}

// Export a singleton instance for use throughout the application
export const storageService = new LocalStorageService();
