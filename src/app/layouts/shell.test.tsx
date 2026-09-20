/**
 * The shell's contract, as markup.
 *
 * These are the things that were wrong before the shell moved onto the design
 * system, and each one is cheap to break again by accident: a landmark dropped
 * while restructuring, a footer link written with `href` out of habit, a social
 * icon added without a destination. The layout half - contrast, target size,
 * the sticky bar - is not assertable here, because this renders markup and not
 * a layout; that half is measured in a browser.
 *
 * The Navbar tests below hold to the same rule. `renderToStaticMarkup` has no
 * layout engine and no DOM event system: nothing here can confirm that "Sign
 * in" sits on one line, that a tap lands inside a 44px square, or that
 * pressing Escape does anything at all. What IS observable in the emitted
 * string is the CSS Chakra/emotion writes inline during SSR - real
 * `min-height`/`min-width`/`padding-inline` declarations tied to a specific
 * element via its generated class name - so the touch-target and gutter fixes
 * from B-1/B-2 are checked that way, and the Escape key's *decision logic* is
 * pulled out to a pure function (`navbar.logic.ts`) and tested directly rather
 * than simulated through an event system this render mode does not have.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import theme from '../../theme/horizon'
import type { User } from '../../core'
import Footer from './Footer'
import Navbar from './Navbar'
import { SITE_LINKS, SOCIAL_LINKS } from './nav-links'
import { shouldCloseOnKey } from './navbar.logic'

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

/**
 * `useAuth` needs an `AuthProvider` ancestor, whose real implementation
 * kicks off a session-restore effect - one this render mode never runs, but
 * that pulls in `authService`/`getProfileService` for no reason a markup test
 * needs. `ProtectedRoute.test.tsx` and `CommentSection.test.tsx` already mock
 * the hook directly for the same reason; `authState` is mutated per test
 * instead of re-mocked so both the signed-out and signed-in shapes are cheap
 * to cover.
 */
const authState: { user: User | null } = { user: null }

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: authState.user, logout: vi.fn() }),
}))

/**
 * Pulls every `.<className>{...}` rule Chakra/emotion emitted for one class,
 * base rule and any `@media` override alike (the regex does not care what
 * wraps it, only that the selector matches).
 */
const rulesForClass = (html: string, className: string): string => {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = html.match(new RegExp(`\\.${escaped}\\{[^}]*\\}`, 'g'))
  return (matches ?? []).join(' ')
}

/**
 * Extracts the emotion-generated class (the `css-xxxxxxx` token, which is
 * where Chakra's own style rules live) from `<tag ...class="...">...anchor`
 * style markup. Elements often carry a second, static class (e.g.
 * `chakra-link`) alongside it, so this pulls the specific token rather than
 * the whole `class` attribute value.
 */
const classNear = (html: string, anchorPattern: RegExp): string => {
  const match = html.match(anchorPattern)
  if (!match) {
    throw new Error(`could not find anchor ${anchorPattern} in rendered markup`)
  }
  const emotionClass = match[1].split(' ').find((token) => token.startsWith('css-'))
  if (!emotionClass) {
    throw new Error(`no emotion class found in "${match[1]}"`)
  }
  return emotionClass
}

