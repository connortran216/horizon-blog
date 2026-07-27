import { ApiError, apiService } from '../../core/services/api.service'
import { RepositoryResult } from '../../core/types/blog-repository.types'
import {
  ApiCommentResponse,
  ApiCommentSettingsResponse,
  ApiListCommentsResponse,
  ApiRemoveCommentResponse,
  CreateCommentRequest,
  ListCommentsQuery,
  UpdateCommentRequest,
} from './comments.types'

export interface CommentsHttpClient {
  get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T>
  post<T>(endpoint: string, data?: unknown): Promise<T>
  patch<T>(endpoint: string, data?: unknown): Promise<T>
  delete<T>(endpoint: string, data?: unknown): Promise<T>
  put<T>(endpoint: string, data?: unknown): Promise<T>
}

export interface CommentsRepositoryPort {
  listComments(
    postId: number,
    query?: ListCommentsQuery,
  ): Promise<RepositoryResult<ApiListCommentsResponse>>
  createComment(
    postId: number,
    request: CreateCommentRequest,
  ): Promise<RepositoryResult<ApiCommentResponse>>
  updateComment(
    postId: number,
    commentId: number,
    request: UpdateCommentRequest,
  ): Promise<RepositoryResult<ApiCommentResponse>>
  removeComment(
    postId: number,
    commentId: number,
  ): Promise<RepositoryResult<ApiRemoveCommentResponse>>
  updateSettings(
    postId: number,
    commentsOpen: boolean,
  ): Promise<RepositoryResult<ApiCommentSettingsResponse>>
}

export class ApiCommentsRepository implements CommentsRepositoryPort {
  constructor(private readonly http: CommentsHttpClient = apiService) {}

  listComments(
    postId: number,
    query: ListCommentsQuery = {},
  ): Promise<RepositoryResult<ApiListCommentsResponse>> {
    const params: Record<string, unknown> = {}

    if (query.parentId !== undefined) params.parent_id = query.parentId
    if (query.cursor !== undefined) params.cursor = query.cursor
    if (query.limit !== undefined) params.limit = query.limit

    return this.getResult(
      () => this.http.get<ApiListCommentsResponse>(`/posts/${postId}/comments`, params),
      'Failed to load comments.',
    )
  }

  createComment(
    postId: number,
    request: CreateCommentRequest,
  ): Promise<RepositoryResult<ApiCommentResponse>> {
    return this.getResult(
      () =>
        this.http.post<ApiCommentResponse>(`/posts/${postId}/comments`, {
          content: request.content,
          parent_id: request.parentId,
          submission_id: request.submissionId,
        }),
      'Failed to create comment.',
    )
  }

  updateComment(
    postId: number,
    commentId: number,
    request: UpdateCommentRequest,
  ): Promise<RepositoryResult<ApiCommentResponse>> {
    return this.getResult(
      () =>
        this.http.patch<ApiCommentResponse>(`/posts/${postId}/comments/${commentId}`, {
          content: request.content,
        }),
      'Failed to update comment.',
    )
  }

  removeComment(
    postId: number,
    commentId: number,
  ): Promise<RepositoryResult<ApiRemoveCommentResponse>> {
    return this.getResult(
      () => this.http.delete<ApiRemoveCommentResponse>(`/posts/${postId}/comments/${commentId}`),
      'Failed to remove comment.',
    )
  }

  updateSettings(
    postId: number,
    commentsOpen: boolean,
  ): Promise<RepositoryResult<ApiCommentSettingsResponse>> {
    return this.getResult(
      () =>
        this.http.put<ApiCommentSettingsResponse>(`/posts/${postId}/comments/settings`, {
          comments_open: commentsOpen,
        }),
      'Failed to update comment settings.',
    )
  }

  private async getResult<T>(
    request: () => Promise<T>,
    fallbackMessage: string,
  ): Promise<RepositoryResult<T>> {
    try {
      return {
        success: true,
        data: await request(),
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
          statusCode: error.status,
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : fallbackMessage,
      }
    }
  }
}
