/**
 * Horizon Design System v2 - the insight list.
 *
 * The cautious notes the analytics backend emits, each with the sample it came
 * from and the evidence behind it. It replaces the legacy
 * `AnalyticsInsightList`.
 *
 * The evidence is not optional decoration here. An insight without its sample
 * size is a claim; an insight with "based on 12 sessions" beside it is a claim
 * a reader can weigh. The legacy component already renders both, and this keeps
 * that pairing structural: `sampleSize` is a required field on the item type.
 */

import { Box } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { Stack } from '../../components/layout'
import { Heading, Text } from '../../components/typography'
import { EmptyState, PanelLoading, PermissionState, ErrorState } from '../../components/feedback'
import { ReportSection } from './ReportSection'
import { assessSample, dataPanelState, type DataPanelStateInput } from './metric.logic'

export interface InsightEvidence {
  /** The metric the note is about: "completion rate". */
  readonly metric: string
  /** The observed value, already formatted by the caller. */
  readonly value: string
  /** What it is being compared against, already formatted. */
  readonly baseline: string
}

export interface Insight {
  /** Stable key from the backend. */
  readonly code: string
  /** The note itself, in the backend's own words. */
  readonly message: string
  /** How many observations it rests on. Required, and always shown. */
  readonly sampleSize: number
  readonly evidence?: readonly InsightEvidence[]
}

export interface InsightListProps extends Omit<DataPanelStateInput, 'rowCount'> {
  insights: readonly Insight[]
  title?: string
  detail?: string
  /** Below this sample size an insight is shown with a caveat. */
  minimumSample?: number
  deniedDetail?: string
}

export function InsightList({
  insights,
  title = 'What the numbers suggest',
  detail = 'Notes the analytics service is confident enough to state. Each one shows the evidence it rests on.',
  minimumSample,
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: InsightListProps) {
  const status = dataPanelState({
    isLoading,
    deniedAction,
    failedAction,
    rowCount: insights.length,
  })

  return (
    <ReportSection>
      <Heading recipe="cardTitle" as="h3">
        {title}
      </Heading>
      <Text recipe="metadata">{detail}</Text>

      {status === 'denied' ? (
        <PermissionState
          deniedAction={deniedAction ?? 'view these insights'}
          detail={deniedDetail}
        />
      ) : status === 'error' ? (
        <ErrorState failedAction={failedAction ?? 'load the insights'} />
      ) : status === 'loading' ? (
        <PanelLoading task="the insights" />
      ) : status === 'empty' ? (
        <EmptyState
          subject="notes for this range"
          nextAction="Nothing here yet is different enough from the baseline to be worth stating. Try a wider range."
        />
      ) : (
        <Stack as="ul" gap={4}>
          {insights.map((insight) => {
            const sample = assessSample({ sampleSize: insight.sampleSize, minimumSample })

            return (
              <Box
                as="li"
                key={insight.code}
                listStyleType="none"
                paddingInlineStart={space[4]}
                borderInlineStartWidth="2px"
                borderInlineStartStyle="solid"
                borderInlineStartColor="action.primary"
              >
                <Stack gap={2}>
                  <Text recipe="prose" color="text.primary">
                    {insight.message}
                  </Text>

                  <Text recipe="metadata">
                    Based on {insight.sampleSize}{' '}
                    {insight.sampleSize === 1 ? 'session' : 'sessions'}
                  </Text>

                  {sample.quality === 'thin' && sample.caveat !== null ? (
                    <Text recipe="metadata" color="text.secondary">
                      {sample.caveat}
                    </Text>
                  ) : null}

                  {insight.evidence === undefined || insight.evidence.length === 0 ? null : (
                    <Box as="dl" margin="0">
                      {insight.evidence.map((item) => (
                        <Box
                          key={item.metric}
                          display="flex"
                          flexWrap="wrap"
                          gap={space[2]}
                          paddingBlock={space[1]}
                        >
                          <Text recipe="metadata" as="dt" color="text.secondary">
                            {item.metric}
                          </Text>
                          <Text recipe="metadata" as="dd" marginInlineStart="0">
                            {item.value}, against a {item.baseline} baseline
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Stack>
              </Box>
            )
          })}
        </Stack>
      )}
    </ReportSection>
  )
}
