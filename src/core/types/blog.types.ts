import { BaseEntity, Author } from './common.types'

/**
 * Blog-specific types and interfaces
 */

// Blog status enumeration
export type BlogStatus = 'draft' | 'published' | 'archived'

// Blog content block types for rich text editor
export type BlockType =
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'blockquote'
  | 'bulleted-list'
  | 'numbered-list'

// Lexical editor node structure
export interface LexicalNode {
  type: string
  text?: string
  children?: LexicalNode[]
  detail?: number
  format?: number
  mode?: string
  style?: string
  version?: number
  direction?: string
  indent?: number
}

// Lexical editor root structure
export interface LexicalRoot {
  children: LexicalNode[]
  direction: string
  format: string
  indent: number
  type: 'root'
  version: number
}

// Complete Lexical editor state
export interface LexicalEditorState {
  root: LexicalRoot
}

// Blog metadata interface
export interface BlogMetadata {
  title: string
  subtitle?: string
  excerpt?: string
  tags?: string[]
  featuredImage?: string
  readingTime?: number
  status: BlogStatus
}

// Blog content interface
export interface BlogContent {
  content_markdown: string
  content_json: string
}

// Blog author interface (extends base Author)
export interface BlogAuthor extends Author {
  bio?: string
  website?: string
}

// Complete blog post interface
export interface BlogPost extends BaseEntity, BlogMetadata {
  author: BlogAuthor
  content_markdown: string
  content_json: string
  slug: string
  viewCount?: number
  likeCount?: number
  user_id?: number
}

// Blog post creation data (for new posts)
export interface CreateBlogPostData extends Omit<BlogPost, keyof BaseEntity | 'slug'> {
  id?: string // Optional, will be generated if not provided
}

// Blog post update data (for existing posts)
export interface UpdateBlogPostData extends Partial<Omit<BlogPost, keyof BaseEntity>> {
  id: string // Required for updates
}

// Blog post summary (for listings)
export type BlogPostSummary = Pick<
  BlogPost,
  | 'id'
  | 'title'
  | 'subtitle'
  | 'excerpt'
  | 'author'
  | 'createdAt'
  | 'updatedAt'
  | 'readingTime'
  | 'tags'
  | 'status'
  | 'slug'
  | 'viewCount'
  | 'likeCount'
>

// Blog storage operations result
export interface BlogStorageResult<T> {
  success: boolean
  data?: T
  error?: string
}

// Blog search and filter options
export interface BlogSearchOptions {
  query?: string
  author?: string
  tags?: string[]
  status?: BlogStatus
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'viewCount' | 'author'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// Backend API Response Types (matching api-docs.json)
export interface ListPostsResponse {
  data: BlogPost[]
  page: number
  limit: number
  total: number
}

export interface PostResponse {
  data: BlogPost
  message: string
}

export interface CreatePostRequest {
  title: string
  content_json: string
  content_markdown: string
  status?: 'draft' | 'published'
  tag_names?: string[]
}

export interface UpdatePostRequest {
  title: string
  content_json: string
  content_markdown: string
  status: 'draft' | 'published'
}

export interface PatchPostRequest {
  title?: string
  content_json?: string
  content_markdown?: string
  status?: 'draft' | 'published'
}
