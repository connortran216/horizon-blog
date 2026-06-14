import { describe, expect, it, vi } from 'vitest'

import { IBlogRepository } from '../types/blog-repository.types'
import { BlogPostSummary, PublicPostRecord } from '../types/blog.types'
import { BlogService } from './blog.service'

const summary: BlogPostSummary = {
  id: '42',
  title: 'Backend summary',
  excerpt: 'Compact excerpt',
  author: { id: 7, username: 'Author' },
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-02T00:00:00Z',
  readingTime: 6,
  tags: ['performance'],
  featuredImage: undefined,
  status: 'published',
  slug: '42',
}

const fullSearchPost: PublicPostRecord = {
  id: 43,
  user_id: 8,
  title: 'Search result',
  content_markdown: '# Search result\n\nFull markdown remains on the search contract.',
  content_json: '{}',
  status: 'published',
  owner: { id: 8, name: 'Search Author' },
  tags: [],
  created_at: '2026-06-03T00:00:00Z',
  updated_at: '2026-06-03T00:00:00Z',
}

describe('blog service performance routing', () => {
  it('uses compact summaries for the unfiltered archive', async () => {
    const getPublishedPostSummaries = vi.fn().mockResolvedValue({
      success: true,
      data: { posts: [summary], page: 1, limit: 9, total: 1 },
    })
    const searchPostRecords = vi.fn()
    const service = new BlogService({
      getPublishedPostSummaries,
      searchPostRecords,
    } as unknown as IBlogRepository)

    await expect(service.getPublishedArchivePosts({ page: 1, limit: 9 })).resolves.toEqual({
      posts: [summary],
      page: 1,
      limit: 9,
      total: 1,
    })
    expect(getPublishedPostSummaries).toHaveBeenCalledWith({ page: 1, limit: 9 })
    expect(searchPostRecords).not.toHaveBeenCalled()
  })

  it('keeps filtered search on its established contract and maps it for cards', async () => {
    const getPublishedPostSummaries = vi.fn()
    const searchPostRecords = vi.fn().mockResolvedValue({
      success: true,
      data: { posts: [fullSearchPost], page: 1, limit: 9, total: 1 },
    })
    const service = new BlogService({
      getPublishedPostSummaries,
      searchPostRecords,
    } as unknown as IBlogRepository)

    const result = await service.getPublishedArchivePosts({
      q: 'search',
      page: 1,
      limit: 9,
    })

    expect(searchPostRecords).toHaveBeenCalled()
    expect(getPublishedPostSummaries).not.toHaveBeenCalled()
    expect(result.posts[0]).toMatchObject({
      id: '43',
      title: 'Search result',
      author: { id: 8, username: 'Search Author' },
      status: 'published',
    })
  })
})
