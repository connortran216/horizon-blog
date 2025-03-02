// Types for rich content blocks
export type BlockType = 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 'blockquote' | 'bulleted-list' | 'numbered-list';

// Generic content block for flexibility in handling different editor outputs
export type ContentBlock = any;

export interface BlogMetadata {
  id: string;
  title: string;
  subtitle?: string;
  author: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  readingTime?: number; // Estimated reading time in minutes
  tags?: string[];
  status: 'draft' | 'published';
  featuredImage?: string;
}

export interface BlogPost extends BlogMetadata {
  blocks: any; // Using any to accommodate different formats from the editor
} 