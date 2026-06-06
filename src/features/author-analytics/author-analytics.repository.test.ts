import { describe, expect, it } from 'vitest'

import {
  ApiAuthorAnalyticsRepository,
  AuthorAnalyticsHttpClient,
} from './author-analytics.repository'
import {
  analyticsOverviewApiFixture,
  analyticsPostDetailApiFixture,
  analyticsPostsApiFixture,
} from './author-analytics.fixtures'

class FakeHttpClient implements AuthorAnalyticsHttpClient {
  calls: Array<{ endpoint: string; params?: Record<string, unknown> }> = []

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    this.calls.push({ endpoint, params })

    if (endpoint === '/users/me/analytics/overview') {
      return analyticsOverviewApiFixture as T
    }

    if (endpoint === '/users/me/analytics/posts') {
      return analyticsPostsApiFixture as T
    }

    if (endpoint === '/users/me/analytics/posts/42') {
      return analyticsPostDetailApiFixture as T
    }

    throw new Error(`Unexpected endpoint: ${endpoint}`)
  }
}

const range = { from: '2026-05-06', to: '2026-06-04', timezone: 'UTC' as const }

describe('author analytics repository', () => {
  it('uses the approved overview endpoint with inclusive UTC query params', async () => {
    const http = new FakeHttpClient()
    const repository = new ApiAuthorAnalyticsRepository(http)

    await expect(repository.getOverview(range)).resolves.toMatchObject({
      success: true,
      data: analyticsOverviewApiFixture,
    })

    expect(http.calls).toEqual([
      {
        endpoint: '/users/me/analytics/overview',
        params: { from: '2026-05-06', to: '2026-06-04' },
      },
    ])
  })

  it('uses the approved posts endpoint with sort and pagination params', async () => {
    const http = new FakeHttpClient()
    const repository = new ApiAuthorAnalyticsRepository(http)

    await repository.getPostMetrics({
      range,
      sort: 'unique_readers',
      order: 'asc',
      page: 2,
      limit: 20,
    })

    expect(http.calls).toEqual([
      {
        endpoint: '/users/me/analytics/posts',
        params: {
          from: '2026-05-06',
          to: '2026-06-04',
          sort: 'unique_readers',
          order: 'asc',
          page: 2,
          limit: 20,
        },
      },
    ])
  })

  it('uses the approved post detail endpoint without inventing body fields', async () => {
    const http = new FakeHttpClient()
    const repository = new ApiAuthorAnalyticsRepository(http)

    await repository.getPostDetail(42, range)

    expect(http.calls).toEqual([
      {
        endpoint: '/users/me/analytics/posts/42',
        params: { from: '2026-05-06', to: '2026-06-04' },
      },
    ])
  })
})
