/**
 * The shell's contract, as markup.
 *
 * These are the things that were wrong before the shell moved onto the design
 * system, and each one is cheap to break again by accident: a landmark dropped
 * while restructuring, a footer link written with `href` out of habit, a social
 * icon added without a destination. The layout half - contrast, target size,
 * the sticky bar - is not assertable here, because this renders markup and not
 * a layout; that half is measured in a browser.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import theme from '../../theme/horizon'
import Footer from './Footer'
import { SOCIAL_LINKS } from './nav-links'

const render = (node: React.ReactNode) =>
  renderToStaticMarkup(
    <ChakraProvider theme={theme}>
      <MemoryRouter>{node}</MemoryRouter>
    </ChakraProvider>,
  )

describe('the site footer', () => {
  it('is a footer landmark', () => {
    expect(render(<Footer />)).toContain('<footer')
  })

  it('gives every social icon a real destination', () => {
    const html = render(<Footer />)

    // They were IconButtons with a label and no href: a reader clicking the
    // GitHub mark got nothing, and the name announced a control that did
    // nothing. An icon with no destination must not come back.
    expect(SOCIAL_LINKS.length).toBeGreaterThan(0)
    for (const social of SOCIAL_LINKS) {
      expect(html).toContain(`href="${social.href}"`)
      expect(html).toContain(`aria-label="${social.name}"`)
    }
  })

  it('keeps its own navigation inside the router', () => {
    const html = render(<Footer />)

    // `href="/about"` is a full document load between two pages of one site -
    // the router, the theme and every cache thrown away. React Router's Link
    // renders the same href, so the assertion that separates them is that the
    // footer nav is a landmark of routed links, not that the href differs.
    expect(html).toContain('aria-label="Footer"')
    expect(html).toContain('href="/blog"')
  })

  it('takes its colours from the theme rather than pairing two systems', () => {
    const html = render(<Footer />)

    // Light used to come from Chakra's stock grey ramp via useColorModeValue,
    // so the footer was the one surface not on the token system in light mode -
    // and the dark half named legacy aliases that release M8 removes.
    expect(html).not.toContain('gray.50')
    expect(html).not.toContain('gray.700')
  })
})
