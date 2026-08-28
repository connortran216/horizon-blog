import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiService } from '../services/api.service'
import { ApiListPostsResponse } from '../types/blog-service.types'
import { ApiBlogRepository } from './blog.repository'

const response: ApiListPostsResponse = {
  data: [
    {
      id: 91,
      user_id: 1,
      title: 'Scheduled article',
      content_markdown: '# Scheduled article',
      content_json: '{}',
      status: 'draft',
      created_at: '2026-08-20T08:00:00Z',
      updated_at: '2026-08-21T09:00:00Z',
      scheduled_publish_at: '2026-08-28T02:00:00Z',
      owner: { id: 1, name: 'Owner' },
      tags: [],
    },
  ],
  page: 1,
  limit: 9,
  total: 1,
}

afterEach(() => vi.restoreAllMocks())

describe('owner publication repository projection', () => {
  it.each([
    ['published', { page: 1, limit: 9, status: 'published' }],
    ['scheduled', { page: 1, limit: 9, schedule: 'scheduled' }],
    ['draft', { page: 1, limit: 9, schedule: 'unscheduled' }],
  ] as const)('maps %s to its mutually exclusive server query', async (view, expectedParams) => {
    const get = vi.spyOn(apiService, 'get').mockResolvedValue(response)
    const repository = new ApiBlogRepository({ cache: { enabled: false } })

    const result = await repository.getCurrentUserPublicationPosts(view, 1, 9)

    expect(get).toHaveBeenCalledWith('/users/me/posts', expectedParams)
    expect(result.data?.[0]).toMatchObject({
      id: '91',
      status: 'draft',
      updatedAt: '2026-08-21T09:00:00Z',
      scheduledPublishAt: '2026-08-28T02:00:00Z',
    })
    expect(result.metadata).toMatchObject({ page: 1, limit: 9, total: 1 })
  })

  it('keeps the legacy draft query inclusive for existing consumers', async () => {
    const get = vi.spyOn(apiService, 'get').mockResolvedValue(response)
    const repository = new ApiBlogRepository({ cache: { enabled: false } })

    await repository.getCurrentUserPosts('draft', 1, 50)

    expect(get).toHaveBeenCalledWith('/users/me/posts', { page: 1, limit: 50, status: 'draft' })
  })
})
