/**
 * Horizon Design System v2 - the trend chart.
 *
 * Inline SVG from tokens. No charting library: this bundle adds no
 * dependencies, and a line, an area fill and a baseline are the whole shape.
 *
 * The geometry comes from confirmed points only. On a later successful range
 * change the SVG crossfades from its previous confirmed shape, while the accessible
 * summary and table expose the final dataset immediately. The first paint and
 * reduced-motion path both land directly on final geometry.
 *
 * Readable without sight, too. The `figure` carries a text summary as its
 * accessible name, and the full series is in a real table inside a `details`
 * disclosure underneath - so the data is reachable rather than trapped in a
 * path.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { animate, motion as framerMotion, useMotionValue, useTransform } from 'framer-motion'

import { componentTokens, duration, easing, radii, space } from '../../../theme/tokens'
import { Heading, Text } from '../../components/typography'
import { EmptyState, PanelLoading, PermissionState, ErrorState } from '../../components/feedback'
import {
  durationSeconds,
  signalLineFrame,
  standardEase,
  useMotionPolicy,
  useRevealInView,
} from '../../motion'
import { SignalSpark } from '../../motion/SignalSpark'
import {
  chartMotion,
  pointAlong,
  trendGeometry,
  trendSummary,
  type TrendPoint,
} from './chart.logic'
import { ReportSection } from './ReportSection'
import { dataPanelState, metricValue, type DataPanelStateInput } from './metric.logic'

/**
 * The SVG user-space box. It is a coordinate system, not a size - the element
 * scales to its container - so these are not layout values and do not belong in
 * the token source.
 */
const VIEWBOX = { width: 320, height: 120 }
const MotionBox = framerMotion(Box)
const leaveGeometry = keyframes({ from: { opacity: 1 }, to: { opacity: 0 } })

const pointsToPath = (points: string, close = false) => {
  const coordinates = points.split(' ').map((point) => point.replace(',', ' '))

  return `M ${coordinates.join(' L ')}${close ? ' Z' : ''}`
}

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
  const lastGeometry = useRef(geometry)
  const [previousGeometry, setPreviousGeometry] = useState<typeof geometry | null>(null)
  const status = dataPanelState({
    isLoading,
    deniedAction,
    failedAction,
    rowCount: points.length,
  })

  useEffect(() => {
    const previous = lastGeometry.current
    const changed = previous.polyline !== geometry.polyline || previous.area !== geometry.area

    if (changed) {
      setPreviousGeometry(motion.geometryAnimated && previous.hasData ? previous : null)
      lastGeometry.current = geometry
    }
  }, [geometry, motion.geometryAnimated])

  const leaveAnimation = `${leaveGeometry} ${duration.layout} ${easing.standard} forwards`

  return (
    <ReportSection>
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
            position="relative"
            // The whole chart, in a sentence. This is what a screen reader
            // reads instead of a path with 90 coordinate pairs in it.
            aria-label={trendSummary(title, points, geometry)}
          >
            {/*
              The line draws itself once, left to right, the first time the
              chart is seen: a window slides in while the chart inside it
              slides the other way by the same amount, so the chart stays put
              and is uncovered - transform only. A signal rides the drawing
              edge at the line's own height.
            */}
            <DrawnChart polyline={geometry.polyline} hasData={geometry.hasData}>
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
                    as="path"
                    data-trend-geometry="area"
                    d={pointsToPath(geometry.area, true)}
                    fill={componentTokens.reader.progressTrack}
                  />
                )}
                {previousGeometry?.area === null || previousGeometry === null ? null : (
                  <Box
                    as="path"
                    aria-hidden="true"
                    data-trend-geometry="previous-area"
                    d={pointsToPath(previousGeometry.area, true)}
                    fill={componentTokens.reader.progressTrack}
                    animation={leaveAnimation}
                    onAnimationEnd={() => setPreviousGeometry(null)}
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
                    as="path"
                    data-trend-geometry="line"
                    d={pointsToPath(geometry.polyline)}
                    fill="none"
                    stroke={componentTokens.reader.progressIndicator}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    // `preserveAspectRatio="none"` stretches the user space,
                    // which would stretch the stroke with it. This keeps the
                    // line an even weight at every container width.
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: motion.colourTransition }}
                  />
                )}
                {previousGeometry?.polyline === null || previousGeometry === null ? null : (
                  <Box
                    as="path"
                    aria-hidden="true"
                    data-trend-geometry="previous-line"
                    d={pointsToPath(previousGeometry.polyline)}
                    fill="none"
                    stroke={componentTokens.reader.progressIndicator}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    animation={leaveAnimation}
                    onAnimationEnd={() => setPreviousGeometry(null)}
                  />
                )}
              </Box>
            </DrawnChart>
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
    </ReportSection>
  )
}

