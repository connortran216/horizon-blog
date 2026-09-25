import { describe, expect, it } from 'vitest'

import { fullMotionPolicy, reducedMotionPolicy } from '../../motion'
import {
  breakdownRows,
  chartMotion,
  funnelRows,
  trendGeometry,
  trendSummary,
  type TrendPoint,
  pointAlong,
} from './chart.logic'

const bounds = { width: 320, height: 120 }

describe('trend geometry', () => {
  it('plots a series across the full width', () => {
    const points: TrendPoint[] = [
      { label: 'a', value: 0 },
      { label: 'b', value: 10 },
      { label: 'c', value: 20 },
    ]
    const geometry = trendGeometry(points, bounds)

    expect(geometry.polyline).toBe('0,120 160,60 320,0')
    expect(geometry.min).toBe(0)
    expect(geometry.max).toBe(20)
    expect(geometry.isFlat).toBe(false)
  })

  it('draws a single point flat rather than dividing by zero', () => {
    const geometry = trendGeometry([{ label: 'a', value: 42 }], bounds)

    expect(geometry.isFlat).toBe(true)
    expect(geometry.polyline).toBe('0,60 320,60')
    expect(geometry.hasData).toBe(true)
  })

  it('draws an unchanging series flat rather than as NaN', () => {
    // max === min, so normalising by (max - min) would be a division by zero.
    const points = Array.from({ length: 7 }, (_u, index) => ({ label: `d${index}`, value: 12 }))
    const geometry = trendGeometry(points, bounds)

    expect(geometry.isFlat).toBe(true)
    expect(geometry.polyline).not.toContain('NaN')
  })

  it('reports no data for an empty series instead of drawing a line', () => {
    const geometry = trendGeometry([], bounds)

    expect(geometry.hasData).toBe(false)
    expect(geometry.polyline).toBeNull()
    expect(geometry.area).toBeNull()
    expect(geometry.latest).toBeNull()
  })

  it('clamps a negative value rather than inverting the axis', () => {
    const geometry = trendGeometry(
      [
        { label: 'a', value: -5 },
        { label: 'b', value: 10 },
      ],
      bounds,
    )

    expect(geometry.min).toBe(0)
    expect(geometry.polyline).toBe('0,120 320,0')
  })

  it('closes the area on the baseline, not back through the data', () => {
    const geometry = trendGeometry(
      [
        { label: 'a', value: 0 },
        { label: 'b', value: 20 },
      ],
      bounds,
    )

    expect(geometry.area?.endsWith('320,120 0,120')).toBe(true)
  })

  it('keeps the last point for the readout beside the chart', () => {
    const geometry = trendGeometry(
      [
        { label: 'a', value: 1 },
        { label: 'b', value: 9 },
      ],
      bounds,
    )

    expect(geometry.latest).toEqual({ label: 'b', value: 9 })
  })
})

describe('trend summary', () => {
  it('describes an empty series honestly', () => {
    expect(trendSummary('Views', [], trendGeometry([], bounds))).toContain('no data')
  })

  it('says a flat series is flat rather than reporting a range of zero', () => {
    const points = [
      { label: 'a', value: 12 },
      { label: 'b', value: 12 },
    ]

    expect(trendSummary('Views', points, trendGeometry(points, bounds))).toContain('flat at 12')
  })

  it('names the span, the range and where it ended', () => {
    const points = [
      { label: '2026-03-01', value: 4 },
      { label: '2026-03-02', value: 18 },
      { label: '2026-03-03', value: 11 },
    ]
    const summary = trendSummary('Views', points, trendGeometry(points, bounds))

    expect(summary).toContain('2026-03-01')
    expect(summary).toContain('2026-03-03')
    expect(summary).toContain('between 4 and 18')
    expect(summary).toContain('ending at 11')
  })
})

/**
 * The confirmed geometry remains independent from motion policy. Policy only
 * controls whether the browser interpolates between two confirmed shapes.
 */
describe('chart motion', () => {
  it('interpolates confirmed geometry only when motion is allowed', () => {
    expect(chartMotion(fullMotionPolicy).geometryAnimated).toBe(true)
    expect(chartMotion(reducedMotionPolicy).geometryAnimated).toBe(false)
    expect(chartMotion(fullMotionPolicy).geometryTransition.duration).toBeGreaterThan(0)
    expect(chartMotion(reducedMotionPolicy).geometryTransition.duration).toBe(0)
  })

  it('produces identical geometry regardless of the motion preference', () => {
    // The geometry function takes no policy at all, so this holds by
    // construction; the assertion is here so a future signature change breaks
    // a test rather than a promise.
    const points = [
      { label: 'a', value: 3 },
      { label: 'b', value: 8 },
    ]

    expect(trendGeometry(points, bounds)).toEqual(trendGeometry(points, bounds))
  })
})

