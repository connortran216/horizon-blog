import { describe, expect, it } from 'vitest'

import { radii, semanticColors } from '../../../theme/tokens'
import { fullMotionPolicy, reducedMotionPolicy } from '../../motion'
import {
  RAIL_PEEK_FRACTION,
  appendRailItems,
  railItemBasis,
  railItemBasisResponsive,
  railKeyboardAction,
  railKeyboardTarget,
  railLoadStatus,
  railOverlayControlStyle,
  railPosition,
  railRangeDisplay,
  railScrollBehavior,
  railScrollStep,
  railScrollTarget,
  shouldRequestMore,
  type RailMeasurements,
} from './rail.logic'

const measurements = (overrides: Partial<RailMeasurements> = {}): RailMeasurements => ({
  scrollLeft: 0,
  scrollWidth: 2400,
  clientWidth: 800,
  itemCount: 8,
  ...overrides,
})

describe('peek', () => {
  it('leaves part of the next item visible at every item count', () => {
    for (const visible of [1, 2, 3, 4]) {
      const basis = Number.parseFloat(railItemBasis(visible))

      expect(basis * visible).toBeLessThan(100)
      expect(basis * visible).toBeCloseTo((1 - RAIL_PEEK_FRACTION) * 100, 1)
    }
  })

  it('never returns a zero-width item, whatever it is handed', () => {
    expect(Number.parseFloat(railItemBasis(0))).toBeGreaterThan(0)
    expect(Number.parseFloat(railItemBasis(-3))).toBeGreaterThan(0)
  })

  it('builds a responsive basis in the shape Chakra takes', () => {
    expect(railItemBasisResponsive({ base: 1, sm: 2, md: 3 })).toEqual({
      base: railItemBasis(1),
      sm: railItemBasis(2),
      md: railItemBasis(3),
    })
  })

  it('omits the breakpoints the caller did not name', () => {
    expect(Object.keys(railItemBasisResponsive({ base: 1 }))).toEqual(['base'])
  })
})

describe('railPosition', () => {
  it('knows it is at the start', () => {
    const position = railPosition(measurements())

    expect(position.atStart).toBe(true)
    expect(position.canScrollPrevious).toBe(false)
    expect(position.canScrollNext).toBe(true)
  })

  it('knows it is at the end, allowing for fractional scroll offsets', () => {
    const position = railPosition(measurements({ scrollLeft: 1599.6 }))

    expect(position.atEnd).toBe(true)
    expect(position.canScrollNext).toBe(false)
    expect(position.canScrollPrevious).toBe(true)
  })

  it('reports both arrows dead on a rail with nothing to scroll', () => {
    const position = railPosition(measurements({ scrollWidth: 800, itemCount: 2 }))

    expect(position.canScrollPrevious).toBe(false)
    expect(position.canScrollNext).toBe(false)
  })

  it('survives an empty rail', () => {
    const position = railPosition(measurements({ itemCount: 0, scrollWidth: 0 }))

    expect(position).toMatchObject({ activeIndex: 0, itemCount: 0, canScrollNext: false })
  })

  it('follows the strip when working out which item is active', () => {
    // Eight items across 2400px is 300px each; 900px in is the fourth.
    expect(railPosition(measurements({ scrollLeft: 900 })).activeIndex).toBe(3)
  })

  it('clamps a nonsense scroll offset to the ends of the strip', () => {
    // 2400px of strip in an 800px window means the furthest the rail can be
    // scrolled is 1600px, which puts the sixth of eight items at the left edge.
    expect(railPosition(measurements({ scrollLeft: 99999 })).activeIndex).toBe(5)
    expect(railPosition(measurements({ scrollLeft: -50 })).activeIndex).toBe(0)
  })

  it('never reports an index past the end of the list', () => {
    for (const scrollLeft of [-1000, 0, 700, 1600, 99999]) {
      const position = railPosition(measurements({ scrollLeft }))

      expect(position.activeIndex).toBeGreaterThanOrEqual(0)
      expect(position.activeIndex).toBeLessThan(position.itemCount)
    }
  })
})

describe('paging', () => {
  it('moves a little less than a viewport, so the reader keeps their place', () => {
    expect(railScrollStep(800)).toBeLessThan(800)
    expect(railScrollStep(800)).toBeGreaterThan(800 * 0.5)
  })

  it('stops at both ends rather than scrolling past them', () => {
    expect(railScrollTarget('previous', measurements({ scrollLeft: 100 }))).toBe(0)
    expect(railScrollTarget('next', measurements({ scrollLeft: 1500 }))).toBe(1600)
  })

  it('never asks for a negative offset', () => {
    expect(railScrollTarget('previous', measurements())).toBe(0)
  })
})

