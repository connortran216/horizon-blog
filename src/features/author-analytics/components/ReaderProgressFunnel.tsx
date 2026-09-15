/**
 * The reading-progress funnel for a single blog, composed from the design
 * system's `Funnel` pattern.
 *
 * `assessSample` covers `horizon-blog-dsv2.6.3` acceptance 4's zero-sample case
 * here: with nobody reading in the range, `Funnel` renders its own empty state
 * rather than five zero-width bars that would read as "everyone dropped off"
 * instead of "nothing has been measured yet".
 */

import { assessSample, Funnel, type DataPanelStateInput } from '../../../design-system'
import { AnalyticsFunnelStage } from '../author-analytics.types'
import { formatStageLabel } from '../author-analytics.visualization'

interface ReaderProgressFunnelProps extends DataPanelStateInput {
  stages: AnalyticsFunnelStage[]
  deniedDetail?: string
}

const ReaderProgressFunnel = ({
  stages,
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: ReaderProgressFunnelProps) => {
  const sample = assessSample({ sampleSize: stages[0]?.sessions ?? 0 })

  return (
    <Funnel
      stages={stages.map((stage) => ({
        label: formatStageLabel(stage.stage),
        sessions: stage.sessions,
        rate: stage.rate,
      }))}
      caveat={sample.quality === 'thin' ? (sample.caveat ?? undefined) : undefined}
      isLoading={isLoading}
      deniedAction={deniedAction}
      deniedDetail={deniedDetail}
      failedAction={failedAction}
    />
  )
}

export default ReaderProgressFunnel