describe('the site header (Navbar)', () => {
  it('is a single header landmark with the site nav and account controls', () => {
    const html = render(<Navbar />)

    expect(html).toContain('<header')
    // The desktop nav landmark, and every configured site link inside it.
    expect(html).toContain('aria-label="Site"')
    for (const link of SITE_LINKS) {
      expect(html).toContain(`href="${link.path}"`)
    }
  })

  it('exposes the mobile menu trigger with the aria wiring the disclosure needs', () => {
    const html = render(<Navbar />)

    // Collapsed by default (useDisclosure's initial state). The trigger must
    // announce that state and name the panel it controls - both load-bearing
    // for the Escape/focus-return behaviour, which cannot itself be driven
    // through a static render (no event system to dispatch a keydown into).
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls="site-navigation-mobile"')
    // Collapsed, so the panel it points at must not be in the tree at all.
    expect(html).not.toContain('id="site-navigation-mobile"')
  })

  it('B-2: gives the brand link a real 44px touch target below `sm`, full-size above it', () => {
    const html = render(<Navbar />)

    const brandClass = classNear(html, /<a aria-label="Horizon home" class="([^"]+)"/)
    const rules = rulesForClass(html, brandClass)

    // Base (below `sm`): the 32px icon mark sits inside a 44px hit area, with
    // the compensating -6px margin so the wider target does not also widen
    // the header's own flex layout.
    expect(rules).toContain('min-height:44px')
    expect(rules).toContain('min-width:44px')
    expect(rules).toContain('margin-inline-start:-6px')
    expect(rules).toContain('margin-inline-end:-6px')
    // `sm` and up: the full wordmark is already past 44px, so both overrides
    // fall back to the unset values.
    expect(rules).toContain('min-width:auto')
    expect(rules).toContain('margin-inline-start:0px')
    expect(rules).toContain('margin-inline-end:0px')
  })

  it("B-1: narrows the header's own side gutter at 320px to make room for Sign in", () => {
    const html = render(<Navbar />)

    // The header's ContentContainer is the first div rendered inside
    // <header>; B-1 changed its `px` from the system default straight to a
    // local override, so this is the one div the fix actually touched.
    const gutterClass = classNear(html, /<header[^>]*>.*?<div class="(css-[a-z0-9]+)">/s)
    const rules = rulesForClass(html, gutterClass)

    // 320px and below: space[1] (4px) rather than the system's default
    // containerGutter, freeing the room "Sign in" needed to stay on one line.
    expect(rules).toContain('padding-inline-start:4px')
    expect(rules).toContain('padding-inline-end:4px')
    // `sm` and up: back to the system's normal 24px gutter.
    expect(rules).toContain('padding-inline-start:24px')
    expect(rules).toContain('padding-inline-end:24px')
  })

  it('renders Sign in as one real link, sized to the 44px control floor', () => {
    const html = render(<Navbar />)

    // A single `<a>` whose immediate content is the text "Sign in" - not a
    // button nested inside a link (the pre-v2 shell's
    // `<RouterLink><AnimatedPrimaryButton>` produced two tab stops for one
    // destination and invalid HTML).
    const signInAnchor = /<a class="([^"]+)" href="\/login">Sign in<\/a>/
    expect(html).toMatch(signInAnchor)

    const rules = rulesForClass(html, classNear(html, signInAnchor))
    expect(rules).toContain('min-height:44px')
  })

  it('drops Sign in and exposes the account menu once a user is signed in', () => {
    authState.user = {
      id: 1,
      username: 'reader',
      authorization: { role: 'member', permissions: [] },
    } as unknown as User

    try {
      const html = render(<Navbar />)

      expect(html).not.toContain('Sign in')
      expect(html).toContain('aria-label="Account menu for reader"')
    } finally {
      authState.user = null
    }
  })

  /**
   * US1 acceptance 1: a member is offered none of the actions the API would
   * refuse. Every row below carries the same `role` string and differs only in
   * the permission list, which is the point - the header reads the backend's
   * effective permissions and never the role name, so a forged or stale role
   * cannot conjure a control.
   */
  it.each([
    ['nothing', [] as string[], { write: false, analytics: false, access: false }],
    ['writing', ['content:manage:own'], { write: true, analytics: false, access: false }],
    ['analytics', ['analytics:read:own'], { write: false, analytics: true, access: false }],
    [
      'everything',
      ['content:manage:own', 'analytics:read:own', 'roles:assign'],
      { write: true, analytics: true, access: true },
    ],
  ])('offers the actions the backend grants, given %s', (_granted, permissions, expected) => {
    authState.user = {
      id: 1,
      username: 'reader',
      authorization: { role: 'member', permissions },
    } as unknown as User

    try {
      const html = render(<Navbar />)

      expect(html.includes('href="/blog-editor">Write')).toBe(expected.write)
      expect(html.includes('href="/analytics"')).toBe(expected.analytics)
      expect(html.includes('Access management')).toBe(expected.access)
      // The one account control that is nobody's privilege.
      expect(html).toContain(`href="/profile/reader"`)
    } finally {
      authState.user = null
    }
  })
})

describe('mobile menu Escape handling (navbar.logic)', () => {
  // The Navbar component wires this straight to a `keydown` listener that
  // only exists while the menu is open (see Navbar.tsx); what is tested here
  // is the decision itself, not the wiring - a static render cannot dispatch
  // a real key event to prove the listener fires or that focus lands back on
  // the trigger button. That half needs a browser (verified separately).
  it('closes on Escape while the menu is open', () => {
    expect(shouldCloseOnKey('Escape', true)).toBe(true)
  })

  it('does nothing on Escape while the menu is already closed', () => {
    expect(shouldCloseOnKey('Escape', false)).toBe(false)
  })

  it('ignores every other key, open or closed', () => {
    expect(shouldCloseOnKey('Enter', true)).toBe(false)
    expect(shouldCloseOnKey('Tab', true)).toBe(false)
    expect(shouldCloseOnKey('a', false)).toBe(false)
  })
})
