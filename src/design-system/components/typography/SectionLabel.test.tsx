/**
 * `SectionLabel` and `Eyebrow` look the same and mean opposite things, so the
 * things worth asserting are the two that separate them: one is in the document
 * outline and the other must never be, and promoting a label must not change
 * anything on screen.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import theme from '../../../theme/horizon'
import { Eyebrow } from './Eyebrow'
import { SectionLabel } from './SectionLabel'

const render = (node: React.ReactNode) =>
  renderToStaticMarkup(<ChakraProvider theme={theme}>{node}</ChakraProvider>)

const classOf = (html: string) => html.match(/class="([^"]*)"/)?.[1] ?? ''

describe('SectionLabel', () => {
  it('is a heading, and h2 unless told otherwise', () => {
    expect(render(<SectionLabel>Experience</SectionLabel>)).toContain('<h2')
    expect(render(<SectionLabel as="h3">Experience</SectionLabel>)).toContain('<h3')
  })

  it('carries the same styling as an eyebrow, so promoting a label is invisible', () => {
    // Emotion gives identical style sets the same generated class, so equal
    // class names is the strongest statement available without a layout engine.
    // Measured in a browser as well: both compute 13px/500, 0.65px tracking,
    // uppercase, text.muted, no margins, 20px tall.
    const label = classOf(render(<SectionLabel>Editorial track</SectionLabel>))
    const eyebrow = classOf(render(<Eyebrow as="p">Editorial track</Eyebrow>))

    expect(label).not.toBe('')
    expect(label).toBe(eyebrow)
  })

  it('refuses to let an eyebrow be a heading', () => {
    // The type refuses it; this records why, because the runtime would happily
    // render it. An eyebrow repeats the heading below it, so putting it in the
    // outline gives every section two entries.
    const eyebrow = render(<Eyebrow as="p">About Horizon</Eyebrow>)

    expect(eyebrow).toContain('<p')
    expect(eyebrow).not.toContain('<h2')
  })
})
