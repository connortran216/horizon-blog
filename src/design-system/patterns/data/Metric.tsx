/**
 * Horizon Design System v2 - a single metric.
 *
 * One number with its name, its unit and - when it is an estimate - the label
 * that says so. It replaces the legacy `AnalyticsMetricCard` and the two stat
 * boxes in the legacy profile header.
 *
 * `horizon-blog-dsv2.6.3` acceptance 1 is why the approximate marker is not
 * optional here. `metricValue` returns the display string and the marker
 * together, and this component renders both: a visible "Approx." chip and a
 * visually hidden "approximate" after the number, because the `~` prefix is
 * silent in every screen reader.
 *
 * On a phone the metrics stack rather than shrinking. A 36px figure squeezed
 * into a quarter of a 375px screen is a number nobody can read, and four of
 * them is worse than four stacked cards.
 */

import { Box, Flex, VisuallyHidden } from '@chakra-ui/react'
import type { ReactElement } from 'react'

import { space } from '../../../theme/tokens'
import { Grid, Stack } from '../../components/layout'
import { Surface } from '../../components/surface'
import { Chip } from '../../components/status'
import { Skeleton } from '../../components/feedback'
import { Text } from '../../components/typography'
import { metricValue, type MetricKind } from './metric.logic'

export interface MetricProps {
  /** What the number counts: "Reading sessions". */
  label: string
  value: number
  kind?: MetricKind
  /** The backend says this is an estimate. Never inferred here. */
  isApproximate?: boolean
  /** One sentence saying what the number means or where it came from. */
  detail?: string
  /** A caveat about the sample. From `assessSample`. */
  caveat?: string
  /** The metric's mark. Decorative; the label carries the meaning. */
  icon?: ReactElement
  isLoading?: boolean
  locale?: string
}

export function Metric({
  label,
  value,
  kind = 'count',
  isApproximate = false,
  detail,
  caveat,
  icon,
  isLoading = false,
  locale,
}: MetricProps) {
  const resolved = metricValue({ value, kind, isApproximate, locale })

  return (
    <Surface as="article" depth="flat" height="100%">
      <Stack gap={2}>
        <Flex align="flex-start" justify="space-between" gap={space[2]}>
          <Text recipe="metadata" as="h3" color="text.secondary">
            {label}
          </Text>
          {icon === undefined ? null : (
            <Box color="text.muted" aria-hidden="true" flexShrink={0}>
              {icon}
            </Box>
          )}
        </Flex>

        {isLoading ? (
          // Sized off the type ramp the real figure will use, so nothing moves
          // when the number lands.
          <Skeleton shape={{ shape: 'text', textStyle: 'pageTitle' }} label={`the ${label}`} />
        ) : (
          <Flex align="baseline" gap={space[2]} flexWrap="wrap">
            <Text
              recipe="pageTitle"
              as="p"
              color="text.primary"
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {resolved.display}
              {/*
               * The tilde is a glyph, not a word. Without this the number is
               * read out as an exact figure, which is the whole failure the
               * approximate label exists to prevent.
               */}
              {resolved.spokenSuffix === null ? null : (
                <VisuallyHidden> {resolved.spokenSuffix}</VisuallyHidden>
              )}
            </Text>
            {resolved.marker === null ? null : <Chip>{resolved.marker}</Chip>}
          </Flex>
        )}

        {detail === undefined ? null : <Text recipe="metadata">{detail}</Text>}

        {caveat === undefined ? null : (
          <Text recipe="metadata" color="text.secondary">
            {caveat}
          </Text>
        )}
      </Stack>
    </Surface>
  )
}

export interface MetricGridProps {
  children: React.ReactNode
  /** Desktop column count. Four for the analytics summary row. */
  columns?: 2 | 3 | 4
}

/**
 * The row of metrics.
 *
 * One column on a phone, the requested count from 801px. The mobile adaptation
 * is stacking, not shrinking: `Grid` collapses to a single column below its
 * breakpoint, so each figure keeps its full size and its caveat.
 */
export function MetricGrid({ children, columns = 4 }: MetricGridProps) {
  /*
   * A `div`, not a `ul`. `Metric` renders an `article` with its own heading, so
   * the metrics are already reachable by heading navigation; wrapping them in a
   * list would need an `li` around each `article` and would announce "list, 4
   * items" before four headings that say the same thing.
   */
  return (
    <Grid columns={columns} gap={4}>
      {children}
    </Grid>
  )
}
