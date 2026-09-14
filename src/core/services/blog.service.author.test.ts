/**
 * `uix.6`: a copied `/authors/<slug>` link has to work from a cold load.
 *
 * These are the two things the archive depends on and could not previously do:
 * turn a slug into an author id with nothing but the URL, and say "not found"
 * rather than "invalid" when there is no such author.
 */

import { describe, expect, it, vi } from 'vitest'
import { IBlogRepository } from '../types/blog-repository.types'
import { ApiError } from './api.service'
import { BlogService } from './blog.service'

const summary = (id: number, username: string) => ({
  id: String(id * 100),
  title: 'A post',
  author: { id, username },
  tags: [],
})

const repositoryWithPages = (pages: { posts: unknown[]; total: number }[], pageSize = 50) => {
  const getPublishedPostSummaries = vi.fn(async ({ page }: { page: number; limit: number }) => ({
    success: true,
    data: {
      posts: pages[page - 1]?.posts ?? [],
      page,
      limit: pageSize,
      total: pages[0]?.total ?? 0,
    },
  }))

  return {
    repository: { getPublishedPostSummaries } as unknown as IBlogRepository,
    getPublishedPostSummaries,
  }
}

describe('resolveAuthorIdBySlug', () => {
  it('resolves an author from the slug in the URL alone', async () => {
    const { repository } = repositoryWithPages([
      { posts: [summary(1, 'Connor Tran'), summary(2, 'Someone Else')], total: 2 },
    ])

    await expect(new BlogService(repository).resolveAuthorIdBySlug('connor-tran')).resolves.toBe(
      '1',
    )
  })

  it('keeps paging until it finds the author', async () => {
    const { repository, getPublishedPostSummaries } = repositoryWithPages(
      [
        { posts: [summary(2, 'Someone Else')], total: 2 },
        { posts: [summary(1, 'Connor Tran')], total: 2 },
      ],
      1,
    )

    await expect(
      new BlogService(repository).resolveAuthorIdBySlug('connor-tran', { pageSize: 1 }),
    ).resolves.toBe('1')
    expect(getPublishedPostSummaries).toHaveBeenCalledTimes(2)
  })

  it('stops at the end of the list rather than paging forever', async () => {
    const { repository, getPublishedPostSummaries } = repositoryWithPages([
      { posts: [summary(2, 'Someone Else')], total: 1 },
    ])

    await expect(
      new BlogService(repository).resolveAuthorIdBySlug('connor-tran'),
    ).rejects.toBeInstanceOf(ApiError)
    expect(getPublishedPostSummaries).toHaveBeenCalledTimes(1)
  })

  it('reports a slug nobody published under as not found, not as invalid', async () => {
    const { repository } = repositoryWithPages([{ posts: [], total: 0 }])

    await expect(new BlogService(repository).resolveAuthorIdBySlug('nobody')).rejects.toMatchObject(
      { status: 404 },
    )
  })

  it('asks for nothing at all when there is no slug', async () => {
    const { repository, getPublishedPostSummaries } = repositoryWithPages([])

    await expect(new BlogService(repository).resolveAuthorIdBySlug('')).rejects.toMatchObject({
      status: 404,
    })
    expect(getPublishedPostSummaries).not.toHaveBeenCalled()
  })
})
