import { describe, expect, it } from 'vitest'

import {
  formatAnalyticsDuration,
  formatAnalyticsInteger,
  formatAnalyticsPercent,
  formatApproximateReaders,
  formatEvidenceMetric,
  formatEvidenceMetricValue,
  formatFreshThrough,
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

  it('does not print a whole percentage with a stray decimal', () => {
    // 0.58 * 100 is 58.00000000000001 in floating point.
    expect(formatAnalyticsPercent(0.58)).toBe('58%')
    expect(formatAnalyticsPercent(0.5595)).toBe('56%')
    expect(formatAnalyticsPercent(0.0905)).toBe('9.1%')
  })

  it('names evidence metrics the way an author reads them', () => {
    expect(formatEvidenceMetric('completion_rate')).toBe('Completion')
    expect(formatEvidenceMetric('avg_active_read_seconds')).toBe('Active read')
    expect(formatEvidenceMetric('scroll_depth_max')).toBe('Scroll depth max')
  })

  it('formats evidence values in their own unit', () => {
    expect(formatEvidenceMetricValue('completion_rate', 0.62)).toBe('62%')
    expect(formatEvidenceMetricValue('avg_active_read_seconds', 344)).toBe('5m 44s')
    expect(formatEvidenceMetricValue('views', 1460)).toBe('1,460')
  })

  it('states freshness as a readable UTC time', () => {
    expect(formatFreshThrough('2026-09-25T04:09:19.573Z')).toBe('Sep 25, 2026, 04:09 UTC')
    expect(formatFreshThrough('not a date')).toBe('not a date')
  })
})
