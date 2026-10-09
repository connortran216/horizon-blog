import { describe, expect, it, vi } from 'vitest'
import { AuthorAnalyticsService } from './author-analytics.service'
import { ApiAuthorAnalyticsRepository } from './author-analytics.repository'
import { analyticsPostsApiFixture } from './author-analytics.fixtures'
import {
  completionPercent,
  filterReportBlogs,
  readingObservation,
  parseReportControls,
} from './author-analytics.report'

const range = analyticsPostsApiFixture.range

describe('monitoring report data', () => {
  it('loads every API page before exposing searchable results', async () => {
    const repository = new ApiAuthorAnalyticsRepository()
    vi.spyOn(repository, 'getPostMetrics').mockImplementation(async ({ page }) => ({
      success: true,
      data: {
        ...analyticsPostsApiFixture,
        page: page ?? 1,
        limit: 1,
        total: 2,
        data: [
          {
            ...analyticsPostsApiFixture.data[0],
            post_id: page ?? 1,
            title: page === 2 ? 'CORS là gì' : 'HAProxy',
          },
        ],
      },
    }))
    const result = await new AuthorAnalyticsService(repository).getAllPostMetrics(range)
    expect(result.posts.map((blog) => blog.postId)).toEqual([1, 2])
    expect(filterReportBlogs(result.posts, 'cors la')).toHaveLength(1)
  })
  it('rejects an incomplete page instead of silently reporting a partial total', async () => {
    const repository = new ApiAuthorAnalyticsRepository()
    vi.spyOn(repository, 'getPostMetrics').mockResolvedValue({
      success: true,
      data: { ...analyticsPostsApiFixture, data: [], total: 2 },
    })
    await expect(new AuthorAnalyticsService(repository).getAllPostMetrics(range)).rejects.toThrow()
  })
  it('uses a fixed completion ceiling with no minimum decorative fill', () => {
    expect(completionPercent(0)).toBe(0)
    expect(completionPercent(0.058)).toBeCloseTo(5.8)
    expect(completionPercent(1.2)).toBe(100)
    expect(completionPercent(Number.NaN)).toBe(0)
  })
  it('requires a real opened and 25% stage for the early drop observation', () => {
    expect(
      readingObservation([
        { stage: 'opened', sessions: 52, rate: 1 },
        { stage: '25', sessions: 7, rate: 7 / 52 },
      ]),
    ).toEqual({ opened: 52, reached: 7, notReached: 45 })
    expect(
      readingObservation([
        { stage: 'opened', sessions: 52, rate: 1 },
        { stage: '50', sessions: 5, rate: 5 / 52 },
      ]),
    ).toBeNull()
    expect(
      readingObservation([
        { stage: 'opened', sessions: 0, rate: 0 },
        { stage: '25', sessions: 0, rate: 0 },
      ]),
    ).toBeNull()
  })
})

describe('report request boundaries', () => {
  it('stops collecting after cancellation without requesting another page', async () => {
    const controller = new AbortController()
    const repository = new ApiAuthorAnalyticsRepository()
    const request = vi.spyOn(repository, 'getPostMetrics').mockImplementation(async () => {
      controller.abort()
      return {
        success: true,
        data: {
          ...analyticsPostsApiFixture,
          page: 1,
          limit: 1,
          total: 2,
          data: [analyticsPostsApiFixture.data[0]],
        },
      }
    })
    await expect(
      new AuthorAnalyticsService(repository).getAllPostMetrics(range, controller.signal),
    ).rejects.toThrow()
    expect(request).toHaveBeenCalledTimes(1)
  })
  it('rejects duplicate rows across pages instead of returning a partial report', async () => {
    const repository = new ApiAuthorAnalyticsRepository()
    vi.spyOn(repository, 'getPostMetrics').mockImplementation(async ({ page }) => ({
      success: true,
      data: {
        ...analyticsPostsApiFixture,
        page: page ?? 1,
        limit: 1,
        total: 2,
        data: [analyticsPostsApiFixture.data[0]],
      },
    }))
    await expect(new AuthorAnalyticsService(repository).getAllPostMetrics(range)).rejects.toThrow(
      'Incomplete blog analytics',
    )
  })
  it('propagates a later-page failure', async () => {
    const repository = new ApiAuthorAnalyticsRepository()
    vi.spyOn(repository, 'getPostMetrics')
      .mockResolvedValueOnce({
        success: true,
        data: {
          ...analyticsPostsApiFixture,
          page: 1,
          limit: 1,
          total: 2,
          data: [analyticsPostsApiFixture.data[0]],
        },
      })
      .mockResolvedValueOnce({ success: false, error: 'Second page unavailable', statusCode: 503 })
    await expect(new AuthorAnalyticsService(repository).getAllPostMetrics(range)).rejects.toThrow(
      'Second page unavailable',
    )
  })
  it('normalizes unsupported URL controls without accepting inherited sort keys', () => {
    expect(
      parseReportControls(new URLSearchParams('page=-1&sort=toString&order=bad&q=CORS')),
    ).toEqual({ page: 1, sort: 'views', order: 'desc', query: 'CORS' })
    expect(
      parseReportControls(new URLSearchParams('page=2&sort=completion_rate&order=asc')).page,
    ).toBe(2)
  })
})
