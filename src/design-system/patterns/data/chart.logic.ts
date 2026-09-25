/**
 * Horizon Design System v2 - chart geometry.
 *
 * There is no charting library in this repo and this bundle does not add one.
 * Every chart in the system is inline SVG built from these functions plus
 * tokens, which is enough for the three shapes the product actually has: a
 * trend line, a funnel, and a share breakdown.
 *
 * Geometry is always computed from the final confirmed dataset. A later range
 * change may crossfade the previous SVG presentation over its final geometry, but
 * the summary and table receive the final values immediately. Reduced motion
 * collapses that transition to zero duration.
 *
 * Every chart also emits a text summary and, where it makes sense, real rows.
 * An SVG polyline is not readable by a screen reader, and "readable without
 * animation" is a weaker promise than "readable without sight".
 */

import { transitionFor } from '../../../theme/tokens'
import {
  transitionFor as motionTransitionFor,
  type MotionPolicy,
  type MotionTransition,
} from '../../motion'

/* -------------------------------------------------------------------------- */
/* Trend                                                                      */
/* -------------------------------------------------------------------------- */

export interface TrendPoint {
  /** `YYYY-MM-DD`, or any label the caller wants on the axis. */
  readonly label: string
  readonly value: number
}

export interface TrendBounds {
  readonly width: number
  readonly height: number
}

export interface TrendGeometry {
  /** `x,y x,y ...` for a `polyline`, or `null` when there is nothing to draw. */
  readonly polyline: string | null
  /** The same path closed to the baseline, for the area fill. */
  readonly area: string | null
  readonly min: number
  readonly max: number
  /** Every value is the same. The line is drawn flat, through the middle. */
  readonly isFlat: boolean
  readonly hasData: boolean
  /** The last point, for the "latest" readout beside the chart. */
  readonly latest: TrendPoint | null
}

const round = (value: number) => Number(value.toFixed(2))

/**
 * Points to a polyline.
 *
 * Two cases that a naive implementation gets wrong and that real analytics data
 * hits immediately:
 *
 * - A single point has no span to interpolate across, so it is drawn as a flat
 *   line through the middle rather than as a division by zero.
 * - A series where every value is equal - a post with two views on each of
 *   seven days - has `max === min`. Normalising by `max - min` would produce
 *   `NaN`; it is drawn flat instead, which is what the data says.
 *
 * Negative values are clamped to zero. None of these metrics can be negative,
 * and a stray negative from a bad aggregation should not invert the axis.
 */
export function trendGeometry(
  points: readonly TrendPoint[],
  { width, height }: TrendBounds,
): TrendGeometry {
  if (points.length === 0) {
    return {
      polyline: null,
      area: null,
      min: 0,
      max: 0,
      isFlat: true,
      hasData: false,
      latest: null,
    }
  }

  const values = points.map((point) => Math.max(0, point.value))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const latest = points[points.length - 1]
  const midline = round(height / 2)

  if (points.length === 1 || min === max) {
    const flat = `0,${midline} ${width},${midline}`

    return {
      polyline: flat,
      area: `${flat} ${width},${height} 0,${height}`,
      min,
      max,
      isFlat: true,
      hasData: true,
      latest,
    }
  }

  const coordinates = points.map((point, index) => {
    const x = round((index / (points.length - 1)) * width)
    const normalized = (Math.max(0, point.value) - min) / (max - min)

    return `${x},${round(height - normalized * height)}`
  })

  const polyline = coordinates.join(' ')

  return {
    polyline,
    // The fill is the line plus the two bottom corners, so it closes on the
    // baseline rather than back through the data.
    area: `${polyline} ${width},${height} 0,${height}`,
    min,
    max,
    isFlat: false,
    hasData: true,
    latest,
  }
}

/**
 * What a screen reader is told instead of the drawing.
 *
 * It names the metric, the span, the range and the endpoints. Reading out every
 * point is unusable past about ten of them, and the accompanying table - which
 * `Trend` renders in a disclosure - is where the full series lives.
 */
export function trendSummary(
  metricLabel: string,
  points: readonly TrendPoint[],
  geometry: TrendGeometry,
): string {
  if (!geometry.hasData) {
    return `${metricLabel}: no data in this range.`
  }

  const first = points[0]
  const last = points[points.length - 1]

  if (geometry.isFlat) {
    return `${metricLabel}: flat at ${geometry.max} across ${points.length} ${
      points.length === 1 ? 'day' : 'days'
    }.`
  }

  return `${metricLabel}: ${points.length} days from ${first.label} to ${last.label}, between ${geometry.min} and ${geometry.max}, ending at ${last.value}.`
}

/* -------------------------------------------------------------------------- */
/* Funnel                                                                     */
/* -------------------------------------------------------------------------- */

export interface FunnelStage {
  readonly label: string
  readonly sessions: number
  /** Share of the widest stage, as the backend computed it. */
  readonly rate: number
}

export interface FunnelRow extends FunnelStage {
  /** Bar width as a percentage of the widest stage. */
  readonly widthPercent: number
  /** How many were lost between the previous stage and this one. */
  readonly droppedFromPrevious: number | null
}

