/**
 * Where a blog's readers came from, composed from the design system's
 * `Breakdown` pattern.
 */

import { Breakdown, type DataPanelStateInput } from '../../../design-system'
import { AnalyticsTrafficSourceMetric } from '../author-analytics.types'
import { formatAnalyticsDuration, formatAnalyticsPercent } from '../author-analytics.format'

interface TrafficSourceBreakdownProps extends DataPanelStateInput {
  sources: AnalyticsTrafficSourceMetric[]
  deniedDetail?: string
}

const TrafficSourceBreakdown = ({
  sources,
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: TrafficSourceBreakdownProps) => (
  <Breakdown
    title="Traffic sources"
    detail="Where readers came from and how deeply they read."
    unitLabel="views"
    items={sources.map((source) => ({
      label: source.category,
      value: source.views,
      detail: `${source.host || 'Direct or unknown'} · ${formatAnalyticsPercent(
        source.completionRate,
      )} completion · ${formatAnalyticsDuration(source.avgActiveReadSeconds)} active read`,
    }))}
    isLoading={isLoading}
    deniedAction={deniedAction}
    deniedDetail={deniedDetail}
    failedAction={failedAction}
  />
)

export default TrafficSourceBreakdown
