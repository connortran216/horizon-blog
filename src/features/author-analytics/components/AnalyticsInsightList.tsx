/**
 * The author-facing insight list, composed from the design system's
 * `InsightList` pattern.
 *
 * The backend's own field name is `sample_size`; the pattern's contract calls
 * it `sampleSize` and requires it on every item, so mapping happens here rather
 * than asking the pattern to know about the wire shape.
 */

import { InsightList, type DataPanelStateInput, type Insight } from '../../../design-system'
import { AnalyticsInsight } from '../author-analytics.types'
import { formatEvidenceValue } from '../author-analytics.visualization'

interface AnalyticsInsightListProps extends DataPanelStateInput {
  insights: AnalyticsInsight[]
  title?: string
  deniedDetail?: string
}

const toInsight = (insight: AnalyticsInsight): Insight => ({
  code: insight.code,
  message: insight.message,
  sampleSize: insight.sample_size,
  evidence: insight.evidence.map((item) => ({
    metric: item.metric,
    value: formatEvidenceValue(item.value),
    baseline: formatEvidenceValue(item.baseline),
  })),
})

const AnalyticsInsightList = ({
  insights,
  title = 'Insights',
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: AnalyticsInsightListProps) => (
  <InsightList
    title={title}
    insights={insights.map(toInsight)}
    isLoading={isLoading}
    deniedAction={deniedAction}
    deniedDetail={deniedDetail}
    failedAction={failedAction}
  />
)

export default AnalyticsInsightList
