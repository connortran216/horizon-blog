import { ApiError } from '../../core/services/api.service'
import { RepositoryResult } from '../../core/types/blog-repository.types'
import { ApiCommentsRepository, CommentsRepositoryPort } from './comments.repository'
import {
  ApiComment,
  ApiCommentResponse,
  ApiCommentSettingsResponse,
  ApiListCommentsResponse,
  ApiRemoveCommentResponse,
  Comment,
  CommentDepth,
  CommentPage,
  CommentSettings,
  CreateCommentInput,
  ListCommentsQuery,
  MAX_COMMENT_CONTENT_LENGTH,
  RemoveCommentResult,
} from './comments.types'

export class CommentsService {
  constructor(
    private readonly repository: CommentsRepositoryPort = new ApiCommentsRepository(),
  ) {}

  async listComments(postId: number, query: ListCommentsQuery = {}): Promise<CommentPage> {
    const response = this.unwrap(
      await this.repository.listComments(postId, query),
      'Failed to load comments.',
    )

    return {
      comments: response.data.map((comment) => this.mapComment(comment)),
      pagination: {
        limit: response.pagination.limit,
        nextCursor: response.pagination.next_cursor,
        hasMore: response.pagination.has_more,
      },
      discussion: {
        commentsOpen: response.discussion.comments_open,
        commentCount: response.discussion.comment_count,
        canCreate: response.discussion.can_create,
        canManageComments: response.discussion.can_manage_comments,
      },
    }
  }

  async createComment(postId: number, input: CreateCommentInput): Promise<Comment> {
    const content = validateCommentContent(input.content)
    const response = this.unwrap(
      await this.repository.createComment(postId, {
        content,
        parentId: input.parentId ?? null,
        submissionId: input.submissionId,
      }),
      'Failed to create comment.',
    )

    return this.mapComment(response.data)
  }

  async updateComment(postId: number, commentId: number, content: string): Promise<Comment> {
    const response = this.unwrap(
      await this.repository.updateComment(postId, commentId, {
        content: validateCommentContent(content),
      }),
      'Failed to update comment.',
    )

    return this.mapComment(response.data)
  }

  async removeComment(postId: number, commentId: number): Promise<RemoveCommentResult> {
    const response = this.unwrap(
      await this.repository.removeComment(postId, commentId),
      'Failed to remove comment.',
    )

    return {
      id: response.data.id,
      isRemoved: response.data.is_removed,
      retainTombstone: response.data.retain_tombstone,
    }
  }

  async updateSettings(postId: number, commentsOpen: boolean): Promise<CommentSettings> {
    const response = this.unwrap(
      await this.repository.updateSettings(postId, commentsOpen),
      'Failed to update comment settings.',
    )

    return {
      commentsOpen: response.data.comments_open,
    }
  }

  private unwrap(
    result: RepositoryResult<ApiListCommentsResponse>,
    fallback: string,
  ): ApiListCommentsResponse
  private unwrap(result: RepositoryResult<ApiCommentResponse>, fallback: string): ApiCommentResponse
  private unwrap(
    result: RepositoryResult<ApiRemoveCommentResponse>,
    fallback: string,
  ): ApiRemoveCommentResponse
  private unwrap(
    result: RepositoryResult<ApiCommentSettingsResponse>,
    fallback: string,
  ): ApiCommentSettingsResponse
  private unwrap<T>(result: RepositoryResult<T>, fallback: string): T {
    if (result.success && result.data !== undefined) return result.data
    throw new ApiError(result.error || fallback, result.statusCode ?? 500)
  }

  private mapComment(comment: ApiComment): Comment {
    return {
      id: comment.id,
      parentId: comment.parent_id,
      depth: this.mapDepth(comment.depth),
      content: comment.content,
      author: comment.author
        ? {
            name: comment.author.name,
            avatarUrl: comment.author.avatar_url,
          }
        : null,
      createdAt: comment.created_at,
      editedAt: comment.edited_at,
      isRemoved: comment.is_removed,
      replyCount: comment.reply_count,
      canEdit: comment.can_edit,
      canRemove: comment.can_remove,
      canReply: comment.can_reply,
    }
  }

  private mapDepth(depth: number): CommentDepth {
    if (depth === 0 || depth === 1 || depth === 2) return depth
    throw new ApiError('The comments API returned an invalid reply depth.', 500)
  }
}

export const validateCommentContent = (content: string): string => {
  const normalized = content.trim()

  if (!normalized) {
    throw new ApiError('Comment content cannot be empty.', 400)
  }

  if (normalized.length > MAX_COMMENT_CONTENT_LENGTH) {
    throw new ApiError(
      `Comment content cannot exceed ${MAX_COMMENT_CONTENT_LENGTH} characters.`,
      400,
    )
  }

  return normalized
}
