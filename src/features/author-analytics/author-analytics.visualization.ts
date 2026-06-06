import { AnalyticsDateRange, AnalyticsFunnelStage } from './author-analytics.types'
import { AnalyticsLoadErrorState } from './author-analytics.hook-state'

export type AnalyticsRangePreset = '7d' | '30d' | '90d'

interface TrendPointInput {
  date: string
  value: number
}

interface TrendBounds {
  width: number
  height: number
}

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

export const buildTrendPolyline = (points: TrendPointInput[], bounds: TrendBounds): string => {
  if (points.length === 0) return ''

  const values = points.map((point) => Math.max(0, point.value))
  const min = Math.min(...values)
  const max = Math.max(...values)

  if (points.length === 1 || min === max) {
    return `0,${bounds.height / 2} ${bounds.width},${bounds.height / 2}`
  }

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * bounds.width
      const normalizedValue = (Math.max(0, point.value) - min) / (max - min)
      const y = bounds.height - normalizedValue * bounds.height
      return `${roundCoordinate(x)},${roundCoordinate(y)}`
    })
    .join(' ')
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

export const getAnalyticsErrorCopy = (
  error: AnalyticsLoadErrorState,
): { title: string; description: string } => {
  if (error.kind === 'unauthorized') {
    return {
      title: 'Your session needs attention',
      description: 'Sign in again to view analytics for your writing.',
    }
  }

  if (error.kind === 'not_found') {
    return {
      title: 'Analytics not found',
      description: 'This blog may not belong to your account or may not have analytics yet.',
    }
  }

  if (error.kind === 'service_unavailable') {
    return {
      title: 'Analytics is catching up',
      description: 'Analytics data is temporarily unavailable. Your blogs are still safe.',
    }
  }

  return {
    title: 'Analytics could not load',
    description: error.message || 'Try refreshing this page in a moment.',
  }
}

const formatStageLabel = (stage: string) => {
  if (stage === '25' || stage === '50' || stage === '75') return `${stage}% read`
  return stage
    .split('_')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

const roundCoordinate = (value: number) => Number(value.toFixed(2))
