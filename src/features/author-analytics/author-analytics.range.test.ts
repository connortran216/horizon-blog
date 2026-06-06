import { describe, expect, it } from 'vitest'

import {
  createDefaultAnalyticsRange,
  parseAnalyticsRange,
  serializeAnalyticsRange,
} from './author-analytics.range'

describe('author analytics range helpers', () => {
  it('creates a 30-day inclusive UTC default range', () => {
    expect(createDefaultAnalyticsRange(new Date('2026-06-04T12:00:00Z'))).toEqual({
      from: '2026-05-06',
      to: '2026-06-04',
      timezone: 'UTC',
    })
  })

  it('parses valid query values and falls back when the range is invalid', () => {
    expect(
      parseAnalyticsRange(
        new URLSearchParams('from=2026-05-01&to=2026-05-31'),
        new Date('2026-06-04T12:00:00Z'),
      ),
    ).toEqual({
      from: '2026-05-01',
      to: '2026-05-31',
      timezone: 'UTC',
    })

    expect(
      parseAnalyticsRange(
        new URLSearchParams('from=2026-06-10&to=2026-06-01'),
        new Date('2026-06-04T12:00:00Z'),
      ),
    ).toEqual({
      from: '2026-05-06',
      to: '2026-06-04',
      timezone: 'UTC',
    })
  })

  it('serializes inclusive from and to query parameters', () => {
    expect(
      serializeAnalyticsRange({
        from: '2026-05-01',
        to: '2026-05-31',
        timezone: 'UTC',
      }).toString(),
    ).toBe('from=2026-05-01&to=2026-05-31')
  })
})