/**
 * Funnel stages, sized against the widest one.
 *
 * The drop from the previous stage is computed here rather than left to the
 * eye. "91% reached a quarter, 83% reached half" is two numbers a reader has to
 * subtract; "8 readers stopped here" is the thing they wanted to know.
 *
 * With no sessions at all every bar is zero width, and the caller shows the
 * zero-sample state instead - see `assessSample`.
 */
export function funnelRows(stages: readonly FunnelStage[]): readonly FunnelRow[] {
  const widest = Math.max(0, ...stages.map((stage) => stage.sessions))

  return stages.map((stage, index) => ({
    ...stage,
    widthPercent: widest === 0 ? 0 : Math.round((stage.sessions / widest) * 100),
    droppedFromPrevious: index === 0 ? null : stages[index - 1].sessions - stage.sessions,
  }))
}

/* -------------------------------------------------------------------------- */
/* Breakdown                                                                  */
/* -------------------------------------------------------------------------- */

export interface BreakdownItem {
  readonly label: string
  readonly value: number
  /** A second line under the label - a host, a category. */
  readonly detail?: string
}

export interface BreakdownRow extends BreakdownItem {
  readonly sharePercent: number
  readonly widthPercent: number
}

export interface BreakdownResult {
  readonly rows: readonly BreakdownRow[]
  readonly total: number
  readonly hasData: boolean
  /** Rows folded into "Other", when the caller capped the list. */
  readonly hiddenCount: number
}

export interface BreakdownOptions {
  /** Show at most this many rows and fold the rest. Zero shows all of them. */
  readonly maxRows?: number
  readonly otherLabel?: string
}

/**
 * Shares of a total, largest first, with a tail.
 *
 * The tail matters. A traffic breakdown with forty referrers is a scroll rather
 * than a chart, and dropping the small ones silently makes the visible shares
 * add up to less than the total the reader was shown elsewhere. Folding them
 * into one labelled row keeps the arithmetic honest.
 *
 * Shares are of the true total, including the folded rows, so "Other 6%" means
 * six per cent of everything.
 */
export function breakdownRows(
  items: readonly BreakdownItem[],
  { maxRows = 0, otherLabel = 'Other' }: BreakdownOptions = {},
): BreakdownResult {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0)

  if (items.length === 0 || total === 0) {
    return { rows: [], total, hasData: false, hiddenCount: 0 }
  }

  const sorted = [...items].sort((left, right) => right.value - left.value)
  const shown = maxRows > 0 && sorted.length > maxRows ? sorted.slice(0, maxRows) : sorted
  const hidden = sorted.slice(shown.length)
  const largest = Math.max(...shown.map((item) => Math.max(0, item.value)))

  const toRow = (item: BreakdownItem): BreakdownRow => ({
    ...item,
    sharePercent: Math.round((Math.max(0, item.value) / total) * 1000) / 10,
    // Bars are scaled against the largest row, not against the total, so a
    // breakdown of small even shares is still legible.
    widthPercent: largest === 0 ? 0 : Math.round((Math.max(0, item.value) / largest) * 100),
  })

  const rows = shown.map(toRow)

  if (hidden.length === 0) {
    return { rows, total, hasData: true, hiddenCount: 0 }
  }

  const hiddenTotal = hidden.reduce((sum, item) => sum + Math.max(0, item.value), 0)

  return {
    rows: [
      ...rows,
      toRow({
        label: otherLabel,
        value: hiddenTotal,
        detail: `${hidden.length} more`,
      }),
    ],
    total,
    hasData: true,
    hiddenCount: hidden.length,
  }
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                     */
/* -------------------------------------------------------------------------- */

export interface ChartMotion {
  /** Successful dataset changes crossfade only when motion is allowed. */
  readonly geometryAnimated: boolean
  readonly geometryTransition: MotionTransition
  readonly colourTransition: string
}

/**
 * The chart's motion budget: crossfade only between confirmed geometries.
 * It never invents data and never delays the text/table representation.
 */
export function chartMotion(policy: MotionPolicy): ChartMotion {
  return {
    geometryAnimated: policy.layoutProjection,
    geometryTransition: motionTransitionFor('layout', policy),
    colourTransition: transitionFor('stroke', 'fast'),
  }
}

/* -------------------------------------------------------------------------- */
/* Drawing the line                                                           */
/* -------------------------------------------------------------------------- */

export interface ChartPoint {
  readonly x: number
  readonly y: number
}

/**
 * Where the line is at a fraction of its width, in the chart's own units - the
 * point the drawing signal sits on while the trend draws itself left to right.
 * The polyline's x only ever increases, so the answer is a straight
 * interpolation inside the segment that spans that x. `null` with no line.
 */
export function pointAlong(polyline: string | null, fraction: number): ChartPoint | null {
  if (polyline === null || polyline.trim() === '') {
    return null
  }

  const points = polyline
    .trim()
    .split(/\s+/u)
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number)

      return { x, y }
    })

  const first = points[0]
  const last = points[points.length - 1]
  const clamped = Math.min(1, Math.max(0, fraction))
  const targetX = first.x + (last.x - first.x) * clamped

  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1]
    const b = points[index]

    if (targetX <= b.x) {
      const span = b.x - a.x
      const t = span === 0 ? 0 : (targetX - a.x) / span

      return { x: targetX, y: a.y + (b.y - a.y) * t }
    }
  }

  return { x: last.x, y: last.y }
}
