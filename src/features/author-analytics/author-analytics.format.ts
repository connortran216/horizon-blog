export interface ApproximateReadersFormat {
  value: string
  label: string
  isApproximate: boolean
}

const numberFormatter = new Intl.NumberFormat('en-US')

export const formatAnalyticsInteger = (value: number) => numberFormatter.format(value)

/**
 * Rounded to a tenth before asking whether it is whole: `0.58 * 100` is
 * `58.00000000000001` in floating point, which used to print as "58.0%" beside
 * "47%" in the same column.
 */
export const formatAnalyticsPercent = (ratio: number) => {
  const rounded = Math.round(ratio * 1000) / 10

  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`
}

export const formatAnalyticsDuration = (seconds: number) => {
  const normalized = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(normalized / 60)
  const remainingSeconds = normalized % 60

  if (minutes === 0) {
    return `${remainingSeconds}s`
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`
  }

  return `${minutes}m ${remainingSeconds}s`
}

export const formatApproximateReaders = (
  count: number,
  isApproximate: boolean,
): ApproximateReadersFormat => ({
  value: `${isApproximate ? '~' : ''}${formatAnalyticsInteger(count)}`,
  label: isApproximate ? 'Approx. unique readers' : 'Unique readers',
  isApproximate,
})

const EVIDENCE_METRICS: Record<string, { label: string; kind: 'percent' | 'duration' | 'count' }> =
  {
    completion_rate: { label: 'Completion', kind: 'percent' },
    avg_active_read_seconds: { label: 'Active read', kind: 'duration' },
    views: { label: 'Views', kind: 'count' },
    estimated_unique_readers: { label: 'Readers', kind: 'count' },
    hearts_received: { label: 'Hearts', kind: 'count' },
    shares: { label: 'Shares', kind: 'count' },
    link_clicks: { label: 'Link clicks', kind: 'count' },
    ctr: { label: 'Click-through', kind: 'percent' },
  }

/**
 * A backend metric key as the author reads it: "completion_rate" is
 * "Completion". An unknown key is humanised rather than shown raw.
 */
export const formatEvidenceMetric = (metric: string): string =>
  EVIDENCE_METRICS[metric]?.label ??
  metric
    .split('_')
    .filter(Boolean)
    .map((part, index) => (index === 0 ? `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}` : part))
    .join(' ')

/** An evidence value in the unit its metric is measured in. */
export const formatEvidenceMetricValue = (metric: string, value: number): string => {
  const kind = EVIDENCE_METRICS[metric]?.kind

  if (kind === 'percent') return formatAnalyticsPercent(value)
  if (kind === 'duration') return formatAnalyticsDuration(value)
  if (kind === 'count') return formatAnalyticsInteger(value)

  return value >= 0 && value <= 1 ? formatAnalyticsPercent(value) : formatAnalyticsInteger(value)
}

const freshFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

/**
 * "Fresh through Sep 25, 2026, 04:09 UTC" rather than a raw ISO timestamp. The
 * analytics range is measured in UTC, so the freshness is stated in UTC too.
 * An unreadable value is passed through unchanged rather than hidden.
 */
export const formatFreshThrough = (iso: string): string => {
  const date = new Date(iso)

  return Number.isNaN(date.getTime()) ? iso : `${freshFormatter.format(date)} UTC`
}
