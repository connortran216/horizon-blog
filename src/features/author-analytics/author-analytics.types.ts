export interface AnalyticsDateRange {
  from: string
  to: string
  timezone: 'UTC'
}

export interface AnalyticsSummary {
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

export interface AnalyticsTrendPoint {
  date: string
  views: number
  estimated_unique_readers: number
  hearts_received: number
  shares: number
  completed: number
}

export interface AnalyticsPostMetric {
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

export interface AnalyticsOverviewData {
  range: AnalyticsDateRange
  summary: AnalyticsSummary
  trend: AnalyticsTrendPoint[]
  top_blogs: AnalyticsPostMetric[]
  insights: AnalyticsInsight[]
  data_fresh_through: string
  unique_readers_approximate: boolean
}

export interface AnalyticsOverviewResponse {
  data: AnalyticsOverviewData
}

export interface AnalyticsPostsResponse {
  data: AnalyticsPostMetric[]
  page: number
  limit: number
  total: number
  range: AnalyticsDateRange
  data_fresh_through: string
}

export interface AnalyticsPostReference {
  id: number
  title: string
  published_at: string
}

export interface AnalyticsFunnelStage {
  stage: string
  sessions: number
  rate: number
}

export interface AnalyticsReactionTrendPoint {
  date: string
  hearts_added: number
  hearts_removed: number
}

export interface AnalyticsLinkMetric {
  link_key: string
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
  completion_rate: number
  avg_active_read_seconds: number
}

export interface AnalyticsPostDetailData {
  post: AnalyticsPostReference
  range: AnalyticsDateRange
  summary: AnalyticsSummary
  progress_funnel: AnalyticsFunnelStage[]
  reaction_trend: AnalyticsReactionTrendPoint[]
  top_links: AnalyticsLinkMetric[]
  traffic_sources: AnalyticsTrafficSourceMetric[]
  insights: AnalyticsInsight[]
  data_fresh_through: string
}

export interface AnalyticsPostDetailResponse {
  data: AnalyticsPostDetailData
}
