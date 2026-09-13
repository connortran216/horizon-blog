/**
 * What the action components actually emit.
 *
 * `link.test.ts` and `control.test.ts` prove the decisions. The claims here are
 * the ones a pure function cannot make: that a call to action carrying button
 * weight is still a real anchor with a real destination, that it keeps `rel` and
 * `target` when it leaves the site, that it kept the system's focus ring rather
 * than a hand-drawn one - and that a button's hover rule carries the variant's
 * colour as well as its depth. See the Testing section of `CONVENTIONS.md`.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { ActionLink } from './ActionLink'
import { Button } from './Button'
import { IconButton } from './IconButton'

/** The solid Button fill, as the theme resolves it. */
const BUTTON_FILL = 'background:var(--chakra-colors-action-primary)'
/** The outline Button's border colour. */
const BUTTON_OUTLINE = 'border-color:var(--chakra-colors-action-primary)'
/** The global focus treatment, which no component may replace. */
const FOCUS_RING = 'outline-color:var(--chakra-colors-focus-ring)'
/** Hover depth and press travel, as the theme writes them. */
const LIFT = 'translateY(-2px)'
const PRESS = 'translateY(1px)'

function render(element: JSX.Element): string {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter>{element}</MemoryRouter>
    </ChakraProvider>,
  )
}

/**
 * The body of one emitted rule.
 *
 * The declarations have to be read together rather than searched for across the
 * whole stylesheet: the defect this guards against was a hover rule that carried
 * the lift and nothing else, while the colour it should have carried sat in a
 * rule that had been replaced. `\w` does not match `:`, so `:hover,` only ever
 * matches the plain hover rule and never `:hover:active,`.
 */
function rule(markup: string, selector: string): string {
  return markup.match(new RegExp(`\\.css-[\\w-]+${selector},[^{]*\\{([^}]*)\\}`))?.[1] ?? ''
}

/*
 * The regression these cover, in full: `Button` and `IconButton` passed the
 * hover lift as a `_hover` style prop. Chakra replaces the recipe's `_hover`
 * with a style prop rather than merging into it, so every button in the system
 * hovered with 2px of lift and no colour change at all - the variant's
 * `action.hover`, `action.subtle` and danger surface never reached the page.
 * The lift rule was also emitted after `_active`, and at equal weight, so it
 * outranked the press travel the theme defines as well.
 */
describe('a button hovering', () => {
  const tones = [
    { tone: 'primary', fill: 'background:var(--chakra-colors-action-hover)' },
    { tone: 'secondary', fill: 'background:var(--chakra-colors-action-subtle)' },
    { tone: 'quiet', fill: 'background:var(--chakra-colors-action-subtle)' },
    { tone: 'danger', fill: 'background:var(--chakra-colors-status-dangerSurface)' },
  ] as const

  for (const { tone, fill } of tones) {
    it(`carries the ${tone} variant's hover colour and the lift in one rule`, () => {
      const hover = rule(render(<Button tone={tone}>Save</Button>), ':hover')

      expect(hover, `the ${tone} tone emits no hover rule`).not.toBe('')
      expect(hover).toContain(fill)
      expect(hover).toContain(LIFT)
    })
  }

  it('lets the press travel win while the pointer is both hovering and pressing', () => {
    const markup = render(<Button>Save</Button>)

    // `:hover:active` is one selector heavier than `:hover`, so this is what a
    // pressed button gets no matter which of the two rules is emitted last.
    expect(rule(markup, ':hover:active')).toContain(PRESS)
    expect(rule(markup, ':active')).toContain(PRESS)
    expect(rule(markup, ':active')).not.toContain(LIFT)
  })

  it('gives an icon button the same colour and the same depth', () => {
    const hover = rule(render(<IconButton label="Copy code" icon={<span />} />), ':hover')

    expect(hover).toContain('background:var(--chakra-colors-action-subtle)')
    expect(hover).toContain(LIFT)
  })

  it('offers no hover state at all to a control that cannot be activated', () => {
    for (const markup of [
      render(<Button isDisabled>Save</Button>),
      render(<Button isLoading>Save</Button>),
      render(<IconButton label="Copy code" icon={<span />} isDisabled />),
    ]) {
      expect(rule(markup, ':hover')).toBe('')
      expect(markup).not.toContain(LIFT)
    }
  })
})

