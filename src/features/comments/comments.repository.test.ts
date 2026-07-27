import { describe, expect, it } from 'vitest'
import { ApiError } from '../../core/services/api.service'
import {
  ApiCommentsRepository,
  CommentsHttpClient,
  CommentsRepositoryPort,
} from './comments.repository'

type HttpCall = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
  endpoint: string
  data?: unknown
}

class FakeHttpClient implements CommentsHttpClient {
  calls: HttpCall[] = []
  error: Error | null = null

  private respond<T>(call: HttpCall): Promise<T> {
    this.calls.push(call)
    if (this.error) return Promise.reject(this.error)
    return Promise.resolve({ data: [] } as T)
  }

  get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    return this.respond({ method: 'GET', endpoint, data: params })
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.respond({ method: 'POST', endpoint, data })
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.respond({ method: 'PATCH', endpoint, data })
  }

  delete<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.respond({ method: 'DELETE', endpoint, data })
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.respond({ method: 'PUT', endpoint, data })
  }
}

describe('comments repository', () => {
  it('lists a direct sibling page with exact cursor parameters', async () => {
    const http = new FakeHttpClient()
    const repository: CommentsRepositoryPort = new ApiCommentsRepository(http)

    await repository.listComments(76, {
      parentId: 42,
      cursor: 'opaque-cursor',
      limit: 20,
    })

    expect(http.calls).toEqual([
      {
        method: 'GET',
        endpoint: '/posts/76/comments',
        data: {
          parent_id: 42,
          cursor: 'opaque-cursor',
          limit: 20,
        },
      },
    ])
  })

  it('sends the exact create, edit, remove, and settings contracts', async () => {
    const http = new FakeHttpClient()
    const repository = new ApiCommentsRepository(http)

    await repository.createComment(76, {
      content: 'Question',
      parentId: null,
      submissionId: '5bc576ba-01f2-42b9-b72b-3a2e7f3d6092',
    })
    await repository.updateComment(76, 42, { content: 'Corrected question' })
    await repository.removeComment(76, 42)
    await repository.updateSettings(76, false)

    expect(http.calls).toEqual([
      {
        method: 'POST',
        endpoint: '/posts/76/comments',
        data: {
          content: 'Question',
          parent_id: null,
          submission_id: '5bc576ba-01f2-42b9-b72b-3a2e7f3d6092',
        },
      },
      {
        method: 'PATCH',
        endpoint: '/posts/76/comments/42',
        data: { content: 'Corrected question' },
      },
      {
        method: 'DELETE',
        endpoint: '/posts/76/comments/42',
        data: undefined,
      },
      {
        method: 'PUT',
        endpoint: '/posts/76/comments/settings',
        data: { comments_open: false },
      },
    ])
  })

  it('preserves status-aware transport errors', async () => {
    const http = new FakeHttpClient()
    http.error = new ApiError('Comments are closed.', 409)
    const repository = new ApiCommentsRepository(http)

    await expect(
      repository.createComment(76, {
        content: 'Question',
        parentId: null,
        submissionId: '5bc576ba-01f2-42b9-b72b-3a2e7f3d6092',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Comments are closed.',
      statusCode: 409,
    })
  })
})
