/**
 * Reaction movement for a single blog - hearts added and removed - composed
 * from `MetricGrid` for the two totals and `Trend` for the daily shape.
 *
 * `Trend` plots one series. Rather than force two lines through a pattern that
 * draws exactly one, this keeps the totals as the two numbers an author
 * actually compares ("added" vs "removed") and lets the line show the net
 * change per day, which is the shape a reader cannot get from the totals alone.
 */

import { MetricGrid, Metric, Stack, Trend, type DataPanelStateInput } from '../../../design-system'
import { AnalyticsReactionTrendPoint } from '../author-analytics.types'

interface AnalyticsReactionTrendProps extends DataPanelStateInput {
  points: AnalyticsReactionTrendPoint[]
  deniedDetail?: string
}

const AnalyticsReactionTrend = ({
  points,
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: AnalyticsReactionTrendProps) => {
  const totals = points.reduce(
    (sum, point) => ({
      added: sum.added + point.heartsAdded,
      removed: sum.removed + point.heartsRemoved,
    }),
    { added: 0, removed: 0 },
  )

  return (
    <Stack gap={4}>
      <MetricGrid columns={2}>
        <Metric label="Hearts added" value={totals.added} isLoading={isLoading} />
        <Metric label="Hearts removed" value={totals.removed} isLoading={isLoading} />
      </MetricGrid>
      <Trend
        title="Net reaction change"
        detail="Hearts added minus hearts removed, per day."
        points={points.map((point) => ({
          label: point.date,
          value: point.heartsAdded - point.heartsRemoved,
        }))}
        isLoading={isLoading}
        deniedAction={deniedAction}
        deniedDetail={deniedDetail}
        failedAction={failedAction}
      />
    </Stack>
  )
}

export default AnalyticsReactionTrend
