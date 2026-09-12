/**
 * Horizon Design System v2 - the trend chart.
 *
 * Inline SVG from tokens. No charting library: this bundle adds no
 * dependencies, and a line, an area fill and a baseline are the whole shape.
 *
 * Readable before any animation runs, per `horizon-blog-dsv2.6.3`. The geometry
 * comes from `trendGeometry`, which takes no motion policy and no progress
 * value, so the line is complete at the first paint. `chartMotion` confirms
 * `geometryAnimated: false` under every policy; the only transition on the
 * drawing is a stroke colour change.
 *
 * Readable without sight, too. The `figure` carries a text summary as its
 * accessible name, and the full series is in a real table inside a `details`
 * disclosure underneath - so the data is reachable rather than trapped in a
 * path.
 */

import { Box, Flex } from '@chakra-ui/react'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { Stack } from '../../components/layout'
import { Surface } from '../../components/surface'
import { Heading, Text } from '../../components/typography'
import { EmptyState, PanelLoading, PermissionState, ErrorState } from '../../components/feedback'
import { useMotionPolicy } from '../../motion'
import { chartMotion, trendGeometry, trendSummary, type TrendPoint } from './chart.logic'
import { dataPanelState, metricValue, type DataPanelStateInput } from './metric.logic'

/**
 * The SVG user-space box. It is a coordinate system, not a size - the element
 * scales to its container - so these are not layout values and do not belong in
 * the token source.
 */
const VIEWBOX = { width: 320, height: 120 }

export interface TrendProps extends DataPanelStateInput {
  /** The metric being plotted: "Reading sessions". */
  title: string
  points: readonly TrendPoint[]
  /** One sentence about what the series covers. */
  detail?: string
  /** A partial-coverage notice from `assessCoverage`. */
  notice?: string
  deniedDetail?: string
}

export function Trend({
  title,
  points,
  detail,
  notice,
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: TrendProps) {
  const policy = useMotionPolicy()
  const motion = chartMotion(policy)
  const geometry = trendGeometry(points, VIEWBOX)
  const status = dataPanelState({
    isLoading,
    deniedAction,
    failedAction,
    rowCount: points.length,
  })

  return (
    <Surface as="section" depth="flat">
      <Stack gap={4}>
        <Flex align="baseline" justify="space-between" gap={space[3]} flexWrap="wrap">
          <Heading recipe="cardTitle" as="h3">
            {title}
          </Heading>
          {geometry.latest === null ? null : (
            <Text recipe="metadata" as="span">
              Latest: {metricValue({ value: geometry.latest.value }).display}
            </Text>
          )}
        </Flex>

        {detail === undefined ? null : <Text recipe="metadata">{detail}</Text>}

        {notice === undefined ? null : (
          <Text recipe="metadata" role="status" aria-live="polite" color="text.secondary">
            {notice}
          </Text>
        )}

        {status === 'denied' ? (
          <PermissionState deniedAction={deniedAction ?? 'view this chart'} detail={deniedDetail} />
        ) : status === 'error' ? (
          <ErrorState failedAction={failedAction ?? 'load this chart'} />
        ) : status === 'loading' ? (
          <PanelLoading task={title.toLowerCase()} />
        ) : status === 'empty' ? (
          <EmptyState
            subject="measurements in this range"
            nextAction="Widen the date range, or come back once the post has had some readers."
          />
        ) : (
          <>
            <Box
              as="figure"
              margin="0"
              role="img"
              // The whole chart, in a sentence. This is what a screen reader
              // reads instead of a path with 90 coordinate pairs in it.
              aria-label={trendSummary(title, points, geometry)}
            >
              <Box
                as="svg"
                viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
                width="100%"
                height={space[24]}
                preserveAspectRatio="none"
                overflow="visible"
              >
                {geometry.area === null ? null : (
                  <Box
                    as="polygon"
                    points={geometry.area}
                    fill={componentTokens.reader.progressTrack}
                  />
                )}
                <Box
                  as="line"
                  x1="0"
                  y1={VIEWBOX.height}
                  x2={VIEWBOX.width}
                  y2={VIEWBOX.height}
                  stroke={componentTokens.workspace.tableBorder}
                  strokeWidth="1"
                />
                {geometry.polyline === null ? null : (
                  <Box
                    as="polyline"
                    points={geometry.polyline}
                    fill="none"
                    stroke={componentTokens.reader.progressIndicator}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    // `preserveAspectRatio="none"` stretches the user space,
                    // which would stretch the stroke with it. This keeps the
                    // line an even weight at every container width.
                    vectorEffect="non-scaling-stroke"
                    transition={motion.transition}
                  />
                )}
              </Box>
            </Box>

            {geometry.isFlat ? (
              <Text recipe="metadata">
                Every day in this range has the same value, so the line is flat.
              </Text>
            ) : null}

            <Box as="details">
              <Box as="summary" cursor="pointer" borderRadius={radii.control}>
                <Text recipe="metadata" as="span">
                  Show these numbers as a table
                </Text>
              </Box>
              <Box
                as="table"
                width="100%"
                marginBlockStart={space[3]}
                sx={{ borderCollapse: 'collapse' }}
              >
                <Box as="caption" textAlign="start" paddingBlockEnd={space[2]}>
                  <Text recipe="metadata" as="span">
                    {title}, day by day
                  </Text>
                </Box>
                <Box as="thead">
                  <Box as="tr">
                    <Box as="th" scope="col" textAlign="start" paddingBlock={space[1]}>
                      <Text recipe="metadata" as="span">
                        Day
                      </Text>
                    </Box>
                    <Box as="th" scope="col" textAlign="end" paddingBlock={space[1]}>
                      <Text recipe="metadata" as="span">
                        {title}
                      </Text>
                    </Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {points.map((point) => (
                    <Box as="tr" key={point.label}>
                      <Box as="td" paddingBlock={space[1]}>
                        <Text recipe="metadata" as="span">
                          {point.label}
                        </Text>
                      </Box>
                      <Box
                        as="td"
                        textAlign="end"
                        paddingBlock={space[1]}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        <Text recipe="metadata" as="span">
                          {metricValue({ value: point.value }).display}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Stack>
    </Surface>
  )
}
