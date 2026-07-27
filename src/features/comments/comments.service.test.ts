import { describe, expect, it } from 'vitest'
import { RepositoryResult } from '../../core/types/blog-repository.types'
import { CommentsRepositoryPort } from './comments.repository'
import { CommentsService, validateCommentContent } from './comments.service'
import {
  ApiComment,
  ApiCommentResponse,
  ApiCommentSettingsResponse,
  ApiListCommentsResponse,
  ApiRemoveCommentResponse,
  CreateCommentRequest,
  ListCommentsQuery,
  UpdateCommentRequest,
} from './comments.types'

const apiComment: ApiComment = {
  id: 42,
  parent_id: null,
  depth: 0,
  content: 'A useful question',
  author: {
    name: 'Reader Name',
    avatar_url: 'https://media.example/avatar',
  },
  created_at: '2026-07-27T10:00:00Z',
  edited_at: null,
  is_removed: false,
  reply_count: 2,
  can_edit: true,
  can_remove: true,
  can_reply: true,
}

class FakeCommentsRepository implements CommentsRepositoryPort {
  listResult: RepositoryResult<ApiListCommentsResponse> = {
    success: true,
    data: {
      data: [apiComment],
      pagination: {
        limit: 20,
        next_cursor: 'next-page',
        has_more: true,
      },
      discussion: {
        comments_open: true,
        comment_count: 23,
        can_create: true,
        can_manage_comments: false,
      },
    },
  }
  commentResult: RepositoryResult<ApiCommentResponse> = {
    success: true,
    data: { data: apiComment },
  }
  removeResult: RepositoryResult<ApiRemoveCommentResponse> = {
    success: true,
    data: {
      data: {
        id: 42,
        is_removed: true,
        retain_tombstone: true,
      },
    },
  }
  settingsResult: RepositoryResult<ApiCommentSettingsResponse> = {
    success: true,
    data: { data: { comments_open: false } },
  }
  createRequests: CreateCommentRequest[] = []
  updateRequests: UpdateCommentRequest[] = []

  async listComments(
    _postId: number,
    _query?: ListCommentsQuery,
  ): Promise<RepositoryResult<ApiListCommentsResponse>> {
    return this.listResult
  }

  async createComment(
    _postId: number,
    request: CreateCommentRequest,
  ): Promise<RepositoryResult<ApiCommentResponse>> {
    this.createRequests.push(request)
    return this.commentResult
  }

  async updateComment(
    _postId: number,
    _commentId: number,
    request: UpdateCommentRequest,
  ): Promise<RepositoryResult<ApiCommentResponse>> {
    this.updateRequests.push(request)
    return this.commentResult
  }

  async removeComment(): Promise<RepositoryResult<ApiRemoveCommentResponse>> {
    return this.removeResult
  }

  async updateSettings(): Promise<RepositoryResult<ApiCommentSettingsResponse>> {
    return this.settingsResult
  }
}

describe('comments service', () => {
  it('maps transport fields without exposing transport naming', async () => {
    const service = new CommentsService(new FakeCommentsRepository())

    await expect(service.listComments(76)).resolves.toEqual({
      comments: [
        {
          id: 42,
          parentId: null,
          depth: 0,
          content: 'A useful question',
          author: {
            name: 'Reader Name',
            avatarUrl: 'https://media.example/avatar',
          },
          createdAt: '2026-07-27T10:00:00Z',
          editedAt: null,
          isRemoved: false,
          replyCount: 2,
          canEdit: true,
          canRemove: true,
          canReply: true,
        },
      ],
      pagination: {
        limit: 20,
        nextCursor: 'next-page',
        hasMore: true,
      },
      discussion: {
        commentsOpen: true,
        commentCount: 23,
        canCreate: true,
        canManageComments: false,
      },
    })
  })

  it('normalizes content while preserving intentional line breaks', async () => {
    const repository = new FakeCommentsRepository()
    const service = new CommentsService(repository)

    await service.createComment(76, {
      content: '  First line\n\nSecond line  ',
      parentId: null,
      submissionId: '5bc576ba-01f2-42b9-b72b-3a2e7f3d6092',
    })
    await service.updateComment(76, 42, '  Corrected  ')

    expect(repository.createRequests[0]).toEqual({
      content: 'First line\n\nSecond line',
      parentId: null,
      submissionId: '5bc576ba-01f2-42b9-b72b-3a2e7f3d6092',
    })
    expect(repository.updateRequests[0]).toEqual({ content: 'Corrected' })
  })

  it('rejects empty and over-limit content before transport', () => {
    expect(() => validateCommentContent(' \n ')).toThrow('Comment content cannot be empty.')
    expect(() => validateCommentContent('x'.repeat(2001))).toThrow(
      'Comment content cannot exceed 2000 characters.',
    )
  })

  it('maps removal and settings responses', async () => {
    const service = new CommentsService(new FakeCommentsRepository())

    await expect(service.removeComment(76, 42)).resolves.toEqual({
      id: 42,
      isRemoved: true,
      retainTombstone: true,
    })
    await expect(service.updateSettings(76, false)).resolves.toEqual({
      commentsOpen: false,
    })
  })

  it('throws status-aware errors from repository failures', async () => {
    const repository = new FakeCommentsRepository()
    repository.listResult = {
      success: false,
      error: 'Blog not found.',
      statusCode: 404,
    }
    const service = new CommentsService(repository)

    await expect(service.listComments(76)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Blog not found.',
      status: 404,
    })
  })

  it('rejects an invalid server-derived depth', async () => {
    const repository = new FakeCommentsRepository()
    repository.listResult = {
      ...repository.listResult,
      data: {
        ...repository.listResult.data!,
        data: [{ ...apiComment, depth: 3 }],
      },
    }
    const service = new CommentsService(repository)

    await expect(service.listComments(76)).rejects.toMatchObject({
      status: 500,
      message: 'The comments API returned an invalid reply depth.',
    })
  })
})
