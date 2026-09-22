/**
 * The living-margin marker is a rendered contract: logic tests can prove which
 * item is active, but only markup can prove the rail owns one decorative marker
 * while the disclosure stays a plain, stable list.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { TOC } from './TOC'
import type { ReaderHeading } from './reader.logic'

const headings: ReaderHeading[] = [
  { id: 'opening', text: 'Opening', depth: 2 },
  { id: 'details', text: 'Details', depth: 3 },
]

function render(variant: 'rail' | 'disclosure', activeId: string | null = 'opening'): string {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <TOC headings={headings} activeId={activeId} variant={variant} />
    </ChakraProvider>,
  )
}

describe('TOC living margin', () => {
  it('renders one decorative marker for the active rail entry', () => {
    const markup = render('rail')

    expect(markup.match(/data-reader-toc-marker=""/g)).toHaveLength(1)
    expect(markup.match(/aria-current="location"/g)).toHaveLength(1)
  })

  it('does not add a moving marker to the mobile disclosure', () => {
    expect(render('disclosure')).not.toContain('data-reader-toc-marker')
  })

  it('renders no marker when no heading is active', () => {
    expect(render('rail', null)).not.toContain('data-reader-toc-marker')
  })
})
