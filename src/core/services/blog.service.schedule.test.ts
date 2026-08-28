import { describe, expect, it, vi } from 'vitest'
import { IBlogRepository } from '../types/blog-repository.types'
import { BlogService } from './blog.service'

describe('owner publication service projection', () => {
  it('preserves the scheduled view and pagination metadata', async () => {
    const getCurrentUserPublicationPosts = vi.fn().mockResolvedValue({
      success: true,
      data: [],
      metadata: { page: 2, limit: 9, total: 12 },
    })
    const service = new BlogService({
      getCurrentUserPublicationPosts,
    } as unknown as IBlogRepository)

    await expect(service.getCurrentUserPublicationPage('scheduled', 2, 9)).resolves.toEqual({
      posts: [],
      page: 2,
      limit: 9,
      total: 12,
    })
    expect(getCurrentUserPublicationPosts).toHaveBeenCalledWith('scheduled', 2, 9)
  })
})
