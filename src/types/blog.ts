/**
 * @deprecated This file is deprecated. Use the new core types instead:
 * - Import types from '../core/types/blog.types'
 *
 * This file is kept for backward compatibility during migration.
 */

// Re-export new types for backward compatibility
export type {
  BlogPost,
  BlogPostSummary,
  BlogMetadata,
  BlogContent,
  BlogAuthor,
  BlogStatus,
  BlockType,
  LexicalEditorState,
  LexicalNode,
  LexicalRoot,
  CreateBlogPostData,
  UpdateBlogPostData,
  BlogSearchOptions,
  BlogStorageResult,
} from '../core/types/blog.types';

export type {
  BaseEntity,
  User,
  Author,
  AppError,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  SearchParams,
  SortOptions,
} from '../core/types/common.types';

// Legacy type aliases for backward compatibility
export type ContentBlock = any; // @deprecated Use LexicalEditorState instead
