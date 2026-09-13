import { describe, expect, it } from 'vitest'

import { space } from '../../../theme/tokens'
import { fullMotionPolicy, reducedMotionPolicy } from '../../motion'
import {
  activeHeadingId,
  isAfterProse,
  readerRegionIndex,
  readerRegions,
  readerSlotFor,
  readingProgress,
  readingProgressAria,
  readingProgressScale,
  readingProgressTransition,
  resolveHeadingDeepLink,
  shouldReportProgress,
  tocDisclosureLabel,
  tocIndent,
  tocItems,
  tocLinkAria,
  type ReaderHeading,
} from './reader.logic'

const headings: readonly ReaderHeading[] = [
  { id: 'one', text: 'One', depth: 2 },
  { id: 'one-a', text: 'One A', depth: 3 },
  { id: 'two', text: 'Two', depth: 2 },
]

describe('readingProgress', () => {
  it('is zero before the article has been reached', () => {
    expect(readingProgress({ contentTop: 900, contentHeight: 4000, viewportHeight: 800 })).toBe(0)
  })

  it('grows as the article scrolls past the bottom of the viewport', () => {
    const early = readingProgress({ contentTop: 0, contentHeight: 4000, viewportHeight: 800 })
    const later = readingProgress({ contentTop: -2000, contentHeight: 4000, viewportHeight: 800 })

    expect(early).toBe(20)
    expect(later).toBeGreaterThan(early)
  })

  it('reaches 100 when the last line has left the screen', () => {
    expect(readingProgress({ contentTop: -3400, contentHeight: 4000, viewportHeight: 800 })).toBe(
      100,
    )
  })

  it('is complete for an article shorter than the viewport', () => {
    expect(readingProgress({ contentTop: 100, contentHeight: 300, viewportHeight: 800 })).toBe(100)
  })

  it('never goes below zero or above a hundred', () => {
    expect(readingProgress({ contentTop: 5000, contentHeight: 4000, viewportHeight: 800 })).toBe(0)
    expect(readingProgress({ contentTop: -99999, contentHeight: 4000, viewportHeight: 800 })).toBe(
      100,
    )
  })

  it('survives an element that has not been laid out yet', () => {
    expect(readingProgress({ contentTop: 0, contentHeight: 0, viewportHeight: 800 })).toBe(0)
    expect(readingProgress({ contentTop: 0, contentHeight: Number.NaN, viewportHeight: 800 })).toBe(
      0,
    )
  })
})

describe('reading progress presentation', () => {
  it('announces the value as a progressbar', () => {
    expect(readingProgressAria(42)).toEqual({
      role: 'progressbar',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': 42,
      'aria-label': 'Reading progress',
    })
  })

  it('clamps a nonsense value before announcing it', () => {
    expect(readingProgressAria(-10)['aria-valuenow']).toBe(0)
    expect(readingProgressAria(180)['aria-valuenow']).toBe(100)
  })

  it('fills with a transform, so nothing reflows as the reader scrolls', () => {
    expect(readingProgressScale(0)).toBe(0)
    expect(readingProgressScale(50)).toBe(0.5)
    expect(readingProgressScale(140)).toBe(1)
  })

  it('keeps changing value under reduced motion but stops easing', () => {
    expect(readingProgressTransition(fullMotionPolicy)).toContain('transform')
    expect(readingProgressTransition(reducedMotionPolicy)).toBeUndefined()
  })
})

/**
 * Publishing the percentage.
 *
 * The bar used to keep its number to itself, so a page that reports reading
 * milestones to the session service ran a second scroll listener over the same
 * element - two subscriptions, two measurements, and two numbers that could
 * disagree about how far somebody had read. The bar publishes now, and this is
 * the rule that keeps the publication a report rather than a flood.
 */
describe('shouldReportProgress', () => {
  it('publishes the first measurement, including the zero an article starts at', () => {
    expect(shouldReportProgress(null, 0)).toBe(true)
  })

  it('says nothing while the reader scrolls within the same percent', () => {
    expect(shouldReportProgress(37, 37)).toBe(false)
  })

  it('publishes every change, up or down', () => {
    expect(shouldReportProgress(37, 38)).toBe(true)
    expect(shouldReportProgress(37, 36)).toBe(true)
  })

  it('publishes the last percent exactly once', () => {
    expect(shouldReportProgress(99, 100)).toBe(true)
    expect(shouldReportProgress(100, 100)).toBe(false)
  })
})

