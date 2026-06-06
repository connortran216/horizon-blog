import { describe, expect, it } from 'vitest'

import {
  buildTrendPolyline,
  createAnalyticsRangePreset,
  getAnalyticsErrorCopy,
  normalizeFunnelStages,
} from './author-analytics.visualization'

describe('author analytics visualization helpers', () => {
  it('builds a bounded SVG polyline from trend values', () => {
    expect(
      buildTrendPolyline(
        [
          { date: '2026-06-01', value: 0 },
          { date: '2026-06-02', value: 50 },
          { date: '2026-06-03', value: 100 },
        ],
        { width: 100, height: 40 },
      ),
    ).toBe('0,40 50,20 100,0')
  })

  it('keeps single-point and flat trends readable', () => {
    expect(
      buildTrendPolyline([{ date: '2026-06-01', value: 10 }], { width: 100, height: 40 }),
    ).toBe('0,20 100,20')
    expect(
      buildTrendPolyline(
        [
          { date: '2026-06-01', value: 5 },
          { date: '2026-06-02', value: 5 },
        ],
        { width: 100, height: 40 },
      ),
    ).toBe('0,20 100,20')
  })

  it('normalizes funnel stages for accessible bar widths', () => {
    expect(
      normalizeFunnelStages([
        { stage: 'opened', sessions: 100, rate: 1 },
        { stage: 'completed', sessions: 25, rate: 0.25 },
      ]),
    ).toEqual([
      { label: 'Opened', sessions: 100, rate: 1, widthPercent: 100 },
      { label: 'Completed', sessions: 25, rate: 0.25, widthPercent: 25 },
    ])
  })

  it('creates inclusive UTC presets ending at the provided date', () => {
    expect(createAnalyticsRangePreset('7d', new Date('2026-06-04T12:00:00Z'))).toEqual({
      from: '2026-05-29',
      to: '2026-06-04',
      timezone: 'UTC',
    })
    expect(createAnalyticsRangePreset('90d', new Date('2026-06-04T12:00:00Z'))).toEqual({
      from: '2026-03-07',
      to: '2026-06-04',
      timezone: 'UTC',
    })
  })

  it('returns actionable copy for protected analytics error states', () => {
    expect(
      getAnalyticsErrorCopy({ kind: 'unauthorized', message: 'Unauthorized', statusCode: 401 }),
    ).toMatchInlineSnapshot(`
        {
          "description": "Sign in again to view analytics for your writing.",
          "title": "Your session needs attention",
        }
      `)

    expect(getAnalyticsErrorCopy({ kind: 'service_unavailable', message: 'Down', statusCode: 503 }))
      .toMatchInlineSnapshot(`
        {
          "description": "Analytics data is temporarily unavailable. Your blogs are still safe.",
          "title": "Analytics is catching up",
        }
      `)
  })
})
