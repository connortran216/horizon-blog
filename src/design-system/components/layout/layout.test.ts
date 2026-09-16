import { describe, expect, it } from 'vitest'

import { breakpoints, layout, sectionSpace, space } from '../../../theme/tokens'
import {
  containerGutter,
  containerMaxWidth,
  containerMaxWidthValue,
  gridColumnTemplate,
  layoutBreakpoints,
  sectionSpacing,
  stackFlexDirection,
  stackGap,
} from './layout.logic'
import {
  collectionElements,
  headingElements,
  isHeadingElement,
  regionElements,
  textElements,
} from './semanticElements'

/**
 * dsv2.3.1 acceptance 1: "Breakpoints match the approved 680/1000 transitions."
 *
 * The tokens own the numbers; what this asserts is that every layout decision
 * lands on one of the four approved transitions and that the two named in the
 * acceptance criterion resolve to the pixel values the prototype uses.
 */
describe('layout breakpoints', () => {
  it('maps every layout decision onto an approved breakpoint', () => {
    for (const name of Object.values(layoutBreakpoints)) {
      expect(Object.keys(breakpoints)).toContain(name)
    }
  })

  it('puts the type ramp and section rhythm on the 680 transition', () => {
    expect(breakpoints[layoutBreakpoints.typeRamp]).toBe('681px')
    expect(breakpoints[layoutBreakpoints.sectionRhythm]).toBe('681px')
  })

  it('puts the full desktop composition on the 1000 transition', () => {
    expect(breakpoints[layoutBreakpoints.composition]).toBe('1001px')
  })

  it('does not invent a transition outside the token source', () => {
    const used = new Set<string>(Object.values(layoutBreakpoints))

    expect([...used].every((name) => name in breakpoints)).toBe(true)
  })

  /**
   * `w11.4`: the reader's TOC rail switches on well past `lg` (1001px) -
   * showing it any earlier cost the article more width than the rail was
   * worth. `1400px` is not from the approved prototype; it is where
   * `200 + 64 + 64 + 200` (the rail, its gap, and both mirrored for
   * `w11.1`'s centering) plus the `48px` gutter still leaves the article
   * ~64ch (824px) - close to the 68ch prose measure - rather than a lot less.
   */
  it("puts the reader's TOC rail on its own, later transition", () => {
    expect(breakpoints[layoutBreakpoints.readerRail]).toBe('1400px')
    expect(layoutBreakpoints.readerRail).not.toBe(layoutBreakpoints.composition)
  })
})

describe('containerMaxWidth', () => {
  it('resolves the content frame to the registered size token', () => {
    expect(containerMaxWidth('content')).toBe('content')
    expect(containerMaxWidthValue('content')).toBe(layout.content)
  })

  it('resolves the reading measure to the registered size token', () => {
    expect(containerMaxWidth('prose')).toBe('prose')
    expect(containerMaxWidthValue('prose')).toBe(layout.prose)
  })

  it('lets a full-bleed container opt out of the frame', () => {
    expect(containerMaxWidth('full')).toBe('100%')
  })

  /**
   * `w11.2`: the reader page's own frame, wider than the shared `content`
   * frame on purpose - see `layout.readingFrame` for why 808px of article
   * never reached the 68ch prose measure at any desktop width under it.
   */
  it("resolves the reader's own frame to the registered size token", () => {
    expect(containerMaxWidth('reading')).toBe('reading')
    expect(containerMaxWidthValue('reading')).toBe(layout.readingFrame)
  })
})

describe('containerGutter', () => {
  it('widens the gutter once past the 680 transition', () => {
    expect(containerGutter()).toEqual({ base: space[4], sm: space[6] })
  })
})

/** dsv2.3.1: section rhythm is 48px mobile / 80px desktop per DESIGN.md. */
describe('sectionSpacing', () => {
  it('uses the documented 48/80 rhythm at comfortable density', () => {
    expect(sectionSpacing('comfortable')).toEqual({
      base: sectionSpace.mobile,
      sm: sectionSpace.desktop,
    })
  })

  it('halves the rhythm at compact density, still on the spacing scale', () => {
    expect(sectionSpacing('compact')).toEqual({ base: space[6], sm: space[12] })
  })

  it('emits no spacing at all when a parent owns the rhythm', () => {
    expect(sectionSpacing('flush')).toEqual({ base: '0', sm: '0' })
  })
})

describe('gridColumnTemplate', () => {
  it('collapses a multi-column grid to one column on a phone', () => {
    expect(gridColumnTemplate(3)).toEqual({
      base: 'repeat(1, minmax(0, 1fr))',
      md: 'repeat(3, minmax(0, 1fr))',
    })
  })

  it('defaults the collapse point to the multi-column transition', () => {
    expect(Object.keys(gridColumnTemplate(2))).toContain(layoutBreakpoints.columns)
  })

  it('honours an explicit collapse point', () => {
    expect(gridColumnTemplate(4, 'lg')).toEqual({
      base: 'repeat(1, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 1fr))',
    })
  })

  it('emits no breakpoint for a single-column grid', () => {
    expect(gridColumnTemplate(1)).toEqual({ base: 'repeat(1, minmax(0, 1fr))' })
  })

  it('uses minmax(0, 1fr) so a long token cannot widen the document', () => {
    const template = gridColumnTemplate(2)

    expect(Object.values(template).every((value) => value?.includes('minmax(0, 1fr)'))).toBe(true)
  })
})

describe('stackFlexDirection', () => {
  it('stacks a row into a column below its collapse point', () => {
    expect(stackFlexDirection('row', 'md')).toEqual({ base: 'column', md: 'row' })
  })

  it('leaves a column alone at every width', () => {
    expect(stackFlexDirection('column', 'md')).toEqual({ base: 'column' })
  })

  it('keeps a row a row when no collapse point is given', () => {
    expect(stackFlexDirection('row')).toEqual({ base: 'row' })
  })
})

describe('stackGap', () => {
  it('resolves every gap through the spacing scale', () => {
    expect(stackGap(4)).toBe(space[4])
    expect(stackGap(24)).toBe(space[24])
  })
})

/** dsv2.3.1 acceptance 3: "Semantic HTML remains available through component APIs." */
describe('semantic elements', () => {
  it('offers the landmark elements a page frame needs', () => {
    for (const element of ['main', 'header', 'footer', 'nav', 'aside', 'section', 'article']) {
      expect(regionElements).toContain(element)
    }
  })

  it('offers list containers for stacks and grids of repeated items', () => {
    expect(collectionElements).toContain('ul')
    expect(collectionElements).toContain('ol')
    expect(collectionElements).toContain('dl')
  })

  it('keeps every region element available to a collection', () => {
    for (const element of regionElements) {
      expect(collectionElements).toContain(element)
    }
  })

  it('offers every heading rank', () => {
    expect(headingElements).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
  })

  it('recognises a heading element and rejects a text element', () => {
    expect(isHeadingElement('h3')).toBe(true)
    expect(isHeadingElement('p')).toBe(false)
    expect(isHeadingElement('span')).toBe(false)
  })

  it('never offers an interactive element as a text or region element', () => {
    const interactive = ['button', 'a', 'input', 'select', 'textarea']

    for (const element of interactive) {
      expect(regionElements).not.toContain(element)
      expect(textElements).not.toContain(element)
      expect(collectionElements).not.toContain(element)
    }
  })
})
