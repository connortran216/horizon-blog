export interface AnalyticsDateRange {
  from: string
  to: string
  timezone: 'UTC'
}

export interface AnalyticsSummary {
  views: number
  estimatedUniqueReaders: number
  uniqueReadersApproximate: boolean
  heartsReceived: number
  shares: number
  linkClicks: number
  completionRate: number
  avgActiveReadSeconds: number
  activeHeartCount?: number
}

export interface AnalyticsTrendPoint {
  date: string
  views: number
  estimatedUniqueReaders: number
  heartsReceived: number
  shares: number
  completed: number
}

export interface BlogMetricRow {
  postId: number
  title: string
  views: number
  estimatedUniqueReaders: number
  uniqueReadersApproximate: boolean
  heartsReceived: number
  activeHeartCount: number
  shares: number
  linkClicks: number
  completionRate: number
  avgActiveReadSeconds: number
}

export interface AnalyticsInsightEvidence {
  metric: string
  value: number
  baseline: number
}

export interface AnalyticsInsight {
  code: string
  message: string
  sample_size: number
  evidence: AnalyticsInsightEvidence[]
}

export interface AnalyticsOverview {
  range: AnalyticsDateRange
  summary: AnalyticsSummary
  trend: AnalyticsTrendPoint[]
  topBlogs: BlogMetricRow[]
  insights: AnalyticsInsight[]
  dataFreshThrough: string
  uniqueReadersApproximate: boolean
}

export interface BlogMetricsPage {
  posts: BlogMetricRow[]
  page: number
  limit: number
  total: number
  range: AnalyticsDateRange
  dataFreshThrough: string
}

export interface AnalyticsPostReference {
  id: number
  title: string
  publishedAt: string
}

export interface AnalyticsFunnelStage {
  stage: string
  sessions: number
  rate: number
}

export interface AnalyticsReactionTrendPoint {
  date: string
  heartsAdded: number
  heartsRemoved: number
}

export interface AnalyticsLinkMetric {
  linkKey: string
  url: string
  label: string
  kind: string
  clicks: number
  ctr: number
}

export interface AnalyticsTrafficSourceMetric {
  category: string
  host: string
  views: number
  completionRate: number
  avgActiveReadSeconds: number
}

export interface BlogAnalyticsDetail {
  post: AnalyticsPostReference
  range: AnalyticsDateRange
  summary: AnalyticsSummary
  progressFunnel: AnalyticsFunnelStage[]
  reactionTrend: AnalyticsReactionTrendPoint[]
  topLinks: AnalyticsLinkMetric[]
  trafficSources: AnalyticsTrafficSourceMetric[]
  insights: AnalyticsInsight[]
  dataFreshThrough: string
}

export type AnalyticsPostSort =
  | 'views'
  | 'unique_readers'
  | 'hearts_received'
  | 'shares'
  | 'completion_rate'
  | 'avg_active_read_seconds'
  | 'link_clicks'

export type AnalyticsSortOrder = 'asc' | 'desc'

export interface AnalyticsPostMetricsQuery {
  range: AnalyticsDateRange
  sort?: AnalyticsPostSort
  order?: AnalyticsSortOrder
  page?: number
  limit?: number
}
