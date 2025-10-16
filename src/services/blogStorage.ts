/**
 * @deprecated This file is deprecated. Use the new core services instead:
 * - Import { storageService } from '../core/services/storage.service'
 * - Import { calculateReadingTime, generateSlug } from '../core/utils/blog.utils'
 *
 * This file is kept for backward compatibility during migration.
 */

import { BlogPost } from '../types/blog';
import { storageService } from '../core/services/storage.service';
import { generateSlug } from '../core/utils/blog.utils';

// Re-export the new service for backward compatibility
export { storageService };

// Legacy function wrappers for backward compatibility
export const generateId = () => storageService.generateId();
export { generateSlug };

export const saveBlogPost = async (blogPost: BlogPost): Promise<BlogPost> => {
  // Convert old BlogPost format to new format
  const blocks = (blogPost as any).blocks || (blogPost as any).content?.blocks;

  const postData = {
    title: blogPost.title,
    subtitle: blogPost.subtitle,
    excerpt: blogPost.excerpt,
    tags: blogPost.tags,
    featuredImage: blogPost.featuredImage,
    status: blogPost.status,
    author: blogPost.author,
    content: {
      blocks: blocks || { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    },
    slug: (blogPost as any).slug || generateSlug(blogPost.title),
    viewCount: (blogPost as any).viewCount || 0,
    likeCount: (blogPost as any).likeCount || 0,
  };

  const result = await storageService.saveBlogPost(postData);

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to save blog post');
  }

  // Convert back to old format for compatibility
  return {
    ...result.data,
    blocks: result.data.content.blocks, // Extract blocks from content
  } as BlogPost;
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const result = await storageService.getBlogPosts();
  if (!result.success || !result.data) return [];

  // Convert BlogPostSummary[] to BlogPost[] for backward compatibility
  return result.data.map(summary => {
    const post = {
      ...summary,
      blocks: (summary as any).content?.blocks || (summary as any).blocks, // Handle both old and new formats
    };
    return post as unknown as BlogPost;
  });
};

export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  const result = await storageService.getBlogPost(id);
  if (!result.success || !result.data) return null;

  // Convert to old format for backward compatibility
  return {
    ...result.data,
    blocks: result.data.content.blocks, // Extract blocks from content
  } as BlogPost;
};

export const updateBlogPost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> => {
  const result = await storageService.updateBlogPost(id, updates);
  if (!result.success || !result.data) return null;

  // Convert to old format for backward compatibility
  return {
    ...result.data,
    blocks: result.data.content.blocks, // Extract blocks from content
  } as BlogPost;
};

export const deleteBlogPost = async (id: string): Promise<boolean> => {
  const result = await storageService.deleteBlogPost(id);
  return result.success && result.data === true;
};

export const getUserPosts = async (username: string): Promise<BlogPost[]> => {
  const result = await storageService.getUserBlogPosts(username);
  if (!result.success || !result.data) return [];

  // Convert BlogPostSummary[] to BlogPost[] for backward compatibility
  return result.data.map(summary => {
    const post = {
      ...summary,
      blocks: (summary as any).content?.blocks || (summary as any).blocks, // Handle both old and new formats
    };
    return post as unknown as BlogPost;
  });
};

export const getUserDrafts = async (username: string): Promise<BlogPost[]> => {
  const result = await storageService.getUserDrafts(username);
  if (!result.success || !result.data) return [];

  // Convert BlogPostSummary[] to BlogPost[] for backward compatibility
  return result.data.map(summary => {
    const post = {
      ...summary,
      blocks: (summary as any).content?.blocks || (summary as any).blocks, // Handle both old and new formats
    };
    return post as unknown as BlogPost;
  });
};
