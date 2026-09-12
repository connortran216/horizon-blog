import { describe, expect, it } from 'vitest'

import {
  assessCoverage,
  assessSample,
  dataPanelState,
  formatDuration,
  formatPercent,
  metricValue,
} from './metric.logic'

/**
 * `horizon-blog-dsv2.6.3` acceptance 1: approximate metrics are labelled.
 *
 * The structural guarantee is that `metricValue` returns the marker with the
 * display string, so a component cannot render one without the other being in
 * the value it was handed. That a given component actually paints both is a
 * render question, and it is on the B6 gallery's state matrix.
 */
describe('approximate metrics', () => {
  it('marks an estimate in every channel it has', () => {
    const result = metricValue({ value: 903, isApproximate: true })

    expect(result.display).toBe('~903')
    expect(result.marker).toBe('Approx.')
    expect(result.spokenSuffix).toBe('approximate')
    expect(result.isApproximate).toBe(true)
  })

  it('says nothing extra about an exact figure', () => {
    const result = metricValue({ value: 903 })

    expect(result.display).toBe('903')
    expect(result.marker).toBeNull()
    expect(result.spokenSuffix).toBeNull()
  })

  it('carries a spoken suffix, because the tilde is silent', () => {
    // A screen reader reads "~903" as "903". The word is what stops an
    // estimate being heard as an exact count.
    expect(metricValue({ value: 1, isApproximate: true }).spokenSuffix).toBe('approximate')
  })

  it('never produces a marked display without a marker', () => {
    for (const isApproximate of [true, false]) {
      const result = metricValue({ value: 12, isApproximate })

      expect(result.display.startsWith('~')).toBe(result.marker !== null)
    }
  })

  it('keeps the bare number available for a cell with its own marker', () => {
    expect(metricValue({ value: 903, isApproximate: true }).bare).toBe('903')
  })

  it('marks an approximate percentage and duration too', () => {
    expect(metricValue({ value: 0.68, kind: 'percent', isApproximate: true }).display).toBe('~68%')
    expect(metricValue({ value: 95, kind: 'duration', isApproximate: true }).display).toBe(
      '~1m 35s',
    )
  })
})

describe('metric formatting', () => {
  it('groups large counts', () => {
    expect(metricValue({ value: 1284, locale: 'en-US' }).display).toBe('1,284')
  })

  it('drops a pointless decimal place', () => {
    expect(formatPercent(0.68)).toBe('68%')
  })

  it('keeps a decimal place that carries information', () => {
    expect(formatPercent(0.684)).toBe('68.4%')
  })

  it('handles the ends of the percentage range', () => {
    expect(formatPercent(0)).toBe('0%')
    expect(formatPercent(1)).toBe('100%')
  })

  it('reads durations as minutes and seconds', () => {
    expect(formatDuration(45)).toBe('45s')
    expect(formatDuration(95)).toBe('1m 35s')
    expect(formatDuration(120)).toBe('2m')
  })

  it('clamps a negative duration rather than printing it', () => {
    expect(formatDuration(-10)).toBe('0s')
  })
})

describe('sample quality', () => {
  it('refuses to draw a rate from zero samples', () => {
    const sample = assessSample({ sampleSize: 0 })

    expect(sample.quality).toBe('none')
    expect(sample.showsRate).toBe(false)
    expect(sample.caveat).toContain('No reading sessions')
  })

  it('shows a thin sample with a caveat rather than hiding it', () => {
    const sample = assessSample({ sampleSize: 11, minimumSample: 30 })

    expect(sample.quality).toBe('thin')
    expect(sample.showsRate).toBe(true)
    expect(sample.caveat).toContain('11 sessions')
    expect(sample.caveat).toContain('not a finding')
  })

  it('gets the singular right, because "1 sessions" reads as a bug', () => {
    expect(assessSample({ sampleSize: 1 }).caveat).toContain('1 session.')
  })

  it('says nothing once the sample carries itself', () => {
    const sample = assessSample({ sampleSize: 412, minimumSample: 30 })

    expect(sample.quality).toBe('sufficient')
    expect(sample.caveat).toBeNull()
  })

  it('treats the threshold itself as sufficient', () => {
    expect(assessSample({ sampleSize: 30, minimumSample: 30 }).quality).toBe('sufficient')
  })

  it('takes the minimum from the caller rather than assuming one per metric', () => {
    expect(assessSample({ sampleSize: 40, minimumSample: 100 }).quality).toBe('thin')
  })
})

describe('coverage', () => {
  it('is complete when the pipeline has caught up with the range', () => {
    const coverage = assessCoverage({ freshThrough: '2026-03-30', rangeEnd: '2026-03-30' })

    expect(coverage.isPartial).toBe(false)
    expect(coverage.notice).toBeNull()
  })

  it('is complete when the pipeline is ahead of the range', () => {
    expect(assessCoverage({ freshThrough: '2026-04-02', rangeEnd: '2026-03-30' }).isPartial).toBe(
      false,
    )
  })

  it('says so when the last days of the range are still processing', () => {
    const coverage = assessCoverage({ freshThrough: '2026-03-28', rangeEnd: '2026-03-30' })

    expect(coverage.isPartial).toBe(true)
    expect(coverage.notice).toContain('2026-03-28')
  })

  it('stays quiet when it does not know', () => {
    expect(assessCoverage({ rangeEnd: '2026-03-30' }).isPartial).toBe(false)
    expect(assessCoverage({ freshThrough: '2026-03-28' }).isPartial).toBe(false)
  })
})

describe('data panel state', () => {
  it('is ready with rows', () => {
    expect(dataPanelState({ rowCount: 4 })).toBe('ready')
  })

  it('treats no rows as empty rather than as a failure', () => {
    expect(dataPanelState({ rowCount: 0 })).toBe('empty')
  })

  it('puts denial above everything, because it is not about the data', () => {
    expect(
      dataPanelState({
        deniedAction: 'view these analytics',
        failedAction: 'load them',
        isLoading: true,
        rowCount: 4,
      }),
    ).toBe('denied')
  })

  it('keeps a failure visible while a retry is in flight', () => {
    // Flickering back to a spinner reads as if this attempt might work, which
    // is a promise the previous failure did not earn.
    expect(dataPanelState({ failedAction: 'load them', isLoading: true })).toBe('error')
  })

  it('is loading before anything has arrived', () => {
    expect(dataPanelState({ isLoading: true })).toBe('loading')
  })
})
