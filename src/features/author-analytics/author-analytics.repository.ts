import { apiService, ApiError } from '../../core/services/api.service'
import { RepositoryResult } from '../../core/types/blog-repository.types'
import {
  AnalyticsDateRange,
  AnalyticsInsight,
  AnalyticsPostMetricsQuery,
  AnalyticsPostSort,
  AnalyticsSortOrder,
} from './author-analytics.types'

export interface AuthorAnalyticsApiSummary {
  views: number
  estimated_unique_readers: number
  unique_readers_approximate: boolean
  hearts_received: number
  shares: number
  link_clicks: number
  completion_rate: number
  avg_active_read_seconds: number
  active_heart_count?: number
}

export interface AuthorAnalyticsApiTrendPoint {
  date: string
  views: number
  estimated_unique_readers: number
  hearts_received: number
  shares: number
  completed: number
}

export interface AuthorAnalyticsApiPostMetric {
  post_id: number
  title: string
  views: number
  estimated_unique_readers: number
  unique_readers_approximate: boolean
  hearts_received: number
  shares: number
  link_clicks: number
  completion_rate: number
  avg_active_read_seconds: number
}

export interface AuthorAnalyticsApiOverviewData {
  range: AnalyticsDateRange
  summary: AuthorAnalyticsApiSummary
  trend: AuthorAnalyticsApiTrendPoint[]
  top_blogs: AuthorAnalyticsApiPostMetric[]
  insights: AnalyticsInsight[]
  data_fresh_through: string
  unique_readers_approximate: boolean
}

export interface AuthorAnalyticsApiOverviewResponse {
  data: AuthorAnalyticsApiOverviewData
}

export interface AuthorAnalyticsApiPostsResponse {
  data: AuthorAnalyticsApiPostMetric[]
  page: number
  limit: number
  total: number
  range: AnalyticsDateRange
  data_fresh_through: string
}

export interface AuthorAnalyticsApiPostReference {
  id: number
  title: string
  published_at: string
}

export interface AuthorAnalyticsApiFunnelStage {
  stage: string
  sessions: number
  rate: number
}

export interface AuthorAnalyticsApiReactionTrendPoint {
  date: string
  hearts_added: number
  hearts_removed: number
}

export interface AuthorAnalyticsApiLinkMetric {
  link_key: string
  url: string
  label: string
  kind: string
  clicks: number
  ctr: number
}

export interface AuthorAnalyticsApiTrafficSourceMetric {
  category: string
  host: string
  views: number
  completion_rate: number
  avg_active_read_seconds: number
}

export interface AuthorAnalyticsApiPostDetailData {
  post: AuthorAnalyticsApiPostReference
  range: AnalyticsDateRange
  summary: AuthorAnalyticsApiSummary
  progress_funnel: AuthorAnalyticsApiFunnelStage[]
  reaction_trend: AuthorAnalyticsApiReactionTrendPoint[]
  top_links: AuthorAnalyticsApiLinkMetric[]
  traffic_sources: AuthorAnalyticsApiTrafficSourceMetric[]
  insights: AnalyticsInsight[]
  data_fresh_through: string
}

export interface AuthorAnalyticsApiPostDetailResponse {
  data: AuthorAnalyticsApiPostDetailData
}

export interface GetPostMetricsParams extends AnalyticsPostMetricsQuery {
  sort?: AnalyticsPostSort
  order?: AnalyticsSortOrder
}

export interface AuthorAnalyticsHttpClient {
  get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T>
}

export interface AuthorAnalyticsRepositoryPort {
  getOverview(
    range: AnalyticsDateRange,
  ): Promise<RepositoryResult<AuthorAnalyticsApiOverviewResponse>>
  getPostMetrics(
    params: GetPostMetricsParams,
  ): Promise<RepositoryResult<AuthorAnalyticsApiPostsResponse>>
  getPostDetail(
    postId: number,
    range: AnalyticsDateRange,
  ): Promise<RepositoryResult<AuthorAnalyticsApiPostDetailResponse>>
}

export class ApiAuthorAnalyticsRepository implements AuthorAnalyticsRepositoryPort {
  constructor(private readonly http: AuthorAnalyticsHttpClient = apiService) {}

  async getOverview(
    range: AnalyticsDateRange,
  ): Promise<RepositoryResult<AuthorAnalyticsApiOverviewResponse>> {
    return this.getResult('/users/me/analytics/overview', this.rangeParams(range))
  }

  async getPostMetrics({
    range,
    sort,
    order,
    page,
    limit,
  }: GetPostMetricsParams): Promise<RepositoryResult<AuthorAnalyticsApiPostsResponse>> {
    return this.getResult('/users/me/analytics/posts', {
      ...this.rangeParams(range),
      sort,
      order,
      page,
      limit,
    })
  }

  async getPostDetail(
    postId: number,
    range: AnalyticsDateRange,
  ): Promise<RepositoryResult<AuthorAnalyticsApiPostDetailResponse>> {
    return this.getResult(`/users/me/analytics/posts/${postId}`, this.rangeParams(range))
  }

  private rangeParams(range: AnalyticsDateRange): Record<string, string> {
    return {
      from: range.from,
      to: range.to,
    }
  }

  private async getResult<T>(
    endpoint: string,
    params: Record<string, unknown>,
  ): Promise<RepositoryResult<T>> {
    try {
      const data = await this.http.get<T>(endpoint, params)
      return { success: true, data }
    } catch (error) {
      return this.toRepositoryError(error)
    }
  }

  private toRepositoryError<T>(error: unknown): RepositoryResult<T> {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.status,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load author analytics.',
    }
  }
}
