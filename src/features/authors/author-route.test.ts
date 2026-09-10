import { describe, expect, it, vi } from 'vitest'
import { resolveAuthorIdFromSlug } from './author-route'

describe('resolveAuthorIdFromSlug', () => {
  it('resolves a direct author slug from published blog summaries', async () => {
    const loadPage = vi.fn().mockResolvedValue({
      posts: [{ author: { id: 1, username: 'Connor Trần' } }],
      page: 1,
      limit: 50,
      total: 1,
    })

    await expect(resolveAuthorIdFromSlug('connor-tran', loadPage)).resolves.toBe('1')
    expect(loadPage).toHaveBeenCalledWith({ page: 1, limit: 50 })
  })

  it('continues through summary pages and returns empty for an unknown author', async () => {
    const loadPage = vi
      .fn()
      .mockResolvedValueOnce({
        posts: [{ author: { id: 2, username: 'Ada Lovelace' } }],
        page: 1,
        limit: 1,
        total: 2,
      })
      .mockResolvedValueOnce({
        posts: [{ author: { id: 3, username: 'Grace Hopper' } }],
        page: 2,
        limit: 1,
        total: 2,
      })

    await expect(resolveAuthorIdFromSlug('unknown-author', loadPage, 1)).resolves.toBe('')
    expect(loadPage).toHaveBeenCalledTimes(2)
  })
})
