import { describe, expect, it } from 'vitest'

import { RepositoryResult } from '../../core/types/blog-repository.types'
import {
  AuthorAnalyticsApiOverviewResponse,
  AuthorAnalyticsApiPostDetailResponse,
  AuthorAnalyticsApiPostsResponse,
  AuthorAnalyticsRepositoryPort,
  GetPostMetricsParams,
} from './author-analytics.repository'
import { AuthorAnalyticsService } from './author-analytics.service'
import {
  analyticsOverviewApiFixture,
  analyticsPostDetailApiFixture,
  analyticsPostsApiFixture,
} from './author-analytics.fixtures'
import { AnalyticsDateRange } from './author-analytics.types'

class FakeAuthorAnalyticsRepository implements AuthorAnalyticsRepositoryPort {
  overviewResult: RepositoryResult<AuthorAnalyticsApiOverviewResponse> = {
    success: true,
    data: analyticsOverviewApiFixture,
  }
  postsResult: RepositoryResult<AuthorAnalyticsApiPostsResponse> = {
    success: true,
    data: analyticsPostsApiFixture,
  }
  detailResult: RepositoryResult<AuthorAnalyticsApiPostDetailResponse> = {
    success: true,
    data: analyticsPostDetailApiFixture,
  }
  postMetricParams: GetPostMetricsParams[] = []

  async getOverview(): Promise<RepositoryResult<AuthorAnalyticsApiOverviewResponse>> {
    return this.overviewResult
  }

  async getPostMetrics(
    params: GetPostMetricsParams,
  ): Promise<RepositoryResult<AuthorAnalyticsApiPostsResponse>> {
    this.postMetricParams.push(params)
    return this.postsResult
  }

  async getPostDetail(): Promise<RepositoryResult<AuthorAnalyticsApiPostDetailResponse>> {
    return this.detailResult
  }
}

const range: AnalyticsDateRange = {
  from: '2026-05-06',
  to: '2026-06-04',
  timezone: 'UTC',
}

describe('author analytics service', () => {
  it('maps overview DTOs to display models and preserves approximate reader semantics', async () => {
    const service = new AuthorAnalyticsService(new FakeAuthorAnalyticsRepository())

    await expect(service.getOverview(range)).resolves.toMatchObject({
      range,
      dataFreshThrough: '2026-06-04T09:20:00Z',
      uniqueReadersApproximate: true,
      summary: {
        views: 1200,
        estimatedUniqueReaders: 830,
        uniqueReadersApproximate: true,
        heartsReceived: 94,
        activeHeartCount: 128,
        shares: 32,
        linkClicks: 180,
        completionRate: 0.42,
        avgActiveReadSeconds: 286,
      },
      trend: [
        {
          date: '2026-06-04',
          views: 48,
          estimatedUniqueReaders: 39,
          heartsReceived: 4,
          shares: 2,
          completed: 18,
        },
      ],
      topBlogs: [
        {
          postId: 42,
          title: 'Example blog',
          estimatedUniqueReaders: 350,
          uniqueReadersApproximate: true,
          activeHeartCount: 28,
        },
      ],
    })
  })

  it('maps paginated post metrics and keeps backend ratios numeric', async () => {
    const repository = new FakeAuthorAnalyticsRepository()
    const service = new AuthorAnalyticsService(repository)

    const page = await service.getPostMetrics({
      range,
      sort: 'completion_rate',
      order: 'desc',
      page: 1,
      limit: 10,
    })

    expect(page).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      range,
      dataFreshThrough: '2026-06-04T09:20:00Z',
      posts: [
        {
          postId: 42,
          completionRate: 0.56,
          avgActiveReadSeconds: 310,
          activeHeartCount: 28,
        },
      ],
    })
    expect(typeof page.posts[0].completionRate).toBe('number')
    expect(typeof page.posts[0].avgActiveReadSeconds).toBe('number')
  })

  it('maps blog detail data for later page composition', async () => {
    const service = new AuthorAnalyticsService(new FakeAuthorAnalyticsRepository())

    const detail = await service.getPostDetail(42, range)

    expect(detail).toMatchObject({
      post: {
        id: 42,
        title: 'Example blog',
        publishedAt: '2026-05-01T08:00:00Z',
      },
      reactionTrend: [{ date: '2026-06-04', heartsAdded: 4, heartsRemoved: 1 }],
      topLinks: [{ linkKey: 'https://example.com/resource', clicks: 38, ctr: 0.0905 }],
      trafficSources: [{ category: 'search', host: 'google.com', views: 120 }],
    })
    expect(detail.progressFunnel[0]).toEqual({ stage: 'opened', sessions: 420, rate: 1 })
  })

  it('throws status-aware API errors from repository failures', async () => {
    const repository = new FakeAuthorAnalyticsRepository()
    repository.overviewResult = {
      success: false,
      error: 'Unauthorized',
      statusCode: 401,
    }
    const service = new AuthorAnalyticsService(repository)

    await expect(service.getOverview(range)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Unauthorized',
      status: 401,
    })
  })
})
