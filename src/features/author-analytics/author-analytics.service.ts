import { ApiError } from '../../core/services/api.service'
import { RepositoryResult } from '../../core/types/blog-repository.types'
import {
  AuthorAnalyticsApiLinkMetric,
  AuthorAnalyticsApiPostReference,
  AuthorAnalyticsApiPostMetric,
  AuthorAnalyticsApiReactionTrendPoint,
  AuthorAnalyticsApiSummary,
  AuthorAnalyticsApiTrafficSourceMetric,
  AuthorAnalyticsApiTrendPoint,
  AuthorAnalyticsRepositoryPort,
  ApiAuthorAnalyticsRepository,
  GetPostMetricsParams,
} from './author-analytics.repository'
import {
  AnalyticsDateRange,
  AnalyticsLinkMetric,
  AnalyticsSummary,
  AnalyticsTrendPoint,
  BlogAnalyticsDetail,
  BlogMetricRow,
  BlogMetricsPage,
  AnalyticsOverview,
  AnalyticsPostReference,
  AnalyticsReactionTrendPoint,
  AnalyticsTrafficSourceMetric,
} from './author-analytics.types'

export class AuthorAnalyticsService {
  constructor(
    private readonly repository: AuthorAnalyticsRepositoryPort = new ApiAuthorAnalyticsRepository(),
  ) {}

  async getOverview(range: AnalyticsDateRange): Promise<AnalyticsOverview> {
    const response = this.unwrapResult(
      await this.repository.getOverview(range),
      'Failed to load analytics overview.',
    )

    return {
      range: response.data.range,
      summary: this.mapSummary(response.data.summary),
      trend: response.data.trend.map((point) => this.mapTrendPoint(point)),
      topBlogs: response.data.top_blogs.map((post) => this.mapPostMetric(post)),
      insights: response.data.insights,
      dataFreshThrough: response.data.data_fresh_through,
      uniqueReadersApproximate: response.data.unique_readers_approximate,
    }
  }

  async getPostMetrics(params: GetPostMetricsParams): Promise<BlogMetricsPage> {
    const response = this.unwrapResult(
      await this.repository.getPostMetrics(params),
      'Failed to load blog analytics metrics.',
    )

    return {
      posts: response.data.map((post) => this.mapPostMetric(post)),
      page: response.page,
      limit: response.limit,
      total: response.total,
      range: response.range,
      dataFreshThrough: response.data_fresh_through,
    }
  }

  async getPostDetail(postId: number, range: AnalyticsDateRange): Promise<BlogAnalyticsDetail> {
    const response = this.unwrapResult(
      await this.repository.getPostDetail(postId, range),
      'Failed to load blog analytics detail.',
    )

    return {
      post: this.mapPostReference(response.data.post),
      range: response.data.range,
      summary: this.mapSummary(response.data.summary),
      progressFunnel: response.data.progress_funnel,
      reactionTrend: response.data.reaction_trend.map((point) => this.mapReactionTrend(point)),
      topLinks: response.data.top_links.map((link) => this.mapLinkMetric(link)),
      trafficSources: response.data.traffic_sources.map((source) => this.mapTrafficSource(source)),
      insights: response.data.insights,
      dataFreshThrough: response.data.data_fresh_through,
    }
  }

  private unwrapResult<T>(result: RepositoryResult<T>, fallback: string): T {
    if (result.success && result.data !== undefined) {
      return result.data
    }

    throw new ApiError(result.error || fallback, result.statusCode ?? 500)
  }

  private mapSummary(summary: AuthorAnalyticsApiSummary): AnalyticsSummary {
    return {
      views: summary.views,
      estimatedUniqueReaders: summary.estimated_unique_readers,
      uniqueReadersApproximate: summary.unique_readers_approximate,
      heartsReceived: summary.hearts_received,
      shares: summary.shares,
      linkClicks: summary.link_clicks,
      completionRate: summary.completion_rate,
      avgActiveReadSeconds: summary.avg_active_read_seconds,
      activeHeartCount: summary.active_heart_count,
    }
  }

  private mapTrendPoint(point: AuthorAnalyticsApiTrendPoint): AnalyticsTrendPoint {
    return {
      date: point.date,
      views: point.views,
      estimatedUniqueReaders: point.estimated_unique_readers,
      heartsReceived: point.hearts_received,
      shares: point.shares,
      completed: point.completed,
    }
  }

  private mapPostMetric(post: AuthorAnalyticsApiPostMetric): BlogMetricRow {
    return {
      postId: post.post_id,
      title: post.title,
      views: post.views,
      estimatedUniqueReaders: post.estimated_unique_readers,
      uniqueReadersApproximate: post.unique_readers_approximate,
      heartsReceived: post.hearts_received,
      shares: post.shares,
      linkClicks: post.link_clicks,
      completionRate: post.completion_rate,
      avgActiveReadSeconds: post.avg_active_read_seconds,
    }
  }

  private mapPostReference(post: AuthorAnalyticsApiPostReference): AnalyticsPostReference {
    return {
      id: post.id,
      title: post.title,
      publishedAt: post.published_at,
    }
  }

  private mapReactionTrend(
    point: AuthorAnalyticsApiReactionTrendPoint,
  ): AnalyticsReactionTrendPoint {
    return {
      date: point.date,
      heartsAdded: point.hearts_added,
      heartsRemoved: point.hearts_removed,
    }
  }

  private mapLinkMetric(link: AuthorAnalyticsApiLinkMetric): AnalyticsLinkMetric {
    return {
      linkKey: link.link_key,
      url: link.url,
      label: link.label,
      kind: link.kind,
      clicks: link.clicks,
      ctr: link.ctr,
    }
  }

  private mapTrafficSource(
    source: AuthorAnalyticsApiTrafficSourceMetric,
  ): AnalyticsTrafficSourceMetric {
    return {
      category: source.category,
      host: source.host,
      views: source.views,
      completionRate: source.completion_rate,
      avgActiveReadSeconds: source.avg_active_read_seconds,
    }
  }
}

export const createAuthorAnalyticsServiceInstance = (
  repository: AuthorAnalyticsRepositoryPort,
): AuthorAnalyticsService => new AuthorAnalyticsService(repository)
