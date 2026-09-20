/**
 * The emphasis `y2e.3.2` asks the ordered list for.
 *
 * `series.test.ts` already covers `partConnector`'s arithmetic. What cannot be
 * computed is whether the decision reaches the markup, so this renders the list
 * and reads it. See the Testing section of `src/design-system/CONVENTIONS.md`.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { PartList } from './PartList'
import { sampleSeriesParts } from './fixtures'

/** `action.primary`, which is what both the current part and the emphasis use. */
const ACTIVE = 'var(--chakra-colors-action-primary)'

function list(currentIndex: number | null): string {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter>
        <PartList parts={sampleSeriesParts} currentIndex={currentIndex} />
      </MemoryRouter>
    </ChakraProvider>,
  )
}

describe('the part the reader is on', () => {
  it('is marked, and is the only one', () => {
    const markup = list(2)

    expect(markup.match(/data-active="true"/g)).toHaveLength(1)
  })

  it('says so on the row, not only inside the link', () => {
    // `aria-current` lives on the title link; a row that has to be styled or
    // located as a whole needs the state where the row is.
    expect(list(2)).toMatch(/<li[^>]*data-active="true"/)
  })

  it('marks no row when the reader is not inside the Series', () => {
    expect(list(null)).not.toContain('data-active="true"')
  })

  it('names the reading state of every row, so previous and upcoming stay distinct', () => {
    const markup = list(2)

    expect(markup).toContain('data-part-state="previous"')
    expect(markup).toContain('data-part-state="current"')
    expect(markup).toContain('data-part-state="upcoming"')
  })
})

describe('hover and keyboard emphasis', () => {
  it('scopes every row so the pointer and the keyboard reach inside it', () => {
    expect(list(2).match(/<li[^>]*data-group/g)).toHaveLength(sampleSeriesParts.length)
  })

  it('lights the ordinal marker and the outgoing connector on hover', () => {
    expect(list(2)).toMatch(new RegExp(`\\[data-group\\]:hover [^{]*\\{[^}]*${literal(ACTIVE)}`))
  })

  it('does the same for a title reached by keyboard, not hover alone', () => {
    expect(list(2)).toMatch(
      new RegExp(`\\[data-group\\]:focus-within [^{]*\\{[^}]*${literal(ACTIVE)}`),
    )
  })
})

function literal(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
