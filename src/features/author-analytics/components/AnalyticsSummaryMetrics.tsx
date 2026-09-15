/**
 * The summary metrics row - views, readers, completion, active read, hearts.
 *
 * `Metric` itself only knows `isLoading`; it has no denied or failed shape, so
 * this is the one place in the analytics pages that reaches for
 * `dataPanelState` directly rather than handing a data-panel pattern its own
 * state props. The five states still apply: denied and error each get their own
 * surface, loading renders the same grid with skeleton figures (so nothing
 * reflows when the numbers land), and empty says plainly that the range has no
 * measurements yet rather than drawing a row of zeroes that could be mistaken
 * for a real answer.
 *
 * `estimatedUniqueReaders` is the one number in this row the backend may mark
 * as an estimate. `Metric` renders the "Approx." chip and the visually hidden
 * "approximate" suffix itself whenever `isApproximate` is true - this
 * component only has to pass the flag through honestly.
 */

import {
  dataPanelState,
  EmptyState,
  ErrorState,
  Metric,
  MetricGrid,
  PermissionState,
  RetryAction,
  type DataPanelStateInput,
} from '../../../design-system'
import { AnalyticsSummary } from '../author-analytics.types'

export interface AnalyticsSummaryMetricsProps extends DataPanelStateInput {
  summary: AnalyticsSummary | null
  onRetry?: () => void
  deniedDetail?: string
}

export function AnalyticsSummaryMetrics({
  summary,
  isLoading,
  deniedAction,
  failedAction,
  onRetry,
  deniedDetail,
}: AnalyticsSummaryMetricsProps) {
  const status = dataPanelState({
    isLoading,
    deniedAction,
    failedAction,
    rowCount: summary && hasMeasurements(summary) ? 1 : 0,
  })

  if (status === 'denied') {
    return (
      <PermissionState deniedAction={deniedAction ?? 'view your analytics'} detail={deniedDetail} />
    )
  }

  if (status === 'error') {
    return (
      <ErrorState failedAction={failedAction ?? 'load your analytics'}>
        {onRetry === undefined ? null : (
          <RetryAction failedAction={failedAction ?? 'load your analytics'} onRetry={onRetry} />
        )}
      </ErrorState>
    )
  }

  if (status === 'empty') {
    return (
      <EmptyState
        subject="analytics for this range"
        nextAction="Widen the date range, or come back once this writing has had some readers."
      />
    )
  }

  if (status === 'loading' || summary === null) {
    return (
      <MetricGrid columns={3}>
        <Metric label="Views" value={0} isLoading />
        <Metric label="Unique readers" value={0} isLoading />
        <Metric label="Completion" value={0} isLoading />
        <Metric label="Active read" value={0} isLoading />
        <Metric label="Hearts received" value={0} isLoading />
        <Metric label="Active hearts" value={0} isLoading />
      </MetricGrid>
    )
  }

  return (
    <MetricGrid columns={3}>
      <Metric label="Views" value={summary.views} detail="Total blog opens" />
      <Metric
        label="Unique readers"
        value={summary.estimatedUniqueReaders}
        isApproximate={summary.uniqueReadersApproximate}
        detail="Backend HyperLogLog estimate"
      />
      <Metric
        label="Completion"
        value={summary.completionRate}
        kind="percent"
        detail="Readers reaching the end"
      />
      <Metric
        label="Active read"
        value={summary.avgActiveReadSeconds}
        kind="duration"
        detail="Average active reading time"
      />
      <Metric
        label="Hearts received"
        value={summary.heartsReceived}
        detail="Added during the selected range"
      />
      <Metric
        label="Active hearts"
        value={summary.activeHeartCount ?? 0}
        detail="Current hearts across published blogs"
      />
    </MetricGrid>
  )
}

const hasMeasurements = (summary: AnalyticsSummary): boolean =>
  summary.views > 0 ||
  summary.estimatedUniqueReaders > 0 ||
  summary.heartsReceived > 0 ||
  summary.shares > 0 ||
  summary.linkClicks > 0
