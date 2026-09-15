/**
 * The views trend chart, composed from the design system's `Trend` pattern.
 *
 * `assessCoverage` is what turns a pipeline lag into a visible notice instead
 * of a dashboard that quietly under-reports the last day or two of a range -
 * see `horizon-blog-dsv2.6.3` acceptance 1's sibling concern about honest
 * numbers.
 */

import { assessCoverage, Trend, type DataPanelStateInput } from '../../../design-system'
import { AnalyticsTrendPoint } from '../author-analytics.types'

interface AnalyticsTrendChartProps extends DataPanelStateInput {
  title: string
  points: AnalyticsTrendPoint[]
  detail?: string
  dataFreshThrough?: string
  rangeEnd?: string
  deniedDetail?: string
}

const AnalyticsTrendChart = ({
  title,
  points,
  detail,
  dataFreshThrough,
  rangeEnd,
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: AnalyticsTrendChartProps) => {
  const coverage = assessCoverage({ freshThrough: dataFreshThrough, rangeEnd })

  return (
    <Trend
      title={title}
      points={points.map((point) => ({ label: point.date, value: point.views }))}
      detail={detail}
      notice={coverage.notice ?? undefined}
      isLoading={isLoading}
      deniedAction={deniedAction}
      deniedDetail={deniedDetail}
      failedAction={failedAction}
    />
  )
}

export default AnalyticsTrendChart