describe('funnel rows', () => {
  const stages = [
    { label: 'Opened', sessions: 100, rate: 1 },
    { label: 'Half', sessions: 60, rate: 0.6 },
    { label: 'Finished', sessions: 45, rate: 0.45 },
  ]

  it('sizes each bar against the widest stage', () => {
    expect(funnelRows(stages).map((row) => row.widthPercent)).toEqual([100, 60, 45])
  })

  it('computes the drop the author actually wants', () => {
    expect(funnelRows(stages).map((row) => row.droppedFromPrevious)).toEqual([null, 40, 15])
  })

  it('gives the first stage no drop, because there is nothing before it', () => {
    expect(funnelRows(stages)[0].droppedFromPrevious).toBeNull()
  })

  it('produces zero-width bars rather than NaN when nobody opened the post', () => {
    const empty = funnelRows(stages.map((stage) => ({ ...stage, sessions: 0, rate: 0 })))

    expect(empty.every((row) => row.widthPercent === 0)).toBe(true)
  })

  it('handles a funnel that grows, without a negative width', () => {
    const grown = funnelRows([
      { label: 'a', sessions: 10, rate: 0.5 },
      { label: 'b', sessions: 20, rate: 1 },
    ])

    expect(grown[0].widthPercent).toBe(50)
    expect(grown[1].droppedFromPrevious).toBe(-10)
  })
})

describe('breakdown rows', () => {
  const items = [
    { label: 'Direct', value: 50 },
    { label: 'Search', value: 30 },
    { label: 'Social', value: 20 },
  ]

  it('orders by size, largest first', () => {
    const result = breakdownRows([
      { label: 'a', value: 1 },
      { label: 'b', value: 9 },
    ])

    expect(result.rows.map((row) => row.label)).toEqual(['b', 'a'])
  })

  it('reports shares of the total', () => {
    expect(breakdownRows(items).rows.map((row) => row.sharePercent)).toEqual([50, 30, 20])
  })

  it('scales bars against the largest row so small shares stay legible', () => {
    const result = breakdownRows([
      { label: 'a', value: 3 },
      { label: 'b', value: 2 },
    ])

    expect(result.rows.map((row) => row.widthPercent)).toEqual([100, 67])
  })

  it('folds a long tail into one labelled row', () => {
    const many = Array.from({ length: 8 }, (_u, index) => ({
      label: `s${index}`,
      value: 10 - index,
    }))
    const result = breakdownRows(many, { maxRows: 3 })

    expect(result.rows).toHaveLength(4)
    expect(result.rows[3].label).toBe('Other')
    expect(result.hiddenCount).toBe(5)
  })

  it('keeps the folded shares in the arithmetic, so the visible ones still total 100', () => {
    const many = Array.from({ length: 6 }, () => ({ label: 'x', value: 10 }))
    const result = breakdownRows(
      many.map((item, index) => ({ ...item, label: `s${index}` })),
      { maxRows: 3 },
    )
    const total = result.rows.reduce((sum, row) => sum + row.sharePercent, 0)

    expect(Math.round(total)).toBe(100)
  })

  it('reports no data when every value is zero', () => {
    const result = breakdownRows([
      { label: 'a', value: 0 },
      { label: 'b', value: 0 },
    ])

    expect(result.hasData).toBe(false)
    expect(result.rows).toHaveLength(0)
  })

  it('reports no data for an empty list', () => {
    expect(breakdownRows([]).hasData).toBe(false)
  })

  it('does not fold when the list is already short enough', () => {
    expect(breakdownRows(items, { maxRows: 5 }).hiddenCount).toBe(0)
  })
})

describe('pointAlong', () => {
  const line = '0,100 100,0 200,50'

  it('starts at the first point and ends at the last', () => {
    expect(pointAlong(line, 0)).toEqual({ x: 0, y: 100 })
    expect(pointAlong(line, 1)).toEqual({ x: 200, y: 50 })
  })

  it('interpolates inside the segment that spans the fraction', () => {
    expect(pointAlong(line, 0.25)).toEqual({ x: 50, y: 50 })
    expect(pointAlong(line, 0.75)).toEqual({ x: 150, y: 25 })
  })

  it('clamps a stray fraction and has no point without a line', () => {
    expect(pointAlong(line, 2)).toEqual({ x: 200, y: 50 })
    expect(pointAlong(null, 0.5)).toBeNull()
  })
})
