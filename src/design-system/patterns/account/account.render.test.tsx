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
import { componentTokens } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { AvatarEditor } from './AvatarEditor'
import { ContactCard } from './ContactCard'
import { ProfileHeader } from './ProfileHeader'
import { AuthAlert } from './VerificationFeedback'

/** The solid Button fill, as the theme resolves it. */
const BUTTON_FILL = 'background:var(--chakra-colors-action-primary)'
/** The outline Button's border colour. */
const BUTTON_OUTLINE = 'border-color:var(--chakra-colors-action-primary)'
/** The success surface, as the theme resolves it. */
const SUCCESS_SURFACE = 'background:var(--chakra-colors-status-successSurface)'
/** The neutral surface an informational banner wears instead. */
const NEUTRAL_SURFACE = 'background:var(--chakra-colors-bg-subtle)'

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

/**
 * The informational banner.
 *
 * `auth.test.ts` proves the tone decision. The claim here is the one a pure
 * function cannot make: that the banner actually emits the neutral surface and
 * a polite status region, and that the success surface never reaches a page
 * whose sentence is deliberately non-committal. The icon itself is an inline
 * `svg` with no text, which is exactly why the surface and the role are what
 * this asserts - and why "does it look like a tick" stays a gallery question.
 */
describe('an informational auth banner', () => {
  const markup = render(
    <AuthAlert
      tone="info"
      title="Check your inbox"
      detail="If the email exists, we sent password reset instructions."
    />,
  )

  it('wears the neutral surface rather than the success one', () => {
    expect(markup).toContain(NEUTRAL_SURFACE)
    expect(markup).not.toContain(SUCCESS_SURFACE)
  })

  it('announces politely as a status, never as an interruption', () => {
    expect(markup).toContain('role="status"')
    expect(markup).toContain('aria-live="polite"')
    expect(markup).not.toContain('role="alert"')
    expect(markup).not.toContain('aria-live="assertive"')
  })

  it('keeps the conditional sentence the endpoint answers with', () => {
    expect(markup).toContain('If the email exists')
  })

  it('is the same banner as a success in every respect but the claim', () => {
    const success = render(<AuthAlert tone="success" title="Password updated" />)

    expect(success).toContain(SUCCESS_SURFACE)
    expect(success).toContain('role="status"')
  })

  it('still interrupts a reader who has to retype a password', () => {
    const failure = render(<AuthAlert tone="error" title="Login failed" />)

    expect(failure).toContain('role="alert"')
    expect(failure).toContain('aria-live="assertive"')
  })
})

describe('the editorial profile workspace', () => {
  const markup = render(
    <ProfileHeader
      layout="workspace"
      profile={{
        name: 'Sample Author',
        bio: 'A realistic sample biography for the workspace composition.',
        email: 'sample.author@example.com',
      }}
      avatarSlot={
        <AvatarEditor presentation="workspace" name="Sample Author" src="/sample-avatar.jpg" />
      }
      identityAction={
        <Button tone="link" data-profile-action="edit">
          Edit profile
        </Button>
      }
      actions={<Button>Write a blog</Button>}
      stats={[
        { label: 'Blogs', value: '48', detail: 'Published on the sample site.' },
        { label: 'Drafts', value: '4', detail: 'Still being refined.' },
      ]}
    />,
  )

  it('keeps the identity action between the name and contact metadata', () => {
    expect(markup.indexOf('Sample Author')).toBeLessThan(markup.indexOf('Edit profile'))
    expect(markup.indexOf('Edit profile')).toBeLessThan(markup.indexOf('sample.author@example.com'))
  })

  it('uses one square media frame and typographic facts instead of stat cards', () => {
    expect(markup).toMatch(/aspect-ratio:1\s*\/\s*1/)

    const stats = markup.match(/<dl[^>]*>(.*?)<\/dl>/)?.[1]

    expect(stats).toBeDefined()
    expect(stats).not.toContain(`border-radius:${componentTokens.control.radius}`)
  })

  it('preserves a labelled file input in the overlaid picture control', () => {
    expect(markup).toContain('type="file"')
    expect(markup).toContain('aria-label="Choose a new profile picture for Sample Author"')
    expect(markup).toContain('Change picture')
  })
})