describe('keyboard', () => {
  it('pages with the arrows and jumps with Home and End', () => {
    expect(railKeyboardAction('ArrowLeft')).toBe('previous')
    expect(railKeyboardAction('ArrowRight')).toBe('next')
    expect(railKeyboardAction('Home')).toBe('first')
    expect(railKeyboardAction('End')).toBe('last')
  })

  it('ignores every other key', () => {
    expect(railKeyboardAction('Enter')).toBeNull()
    expect(railKeyboardAction('a')).toBeNull()
    expect(railKeyboardAction('ArrowUp')).toBeNull()
  })

  it('leaves modified keys to the browser and the reader', () => {
    expect(railKeyboardAction('Home', { shiftKey: true })).toBeNull()
    expect(railKeyboardAction('ArrowRight', { metaKey: true })).toBeNull()
  })

  it('sends Home and End to the two ends', () => {
    expect(railKeyboardTarget('first', measurements({ scrollLeft: 900 }))).toBe(0)
    expect(railKeyboardTarget('last', measurements())).toBe(1600)
  })

  it('pages the same distance as the arrows', () => {
    expect(railKeyboardTarget('next', measurements())).toBe(
      railScrollTarget('next', measurements()),
    )
  })
})

/** dsv2.5.2 acceptance 1. */
describe('railRangeDisplay', () => {
  it('paints no range when the controls already communicate position', () => {
    expect(railRangeDisplay(2, 8, true).showVisibleRange).toBe(false)
  })

  it('still announces the position to assistive technology', () => {
    expect(railRangeDisplay(2, 8, true).screenReaderText).toBe('Blog 3 of 8')
  })

  it('paints the range when there are no controls to read it from', () => {
    expect(railRangeDisplay(2, 8, false).showVisibleRange).toBe(true)
  })

  it('counts from one, whatever the index', () => {
    expect(railRangeDisplay(0, 8, true, 'Series').screenReaderText).toBe('Series 1 of 8')
  })

  it('clamps an index that has run past the list', () => {
    expect(railRangeDisplay(99, 8, true).screenReaderText).toBe('Blog 8 of 8')
    expect(railRangeDisplay(-4, 8, true).screenReaderText).toBe('Blog 1 of 8')
  })

  it('says an empty rail is empty rather than pluralising a noun into nonsense', () => {
    expect(railRangeDisplay(0, 0, true, 'Series').screenReaderText).toBe('This rail is empty')
  })
})

/** dsv2.5.2 acceptance 2. */
describe('railOverlayControlStyle', () => {
  it('is circular', () => {
    expect(railOverlayControlStyle().borderRadius).toBe(radii.tag)
    expect(railOverlayControlStyle().isCircular).toBe(true)
  })

  it('is translucent in both themes, derived from the token rather than claimed', () => {
    const style = railOverlayControlStyle()
    const pair = semanticColors[style.bg]

    expect(style.isTranslucent).toBe(true)
    expect(pair.light).toContain('/')
    expect(pair.dark).toContain('/')
  })

  it('resolves every colour to a paired semantic role', () => {
    const style = railOverlayControlStyle()

    for (const token of [style.bg, style.hoverBg, style.color, style.borderColor]) {
      expect(Object.keys(semanticColors)).toContain(token)
    }
  })

  it('meets the touch target floor', () => {
    expect(Number.parseFloat(railOverlayControlStyle().size)).toBeGreaterThanOrEqual(44)
  })
})

describe('motion', () => {
  it('scrolls smoothly by default and instantly under reduced motion', () => {
    expect(railScrollBehavior(fullMotionPolicy)).toBe('smooth')
    expect(railScrollBehavior(reducedMotionPolicy)).toBe('auto')
  })
})

describe('appendRailItems', () => {
  const page1 = [{ id: 'a' }, { id: 'b' }]

  it('appends a page', () => {
    expect(appendRailItems(page1, [{ id: 'c' }])).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }])
  })

  it('drops an overlap rather than duplicating a React key', () => {
    expect(appendRailItems(page1, [{ id: 'b' }, { id: 'c' }])).toEqual([
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ])
  })

  it('drops a duplicate inside the incoming page too', () => {
    expect(appendRailItems(page1, [{ id: 'c' }, { id: 'c' }])).toHaveLength(3)
  })

  it('returns the same array when a page adds nothing, so nothing re-renders', () => {
    expect(appendRailItems(page1, [{ id: 'a' }])).toBe(page1)
    expect(appendRailItems(page1, [])).toBe(page1)
  })
})

describe('railLoadStatus', () => {
  it('reports a retry in flight as loading, not as the old failure', () => {
    expect(railLoadStatus({ isLoading: true, error: 'boom', hasMore: true })).toBe('loading')
  })

  it('reports the failure once the attempt is over', () => {
    expect(railLoadStatus({ error: 'boom', hasMore: true })).toBe('error')
  })

  it('separates "more to fetch" from "that is everything"', () => {
    expect(railLoadStatus({ hasMore: true })).toBe('idle')
    expect(railLoadStatus({ hasMore: false })).toBe('complete')
  })

  it('never asks for more while a request is in flight or after a failure', () => {
    expect(shouldRequestMore({ hasMore: true })).toBe(true)
    expect(shouldRequestMore({ hasMore: true, isLoading: true })).toBe(false)
    expect(shouldRequestMore({ hasMore: true, error: 'boom' })).toBe(false)
    expect(shouldRequestMore({ hasMore: false })).toBe(false)
  })
})