interface DrawnChartProps {
  readonly polyline: string | null
  readonly hasData: boolean
  readonly children: ReactNode
}

/**
 * The line drawing itself, once, the first time the chart is seen: a window
 * slides in while the chart inside it slides the other way by the same amount,
 * so the chart stays put and is uncovered - transform only - and a signal
 * rides the drawing edge at the line's own height. A later range change uses
 * the crossfade instead. Under reduced motion it starts, and stays, drawn.
 *
 * Its own component so that it mounts with the chart: the in-view observer
 * then has an element to watch from the first effect, rather than the loading
 * panel that stood in the chart's place.
 */
function DrawnChart({ polyline, hasData, children }: DrawnChartProps) {
  const policy = useMotionPolicy()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useRevealInView(ref)
  const draw = useMotionValue(policy.reduced ? 1 : 0)
  const hasDrawn = useRef(policy.reduced)

  useEffect(() => {
    if (!inView || !hasData || hasDrawn.current) {
      return
    }

    if (policy.reduced) {
      hasDrawn.current = true
      draw.set(1)

      return
    }

    draw.set(0)
    const controls = animate(draw, 1, {
      duration: durationSeconds('reveal', policy) * 2,
      ease: standardEase,
      onComplete: () => {
        hasDrawn.current = true
      },
    })

    return () => controls.stop()
  }, [inView, hasData, policy, draw])

  const windowX = useTransform(draw, (value) => `${(value - 1) * 100}%`)
  const contentX = useTransform(draw, (value) => `${(1 - value) * 100}%`)
  const sparkX = useTransform(
    draw,
    (value) => `${((pointAlong(polyline, value)?.x ?? 0) / VIEWBOX.width) * 100}%`,
  )
  const sparkY = useTransform(
    draw,
    (value) => `${((pointAlong(polyline, value)?.y ?? 0) / VIEWBOX.height) * 100}%`,
  )
  const sparkOpacity = useTransform(draw, (value) => signalLineFrame(value).tip)

  return (
    <Box ref={ref} position="relative">
      <MotionBox overflow="hidden" style={{ x: windowX }}>
        <MotionBox style={{ x: contentX }}>{children}</MotionBox>
      </MotionBox>
      {polyline === null || policy.reduced ? null : (
        <Box
          aria-hidden="true"
          position="absolute"
          insetInlineStart={0}
          top={0}
          width="100%"
          height={space[24]}
          pointerEvents="none"
          // The carrier travels a full width to the right; clipping the x axis
          // keeps it from widening the page once it arrives, without making
          // this a scroll container.
          sx={{ overflowX: 'clip', overflowY: 'visible' }}
        >
          <MotionBox position="absolute" inset={0} style={{ x: sparkX, opacity: sparkOpacity }}>
            <MotionBox position="absolute" inset={0} style={{ y: sparkY }}>
              <Box position="absolute" top={0} left={0} width={0} height={0}>
                <SignalSpark orientation="horizontal" />
              </Box>
            </MotionBox>
          </MotionBox>
        </Box>
      )}
    </Box>
  )
}
