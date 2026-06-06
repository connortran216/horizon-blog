import { describe, expect, it } from 'vitest'

import {
  formatAnalyticsDuration,
  formatAnalyticsInteger,
  formatAnalyticsPercent,
  formatApproximateReaders,
} from './author-analytics.format'

describe('author analytics format helpers', () => {
  it('formats backend numeric ratios without changing their value semantics', () => {
    expect(formatAnalyticsPercent(0.423)).toBe('42.3%')
    expect(formatAnalyticsPercent(0)).toBe('0%')
  })

  it('formats integer counts and active read duration', () => {
    expect(formatAnalyticsInteger(1200)).toBe('1,200')
    expect(formatAnalyticsDuration(286)).toBe('4m 46s')
    expect(formatAnalyticsDuration(42)).toBe('42s')
  })

  it('labels approximate unique readers without changing the count', () => {
    expect(formatApproximateReaders(830, true)).toEqual({
      value: '~830',
      label: 'Approx. unique readers',
      isApproximate: true,
    })
    expect(formatApproximateReaders(830, false)).toEqual({
      value: '830',
      label: 'Unique readers',
      isApproximate: false,
    })
  })
})
