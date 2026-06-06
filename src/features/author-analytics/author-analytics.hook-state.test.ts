import { describe, expect, it } from 'vitest'

import { ApiError } from '../../core/services/api.service'
import {
  getAnalyticsLoadErrorState,
  isAnalyticsOverviewEmpty,
  isBlogMetricsEmpty,
} from './author-analytics.hook-state'
import { AnalyticsOverview, BlogMetricsPage } from './author-analytics.types'

const range = { from: '2026-05-06', to: '2026-06-04', timezone: 'UTC' as const }

describe('author analytics hook state helpers', () => {
  it('classifies auth, not-found, and service errors for hooks', () => {
    expect(getAnalyticsLoadErrorState(new ApiError('Unauthorized', 401))).toEqual({
      kind: 'unauthorized',
      message: 'Unauthorized',
      statusCode: 401,
    })
    expect(getAnalyticsLoadErrorState(new ApiError('Missing blog', 404))).toEqual({
      kind: 'not_found',
      message: 'Missing blog',
      statusCode: 404,
    })
    expect(getAnalyticsLoadErrorState(new ApiError('ClickHouse unavailable', 503))).toEqual({
      kind: 'service_unavailable',
      message: 'ClickHouse unavailable',
      statusCode: 503,
    })
  })

  it('identifies successful empty overview and blog metrics states without losing freshness', () => {
    const overview: AnalyticsOverview = {
      range,
      summary: {
        views: 0,
        estimatedUniqueReaders: 0,
        uniqueReadersApproximate: true,
        heartsReceived: 0,
        shares: 0,
        linkClicks: 0,
        completionRate: 0,
        avgActiveReadSeconds: 0,
      },
      trend: [],
      topBlogs: [],
      insights: [],
      dataFreshThrough: '2026-06-04T09:20:00Z',
      uniqueReadersApproximate: true,
    }
    const posts: BlogMetricsPage = {
      posts: [],
      page: 1,
      limit: 10,
      total: 0,
      range,
      dataFreshThrough: '2026-06-04T09:20:00Z',
    }

    expect(isAnalyticsOverviewEmpty(overview)).toBe(true)
    expect(isBlogMetricsEmpty(posts)).toBe(true)
    expect(overview.dataFreshThrough).toBe('2026-06-04T09:20:00Z')
    expect(posts.range).toBe(range)
  })
})
