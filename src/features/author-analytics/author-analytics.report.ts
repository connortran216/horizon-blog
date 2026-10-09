import { AnalyticsFunnelStage, BlogMetricRow } from './author-analytics.types'

export const completionPercent = (ratio: number): number =>
  Number.isFinite(ratio)
    ? Math.round(Math.max(0, Math.min(100, ratio * 100)) * 1000000) / 1000000
    : 0

const searchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()

export const filterReportBlogs = (blogs: BlogMetricRow[], query: string): BlogMetricRow[] => {
  const needle = searchText(query)
  return needle ? blogs.filter((blog) => searchText(blog.title).includes(needle)) : blogs
}

export const readingObservation = (stages: AnalyticsFunnelStage[]) => {
  const opened = stages.find((stage) => stage.stage === 'opened')?.sessions
  const reached = stages.find((stage) => stage.stage === '25')?.sessions
  if (
    opened === undefined ||
    reached === undefined ||
    !Number.isFinite(opened) ||
    !Number.isFinite(reached) ||
    opened <= 0 ||
    reached < 0 ||
    reached > opened
  )
    return null
  return { opened, reached, notReached: opened - reached }
}

export const reportSortOptions = {
  views: 'Views',
  completion_rate: 'Completion',
  avg_active_read_seconds: 'Active read time',
} as const
export type ReportSort = keyof typeof reportSortOptions
export const parseReportControls = (params: URLSearchParams) => {
  const rawPage = Number(params.get('page') || '1')
  const rawSort = params.get('sort') || 'views'
  return {
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    sort: (Object.prototype.hasOwnProperty.call(reportSortOptions, rawSort)
      ? rawSort
      : 'views') as ReportSort,
    order: params.get('order') === 'asc' ? ('asc' as const) : ('desc' as const),
    query: params.get('q') || '',
  }
}