describe('tocItems', () => {
  it('normalises indentation against the shallowest heading present', () => {
    expect(tocItems(headings).map((item) => item.level)).toEqual([0, 1, 0])
  })

  it('does not indent an article whose top level is h3', () => {
    const deep: ReaderHeading[] = [
      { id: 'a', text: 'A', depth: 3 },
      { id: 'b', text: 'B', depth: 4 },
    ]

    expect(tocItems(deep).map((item) => item.level)).toEqual([0, 1])
  })

  it('marks exactly one entry active', () => {
    const active = tocItems(headings, 'two').filter((item) => item.isActive)

    expect(active).toHaveLength(1)
    expect(active[0].id).toBe('two')
  })

  it('marks nothing active when the active id is not in the list', () => {
    expect(tocItems(headings, 'gone').some((item) => item.isActive)).toBe(false)
  })

  it('builds the in-page href', () => {
    expect(tocItems(headings)[0].href).toBe('#one')
  })

  it('is empty for an article with no headings', () => {
    expect(tocItems([])).toEqual([])
  })

  it('indents from the spacing scale, never a magic pixel', () => {
    expect([tocIndent(0), tocIndent(1), tocIndent(2)]).toEqual([space[1], space[4], space[8]])
  })

  it('stops indenting past the deepest step it has', () => {
    expect(tocIndent(9)).toBe(tocIndent(2))
    expect(tocIndent(-3)).toBe(tocIndent(0))
  })

  it('marks the active entry as a location, not as a page', () => {
    expect(tocLinkAria(true)).toEqual({ 'aria-current': 'location' })
    expect(tocLinkAria(false)).toEqual({})
  })

  it('counts the entries in the disclosure summary', () => {
    expect(tocDisclosureLabel(6)).toBe('On this page (6)')
    expect(tocDisclosureLabel(0)).toBe('On this page')
  })
})

describe('activeHeadingId', () => {
  const offsets = [
    { id: 'one', top: -200 },
    { id: 'one-a', top: 100 },
    { id: 'two', top: 900 },
  ]

  it('is the last heading that has crossed the threshold', () => {
    // A 1000px viewport puts the line at 300px: "one" and "one-a" are above it.
    expect(activeHeadingId(offsets, 1000)).toBe('one-a')
  })

  it('is the first heading before any has crossed it', () => {
    expect(
      activeHeadingId(
        [
          { id: 'one', top: 800 },
          { id: 'two', top: 1600 },
        ],
        1000,
      ),
    ).toBe('one')
  })

  it('is the last heading once every one has scrolled past', () => {
    expect(
      activeHeadingId(
        offsets.map((o) => ({ ...o, top: -1000 })),
        1000,
      ),
    ).toBe('two')
  })

  it('is null for an article with no headings', () => {
    expect(activeHeadingId([], 1000)).toBeNull()
  })

  it('takes the threshold from the caller when a page needs a different one', () => {
    expect(activeHeadingId(offsets, 1000, 0.05)).toBe('one')
  })
})

describe('resolveHeadingDeepLink', () => {
  it('resolves a hash that matches a heading', () => {
    expect(resolveHeadingDeepLink('#one-a', headings)).toBe('one-a')
    expect(resolveHeadingDeepLink('one-a', headings)).toBe('one-a')
  })

  it('resolves a percent-encoded hash', () => {
    const vietnamese: ReaderHeading[] = [{ id: 'hệ-thống', text: 'Hệ thống', depth: 2 }]

    expect(resolveHeadingDeepLink('#h%E1%BB%87-th%E1%BB%91ng', vietnamese)).toBe('hệ-thống')
  })

  it('returns null for a link to a heading that no longer exists', () => {
    expect(resolveHeadingDeepLink('#section-3', headings)).toBeNull()
  })

  it('returns null when there is no hash at all', () => {
    expect(resolveHeadingDeepLink(undefined, headings)).toBeNull()
    expect(resolveHeadingDeepLink('#', headings)).toBeNull()
    expect(resolveHeadingDeepLink('   ', headings)).toBeNull()
  })

  it('does not throw on a malformed escape sequence', () => {
    expect(resolveHeadingDeepLink('#%E0%A4%A', headings)).toBeNull()
  })
})

/** dsv2.5.3 acceptance 3: reader feedback stays out of the opening metadata. */
describe('where the reader’s parts go', () => {
  it('puts reactions and sharing in the feedback region', () => {
    expect(readerSlotFor('reactions')).toBe('feedback')
    expect(readerSlotFor('share')).toBe('feedback')
  })

  it('never puts feedback in the opening metadata', () => {
    for (const element of ['reactions', 'share'] as const) {
      expect(readerSlotFor(element)).not.toBe('metadata')
      expect(readerSlotFor(element)).not.toBe('identity')
    }
  })

  it('puts feedback after the prose, so a reader has read something first', () => {
    expect(isAfterProse(readerSlotFor('reactions'))).toBe(true)
    expect(isAfterProse(readerSlotFor('share'))).toBe(true)
    expect(isAfterProse(readerSlotFor('comments'))).toBe(true)
  })

  it('keeps the opening metadata before the prose', () => {
    expect(readerRegionIndex('metadata')).toBeLessThan(readerRegionIndex('prose'))
    expect(isAfterProse('metadata')).toBe(false)
  })

  it('keeps navigation with the prose it navigates', () => {
    expect(readerSlotFor('toc')).toBe('prose')
    expect(readerSlotFor('progress')).toBe('prose')
  })

  it('lists the regions in the order the design contract puts them', () => {
    expect(readerRegions).toEqual([
      'identity',
      'metadata',
      'cover',
      'prose',
      'seriesContext',
      'feedback',
      'discussion',
      'related',
    ])
  })
})
