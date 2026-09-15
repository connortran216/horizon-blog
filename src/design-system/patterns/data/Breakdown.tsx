/**
 * Horizon Design System v2 - a share breakdown.
 *
 * Where readers came from, which links they followed, how a total splits. It
 * replaces the legacy `TrafficSourceBreakdown`.
 *
 * Bars from tokens, no chart library, final width at the first paint. The
 * arithmetic that matters is in `breakdownRows`: shares are of the true total
 * including whatever was folded into "Other", so the visible percentages add up
 * to a hundred and a reader comparing this panel against the summary figure
 * above it does not find a gap.
 */

import { Box, Flex } from '@chakra-ui/react'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { Stack } from '../../components/layout'
import { Surface } from '../../components/surface'
import { Heading, Text } from '../../components/typography'
import { EmptyState, PanelLoading, PermissionState, ErrorState } from '../../components/feedback'
import { breakdownRows, type BreakdownItem } from './chart.logic'
import {
  dataPanelState,
  metricValue,
  type DataPanelStateInput,
  type MetricKind,
} from './metric.logic'

export interface BreakdownProps extends DataPanelStateInput {
  title: string
  detail?: string
  items: readonly BreakdownItem[]
  /** Show at most this many rows and fold the rest into "Other". */
  maxRows?: number
  /** How the values read. `count` for views, `duration` for time. */
  kind?: MetricKind
  /** What one unit is called, for the row readout: "views". */
  unitLabel?: string
  deniedDetail?: string
}

export function Breakdown({
  title,
  detail,
  items,
  maxRows = 0,
  kind = 'count',
  unitLabel,
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: BreakdownProps) {
  const result = breakdownRows(items, { maxRows })
  const status = dataPanelState({
    isLoading,
    deniedAction,
    failedAction,
    rowCount: result.hasData ? result.rows.length : 0,
  })

  return (
    <Surface as="section" depth="flat">
      <Stack gap={4}>
        <Heading recipe="cardTitle" as="h3">
          {title}
        </Heading>
        {detail === undefined ? null : <Text recipe="metadata">{detail}</Text>}

        {status === 'denied' ? (
          <PermissionState
            deniedAction={deniedAction ?? 'view this breakdown'}
            detail={deniedDetail}
          />
        ) : status === 'error' ? (
          <ErrorState failedAction={failedAction ?? `load the ${title.toLowerCase()}`} />
        ) : status === 'loading' ? (
          <PanelLoading task={title.toLowerCase()} />
        ) : status === 'empty' ? (
          <EmptyState
            subject={`${title.toLowerCase()} in this range`}
            nextAction="Widen the date range, or come back once this post has had some traffic."
          />
        ) : (
          <Stack as="ul" gap={3}>
            {result.rows.map((row) => (
              <Box as="li" key={`${row.label}:${row.detail ?? ''}`}>
                <Flex justify="space-between" gap={space[3]} align="baseline" flexWrap="wrap">
                  <Box minW="0">
                    <Text recipe="body" as="span" color="text.primary">
                      {row.label}
                    </Text>
                    {row.detail === undefined ? null : <Text recipe="metadata">{row.detail}</Text>}
                  </Box>
                  <Text recipe="metadata" as="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {metricValue({ value: row.value, kind }).display}
                    {unitLabel === undefined ? '' : ` ${unitLabel}`} · {row.sharePercent}%
                  </Text>
                </Flex>

                <Box
                  height={space[2]}
                  marginBlockStart={space[2]}
                  borderRadius={radii.tag}
                  bg={componentTokens.reader.progressTrack}
                  overflow="hidden"
                  // Decoration. The share is already stated as text above it.
                  aria-hidden="true"
                >
                  <Box
                    height="100%"
                    width={`${row.widthPercent}%`}
                    minWidth={row.value > 0 ? space[1] : undefined}
                    borderRadius={radii.tag}
                    bg={componentTokens.reader.progressIndicator}
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Surface>
  )
}