describe('a link that carries button weight', () => {
  it('is a real anchor with a real destination, not a button', () => {
    const markup = render(
      <ActionLink to="/blog" weight="primary">
        Explore the blog
      </ActionLink>,
    )

    expect(markup).toContain('<a')
    expect(markup).toContain('href="/blog"')
    expect(markup).not.toContain('<button')
    expect(markup).toContain('Explore the blog')
  })

  it('wears the Button fill rather than a fill of its own', () => {
    expect(
      render(
        <ActionLink to="/blog" weight="primary">
          Explore
        </ActionLink>,
      ),
    ).toContain(BUTTON_FILL)
  })

  it('wears the outline treatment at secondary weight', () => {
    const markup = render(
      <ActionLink to="/blog" weight="secondary">
        Explore
      </ActionLink>,
    )

    expect(markup).toContain(BUTTON_OUTLINE)
    expect(markup).not.toContain(BUTTON_FILL)
  })

  it('keeps the system focus ring in both weights', () => {
    expect(
      render(
        <ActionLink to="/blog" weight="primary">
          Explore
        </ActionLink>,
      ),
    ).toContain(FOCUS_RING)
    expect(render(<ActionLink to="/blog">Explore</ActionLink>)).toContain(FOCUS_RING)
  })

  it('reaches the 44px touch target the accessibility floor asks for', () => {
    expect(
      render(
        <ActionLink to="/blog" weight="primary">
          Explore
        </ActionLink>,
      ),
    ).toContain('min-height:44px')
  })
})

describe('a weighted link that leaves the site', () => {
  it('pairs target=_blank with rel=noopener noreferrer and says so out loud', () => {
    const markup = render(
      <ActionLink href="https://example.com/elsewhere" weight="primary">
        Read it elsewhere
      </ActionLink>,
    )

    expect(markup).toContain('href="https://example.com/elsewhere"')
    expect(markup).toContain('target="_blank"')
    expect(markup).toContain('rel="noopener noreferrer"')
    expect(markup).toContain('opens in a new tab')
    expect(markup).toContain(BUTTON_FILL)
  })

  it('does not open a same-site destination in a new tab', () => {
    const markup = render(
      <ActionLink href="/blog" weight="primary">
        Explore
      </ActionLink>,
    )

    expect(markup).not.toContain('target="_blank"')
    expect(markup).not.toContain('rel=')
  })
})

describe('the text weight is unchanged', () => {
  it('still underlines at rest and wears no button fill', () => {
    const markup = render(<ActionLink to="/blog">An inline link</ActionLink>)

    expect(markup).toContain('text-decoration:underline')
    expect(markup).not.toContain(BUTTON_FILL)
  })

  it('still drops the resting underline when asked to', () => {
    const markup = render(
      <ActionLink to="/blog" underline="hover">
        An unambiguous link
      </ActionLink>,
    )

    expect(markup).toContain('text-decoration:none')
  })
})

/**
 * React Router location state.
 *
 * Two releases hit this gap and each built a local copy of `ActionLink` to get
 * round it - the account screens to carry the post-authentication destination,
 * the reader to carry the author id the archive resolves itself from. What a
 * rendered string can prove is that the state does not change the link: the
 * router consumes it, so the anchor is still an anchor with a real href and no
 * stray attribute. `routerLinkState` in `link.test.ts` proves where it may ride.
 */
describe('a routed link carrying location state', () => {
  it('is still a plain anchor to the route, with no state attribute of its own', () => {
    const markup = render(
      <ActionLink to="/login" state={{ from: '/blog/76' }}>
        Sign in
      </ActionLink>,
    )

    expect(markup).toContain('href="/login"')
    expect(markup).not.toContain('state=')
    expect(markup).not.toContain('/blog/76')
  })

  it('keeps carrying it at button weight', () => {
    const markup = render(
      <ActionLink to="/login" state={{ from: '/blog/76' }} weight="primary">
        Sign in
      </ActionLink>,
    )

    expect(markup).toContain('href="/login"')
    expect(markup).toContain(BUTTON_FILL)
  })

  /*
   * A compile-time assertion, and the only kind available for a rule that is
   * enforced by the type. `yarn tsc --noEmit` type checks this file, so if
   * `state` ever becomes assignable beside an `href` the unused directive fails
   * the build - which is exactly the regression this closes.
   */
  it('is a type error beside an href, because an external URL cannot carry it', () => {
    const rejected = (
      // @ts-expect-error - location state has no meaning outside the router
      <ActionLink href="https://example.com" state={{ from: '/blog/76' }}>
        An external destination
      </ActionLink>
    )

    expect(render(rejected)).toContain('href="https://example.com"')
  })
})
