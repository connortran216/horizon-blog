import {
  AnalyticsDateRange,
  AnalyticsFunnelStage,
  AnalyticsPostSort,
  AnalyticsSortOrder,
  BlogMetricRow,
} from './author-analytics.types'

export type AnalyticsRangePreset = '7d' | '30d' | '90d'

export interface NormalizedFunnelStage {
  label: string
  sessions: number
  rate: number
  widthPercent: number
}

const presetDays: Record<AnalyticsRangePreset, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

const toUtcDateOnly = (date: Date) => date.toISOString().slice(0, 10)

const addUtcDays = (date: Date, days: number) => {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export const createAnalyticsRangePreset = (
  preset: AnalyticsRangePreset,
  today = new Date(),
): AnalyticsDateRange => {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const start = addUtcDays(end, -(presetDays[preset] - 1))

  return {
    from: toUtcDateOnly(start),
    to: toUtcDateOnly(end),
    timezone: 'UTC',
  }
}

export const normalizeFunnelStages = (stages: AnalyticsFunnelStage[]): NormalizedFunnelStage[] => {
  const maxSessions = Math.max(1, ...stages.map((stage) => stage.sessions))

  return stages.map((stage) => ({
    label: formatStageLabel(stage.stage),
    sessions: stage.sessions,
    rate: stage.rate,
    widthPercent: Math.round((stage.sessions / maxSessions) * 100),
  }))
}

export const sortBlogMetrics = (
  blogs: BlogMetricRow[],
  sort: AnalyticsPostSort,
  order: AnalyticsSortOrder,
): BlogMetricRow[] => {
  const direction = order === 'asc' ? 1 : -1

  return [...blogs].sort((left, right) => {
    const leftValue = getBlogMetricValue(left, sort)
    const rightValue = getBlogMetricValue(right, sort)

    if (leftValue === rightValue) return left.title.localeCompare(right.title)
    return (leftValue - rightValue) * direction
  })
}

export const formatStageLabel = (stage: string) => {
  if (stage === '25' || stage === '50' || stage === '75') return `${stage}% read`
  return stage
    .split('_')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

const getBlogMetricValue = (blog: BlogMetricRow, sort: AnalyticsPostSort): number => {
  if (sort === 'unique_readers') return blog.estimatedUniqueReaders
  if (sort === 'hearts_received') return blog.heartsReceived
  if (sort === 'shares') return blog.shares
  if (sort === 'completion_rate') return blog.completionRate
  if (sort === 'avg_active_read_seconds') return blog.avgActiveReadSeconds
  if (sort === 'link_clicks') return blog.linkClicks
  return blog.views
}
