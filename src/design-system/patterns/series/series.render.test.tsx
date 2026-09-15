/**
 * What the Series rail hands its cards.
 *
 * `rail.logic.ts` owns the arithmetic and `rail.test.ts` covers it. The
 * question here is a composition one - does a decision taken by the shelf reach
 * the card it is about - so it is rendered rather than computed. See the
 * Testing section of `CONVENTIONS.md`.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { SeriesRail } from './SeriesRail'
import type { SeriesCardOptions } from './SeriesCard'
import { sampleSeriesShelf } from './fixtures'

/** The Series plate, which is the only thing on a card drawn at 16 / 10. */
const COVER_PLATE = /aspect-ratio:\s*16\s*\/\s*10/
const COVER_ALT = 'alt="Sample placeholder Series artwork"'

function shelf(cardOptions?: SeriesCardOptions): string {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter>
        <SeriesRail
          items={sampleSeriesShelf}
          label="Sample Series shelf"
          cardOptions={cardOptions}
        />
      </MemoryRouter>
    </ChakraProvider>,
  )
}

describe('the rail forwards its card options', () => {
  it('draws the cover plate when nothing is said, so no existing shelf changes', () => {
    const markup = shelf()

    expect(markup).toContain(COVER_ALT)
    expect(markup).toMatch(COVER_PLATE)
  })

  /*
   * The defect this closes: the public Series API carries no artwork, so every
   * card on the Home and Blog shelves drew an absent-media plate. The shelf can
   * now say so once, for all of its cards.
   */
  it('drops every plate on the shelf when the shelf says there is no artwork', () => {
    const markup = shelf({ showCover: false })

    expect(markup).not.toContain(COVER_ALT)
    expect(markup).not.toMatch(COVER_PLATE)
  })

  it('still renders every Series and its link with the plate dropped', () => {
    const markup = shelf({ showCover: false })

    for (const series of sampleSeriesShelf) {
      expect(markup).toContain(series.title)
      expect(markup).toContain(`href="${series.href}"`)
    }
  })

  it('forwards the other card options too, not only the cover', () => {
    const markup = shelf({ showCover: false, titleAs: 'h4' })

    expect(markup).toContain('<h4')
    expect(markup).not.toContain('<h3')
  })
})

/**
 * The rail's own behaviour is not the caller's to vary. `cardOptions` is a
 * `Pick` from the card's props precisely so that nothing in it can reach the
 * scroll container, and these assertions are what would notice if it could.
 */
describe('the rail keeps its own behaviour', () => {
  it('is still one labelled, focusable, snapping scroll container', () => {
    const markup = shelf({ showCover: false })

    expect(markup).toContain('role="group"')
    expect(markup).toContain('aria-label="Sample Series shelf"')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toMatch(/scroll-snap-type:\s*x mandatory/)
    expect(markup).toMatch(/overflow-x:\s*auto/)
  })

  it('still draws its overlay arrows and announces its position', () => {
    const markup = shelf({ showCover: false })

    expect(markup).toContain('aria-live="polite"')
    expect(markup).toContain('Previous Series')
    expect(markup).toContain('Next Series')
  })
})
