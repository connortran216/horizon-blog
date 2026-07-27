export const MAX_COMMENT_CONTENT_LENGTH = 2000
export const DEFAULT_COMMENT_PAGE_LIMIT = 20

export type CommentDepth = 0 | 1 | 2

export interface ApiCommentAuthor {
  name: string
  avatar_url?: string
}

export interface ApiComment {
  id: number
  parent_id: number | null
  depth: number
  content: string | null
  author: ApiCommentAuthor | null
  created_at: string
  edited_at: string | null
  is_removed: boolean
  reply_count: number
  can_edit: boolean
  can_remove: boolean
  can_reply: boolean
}

export interface ApiCommentPagination {
  limit: number
  next_cursor: string | null
  has_more: boolean
}

export interface ApiCommentDiscussion {
  comments_open: boolean
  comment_count: number
  can_create: boolean
  can_manage_comments: boolean
}

export interface ApiListCommentsResponse {
  data: ApiComment[]
  pagination: ApiCommentPagination
  discussion: ApiCommentDiscussion
}

export interface ApiCommentResponse {
  data: ApiComment
}

export interface ApiRemoveCommentResponse {
  data: {
    id: number
    is_removed: boolean
    retain_tombstone: boolean
  }
}

export interface ApiCommentSettingsResponse {
  data: {
    comments_open: boolean
  }
}

export interface ListCommentsQuery {
  parentId?: number
  cursor?: string
  limit?: number
}

export interface CreateCommentRequest {
  content: string
  parentId: number | null
  submissionId: string
}

export interface UpdateCommentRequest {
  content: string
}

export interface CommentAuthor {
  name: string
  avatarUrl?: string
}

export interface Comment {
  id: number
  parentId: number | null
  depth: CommentDepth
  content: string | null
  author: CommentAuthor | null
  createdAt: string
  editedAt: string | null
  isRemoved: boolean
  replyCount: number
  canEdit: boolean
  canRemove: boolean
  canReply: boolean
}

export interface CommentPagination {
  limit: number
  nextCursor: string | null
  hasMore: boolean
}

export interface CommentDiscussion {
  commentsOpen: boolean
  commentCount: number
  canCreate: boolean
  canManageComments: boolean
}

export interface CommentPage {
  comments: Comment[]
  pagination: CommentPagination
  discussion: CommentDiscussion
}

export interface CreateCommentInput {
  content: string
  parentId?: number | null
  submissionId: string
}

export interface RemoveCommentResult {
  id: number
  isRemoved: boolean
  retainTombstone: boolean
}

export interface CommentSettings {
  commentsOpen: boolean
}

export interface SiblingPageState {
  items: Comment[]
  nextCursor: string | null
  hasMore: boolean
  loading: boolean
  error: string | null
}

export interface PendingSubmission {
  content: string
  parentId: number | null
  submissionId: string
}
