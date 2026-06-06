import { AnalyticsDateRange } from './author-analytics.types'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DEFAULT_RANGE_DAYS = 30
const MAX_RANGE_DAYS = 366

const toUtcDateOnly = (date: Date) => date.toISOString().slice(0, 10)

const addUtcDays = (date: Date, days: number) => {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

const parseUtcDate = (value: string) => {
  if (!DATE_PATTERN.test(value)) return null

  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) || toUtcDateOnly(date) !== value ? null : date
}

export const createDefaultAnalyticsRange = (today = new Date()): AnalyticsDateRange => {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const start = addUtcDays(end, -(DEFAULT_RANGE_DAYS - 1))

  return {
    from: toUtcDateOnly(start),
    to: toUtcDateOnly(end),
    timezone: 'UTC',
  }
}

export const parseAnalyticsRange = (
  params: URLSearchParams,
  today = new Date(),
): AnalyticsDateRange => {
  const fallback = createDefaultAnalyticsRange(today)
  const fromValue = params.get('from')
  const toValue = params.get('to')

  if (!fromValue || !toValue) return fallback

  const from = parseUtcDate(fromValue)
  const to = parseUtcDate(toValue)

  if (!from || !to || from > to) return fallback

  const maxTo = addUtcDays(from, MAX_RANGE_DAYS - 1)
  if (to > maxTo) return fallback

  return {
    from: fromValue,
    to: toValue,
    timezone: 'UTC',
  }
}

export const serializeAnalyticsRange = (range: AnalyticsDateRange) => {
  const params = new URLSearchParams()
  params.set('from', range.from)
  params.set('to', range.to)
  return params
}
