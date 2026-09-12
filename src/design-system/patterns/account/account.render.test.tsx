/**
 * What `ContactCard` emits once it has an action slot.
 *
 * `identity.test.ts` proves the decision - which channels can carry an action
 * and which cannot. The claims here are the ones a pure function cannot make:
 * that the action arrives as a real anchor wearing the Button recipe rather than
 * control styling the card invented, and that a channel with no destination
 * emits no control at all however the page labels it. See the Testing section of
 * `CONVENTIONS.md`.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { ContactCard } from './ContactCard'

/** The solid Button fill, as the theme resolves it. */
const BUTTON_FILL = 'background:var(--chakra-colors-action-primary)'
/** The outline Button's border colour. */
const BUTTON_OUTLINE = 'border-color:var(--chakra-colors-action-primary)'

function render(element: JSX.Element): string {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter>{element}</MemoryRouter>
    </ChakraProvider>,
  )
}

describe('a contact card with an action', () => {
  it('offers the verb as a second anchor to the same destination', () => {
    const markup = render(
      <ContactCard
        channel="email"
        title="Email"
        value="sample.author@example.com"
        actionLabel="Email directly"
      />,
    )

    // The value and the action both point at the address: the first is the
    // information, the second is the control a reader scanning for one finds.
    expect([...markup.matchAll(/href="mailto:sample\.author@example\.com"/g)]).toHaveLength(2)
    expect(markup).toContain('Email directly')
    expect(markup).not.toContain('<button')
  })

  it('takes its weight from the Button recipe rather than restyling a link', () => {
    const primary = render(
      <ContactCard
        channel="email"
        title="Email"
        value="sample.author@example.com"
        actionLabel="Email directly"
        emphasis="primary"
      />,
    )
    const secondary = render(
      <ContactCard channel="phone" title="Phone" value="+84 90 123 45 67" actionLabel="Call" />,
    )

    expect(primary).toContain(BUTTON_FILL)
    expect(secondary).toContain(BUTTON_OUTLINE)
    expect(secondary).not.toContain(BUTTON_FILL)
  })

  it('reaches the 44px touch target the accessibility floor asks for', () => {
    expect(
      render(
        <ContactCard channel="phone" title="Phone" value="+84 90 123 45 67" actionLabel="Call" />,
      ),
    ).toContain('min-height:44px')
  })

  it('gives a postal address text and no control, whatever verb the page names', () => {
    const markup = render(
      <ContactCard
        channel="location"
        title="Based in"
        value="Sample City, Example Country"
        actionLabel="Open the map"
      />,
    )

    expect(markup).toContain('Sample City, Example Country')
    expect(markup).not.toContain('Open the map')
    // The card is an `article`, so the anchor has to be matched as a whole tag.
    expect(markup).not.toMatch(/<a[\s>]/)
    expect(markup).not.toContain('<button')
  })

  it('renders no action when the page names no verb', () => {
    const markup = render(
      <ContactCard channel="email" title="Email" value="sample.author@example.com" />,
    )

    expect([...markup.matchAll(/href="mailto:sample\.author@example\.com"/g)]).toHaveLength(1)
    expect(markup).not.toContain(BUTTON_FILL)
    expect(markup).not.toContain(BUTTON_OUTLINE)
  })
})
