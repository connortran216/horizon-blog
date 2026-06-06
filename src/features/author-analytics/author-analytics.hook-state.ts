import { ApiError } from '../../core/services/api.service'
import { AnalyticsOverview, BlogMetricsPage } from './author-analytics.types'

export type AnalyticsLoadErrorKind =
  | 'bad_request'
  | 'not_found'
  | 'service_unavailable'
  | 'unauthorized'
  | 'unknown'

export interface AnalyticsLoadErrorState {
  kind: AnalyticsLoadErrorKind
  message: string
  statusCode?: number
}

export const getAnalyticsLoadErrorState = (error: unknown): AnalyticsLoadErrorState => {
  if (error instanceof ApiError) {
    return {
      kind: getErrorKind(error.status),
      message: error.message,
      statusCode: error.status,
    }
  }

  return {
    kind: 'unknown',
    message: error instanceof Error ? error.message : 'Failed to load analytics.',
  }
}

export const isAnalyticsOverviewEmpty = (overview: AnalyticsOverview | null): boolean => {
  if (!overview) return false

  return (
    overview.summary.views === 0 &&
    overview.summary.estimatedUniqueReaders === 0 &&
    overview.summary.heartsReceived === 0 &&
    overview.summary.shares === 0 &&
    overview.summary.linkClicks === 0 &&
    overview.trend.length === 0 &&
    overview.topBlogs.length === 0
  )
}

export const isBlogMetricsEmpty = (metrics: BlogMetricsPage | null): boolean =>
  metrics !== null && metrics.total === 0 && metrics.posts.length === 0

const getErrorKind = (status: number): AnalyticsLoadErrorKind => {
  if (status === 400) return 'bad_request'
  if (status === 401) return 'unauthorized'
  if (status === 404) return 'not_found'
  if (status >= 500) return 'service_unavailable'
  return 'unknown'
}
