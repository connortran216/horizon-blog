/**
 * Horizon Design System v2 - the reading-progress funnel.
 *
 * Stages down the article and how many readers reached each one. It replaces
 * the legacy `ReaderProgressFunnel`.
 *
 * The bars are `div`s sized by `funnelRows`, not a chart. They are drawn at
 * their final width immediately - there is no grow-in - so the funnel is
 * readable before and without animation, per `horizon-blog-dsv2.6.3`.
 *
 * Every bar is paired with its number *and* the drop from the previous stage.
 * The drop is the thing an author is actually looking for, and making them
 * subtract two percentages to find it is how a chart becomes decoration.
 *
 * Zero sessions is not a funnel of zeroes. `assessSample` says whether a rate is
 * worth drawing at all, and the caller passes the caveat down; five empty bars
 * read as "nobody finished", which is a different claim from "nobody started".
 */

import { Box, Flex } from '@chakra-ui/react'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { Stack } from '../../components/layout'
import { Heading, Text } from '../../components/typography'
import { EmptyState, PanelLoading, PermissionState, ErrorState } from '../../components/feedback'
import { funnelRows, type FunnelStage } from './chart.logic'
import { ReportSection } from './ReportSection'
import {
  dataPanelState,
  formatPercent,
  metricValue,
  type DataPanelStateInput,
} from './metric.logic'

export interface FunnelProps extends DataPanelStateInput {
  title?: string
  detail?: string
  stages: readonly FunnelStage[]
  /** A caveat from `assessSample` when the sample is thin. */
  caveat?: string
  deniedDetail?: string
}

export function Funnel({
  title = 'Reading progress',
  detail = 'Where readers tend to continue, and where they stop.',
  stages,
  caveat,
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: FunnelProps) {
  const rows = funnelRows(stages)
  const status = dataPanelState({
    isLoading,
    deniedAction,
    failedAction,
    // A funnel of stages that all read zero is empty, not ready: the article
    // has not been opened, and five zero bars would say something else.
    rowCount: rows.some((row) => row.sessions > 0) ? rows.length : 0,
  })

  return (
    <ReportSection>
      <Heading recipe="cardTitle" as="h3">
        {title}
      </Heading>
      <Text recipe="metadata">{detail}</Text>

      {status === 'denied' ? (
        <PermissionState
          deniedAction={deniedAction ?? 'view this breakdown'}
          detail={deniedDetail}
        />
      ) : status === 'error' ? (
        <ErrorState failedAction={failedAction ?? 'load the reading progress'} />
      ) : status === 'loading' ? (
        <PanelLoading task="the reading progress" />
      ) : status === 'empty' ? (
        <EmptyState
          subject="reading sessions in this range"
          nextAction="Come back once this post has been opened, or widen the date range."
        />
      ) : (
        <Stack as="ol" gap={4}>
          {rows.map((row) => (
            <Box as="li" key={row.label}>
              <Flex justify="space-between" gap={space[2]} flexWrap="wrap">
                <Text recipe="metadata" as="span" color="text.secondary">
                  {row.label}
                </Text>
                <Text recipe="metadata" as="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {metricValue({ value: row.sessions }).display} sessions ·{' '}
                  {formatPercent(row.rate)}
                </Text>
              </Flex>

              <Box
                height={space[2]}
                marginBlock={space[2]}
                borderRadius={radii.tag}
                bg={componentTokens.reader.progressTrack}
                overflow="hidden"
                // The bar is decoration. The numbers above it are the
                // content, and they are already in the accessible tree.
                aria-hidden="true"
              >
                <Box
                  height="100%"
                  width={`${row.widthPercent}%`}
                  // A stage with readers but a tiny share still gets a
                  // visible sliver, so "a few" does not render as "none".
                  minWidth={row.sessions > 0 ? space[1] : undefined}
                  borderRadius={radii.tag}
                  bg={componentTokens.reader.progressIndicator}
                />
              </Box>

              {row.droppedFromPrevious === null ? null : (
                <Text recipe="metadata">
                  {row.droppedFromPrevious > 0
                    ? `${metricValue({ value: row.droppedFromPrevious }).display} stopped before this point.`
                    : 'Nobody stopped before this point.'}
                </Text>
              )}
            </Box>
          ))}
        </Stack>
      )}

      {caveat === undefined ? null : (
        <Text recipe="metadata" color="text.secondary">
          {caveat}
        </Text>
      )}
    </ReportSection>
  )
}
