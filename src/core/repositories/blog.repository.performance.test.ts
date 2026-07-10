import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiService } from '../services/api.service'
import { ApiListPostSummariesResponse, ApiRelatedPostsResponse } from '../types/blog-service.types'
import { ApiBlogRepository } from './blog.repository'

const summaryResponse: ApiListPostSummariesResponse = {
  data: [
    {
      id: 42,
      user_id: 7,
      title: 'Compact post',
      excerpt: 'Already derived by the backend.',
      reading_time: 6,
      cover_image: 'https://cdn.example.com/cover.jpg',
      owner: {
        id: 7,
        name: 'Author',
        avatar_url: 'https://cdn.example.com/avatar.jpg',
      },
      tags: [{ id: 3, name: 'performance' }],
      status: 'published',
      created_at: '2026-06-01T00:00:00Z',
      updated_at: '2026-06-02T00:00:00Z',
      published_at: '2026-06-02T00:00:00Z',
    },
    {
      id: 43,
      user_id: 8,
      title: 'Fallback post',
      excerpt: 'No optional media.',
      reading_time: 1,
      owner: {
        id: 8,
        name: 'Second Author',
      },
      tags: [],
      status: 'published',
      created_at: '2026-06-03T00:00:00Z',
      updated_at: '2026-06-03T00:00:00Z',
    },
  ],
  page: 2,
  limit: 2,
  total: 8,
}

const relatedResponse: ApiRelatedPostsResponse = {
  data: [
    {
      post: summaryResponse.data[0],
      score: 120,
    },
  ],
  limit: 3,
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('blog repository performance contract', () => {
  it('loads published summaries without requiring markdown', async () => {
    const get = vi.spyOn(apiService, 'get').mockResolvedValue(summaryResponse)
    const repository = new ApiBlogRepository({ cache: { enabled: false } })

    const result = await repository.getPublishedPosts({ limit: 9 })

    expect(get).toHaveBeenCalledWith('/posts/summaries', {
      status: 'published',
      limit: 9,
    })
    expect(result).toMatchObject({
      success: true,
      data: [
        {
          id: '42',
          title: 'Compact post',
          excerpt: 'Already derived by the backend.',
          readingTime: 6,
          featuredImage: 'https://cdn.example.com/cover.jpg',
          author: {
            id: 7,
            username: 'Author',
            avatar: 'https://cdn.example.com/avatar.jpg',
          },
          tags: ['performance'],
          status: 'published',
        },
        {
          id: '43',
          title: 'Fallback post',
          readingTime: 1,
          featuredImage: undefined,
          author: {
            id: 8,
            username: 'Second Author',
            avatar: undefined,
          },
          tags: [],
        },
      ],
    })
  })

  it('returns paginated summaries for the unfiltered archive', async () => {
    const get = vi.spyOn(apiService, 'get').mockResolvedValue(summaryResponse)
    const repository = new ApiBlogRepository({ cache: { enabled: false } })

    const result = await repository.getPublishedPostSummaries({
      page: 2,
      limit: 2,
    })

    expect(get).toHaveBeenCalledWith('/posts/summaries', {
      page: 2,
      limit: 2,
      status: 'published',
    })
    expect(result.metadata).toEqual({
      page: 2,
      limit: 2,
      total: 8,
      hasNext: true,
      hasPrev: true,
    })
    expect(result.data?.posts).toHaveLength(2)
  })

  it('keeps summary and full-record caches separate', async () => {
    const get = vi.spyOn(apiService, 'get').mockImplementation(async (endpoint) => {
      if (endpoint === '/posts/summaries') return summaryResponse
      if (endpoint === '/posts') {
        return { data: [], page: 1, limit: 2, total: 0 }
      }
      throw new Error(`Unexpected endpoint: ${endpoint}`)
    })
    const repository = new ApiBlogRepository()

    await repository.getPublishedPostSummaries({ page: 1, limit: 2 })
    await repository.getPublishedPostRecords({ page: 1, limit: 2 })

    expect(get).toHaveBeenNthCalledWith(1, '/posts/summaries', {
      page: 1,
      limit: 2,
      status: 'published',
    })
    expect(get).toHaveBeenNthCalledWith(2, '/posts', {
      page: 1,
      limit: 2,
      status: 'published',
    })
  })

  it('loads related posts with score metadata from the dedicated endpoint', async () => {
    const get = vi.spyOn(apiService, 'get').mockResolvedValue(relatedResponse)
    const repository = new ApiBlogRepository({ cache: { enabled: false } })

    const result = await repository.getRelatedPosts('42', 3)

    expect(get).toHaveBeenCalledWith('/posts/42/related', { limit: 3 })
    expect(result).toMatchObject({
      success: true,
      data: [
        {
          score: 120,
          post: {
            id: '42',
            title: 'Compact post',
            excerpt: 'Already derived by the backend.',
            tags: ['performance'],
            status: 'published',
          },
        },
      ],
    })
  })
})
