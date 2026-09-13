import { describe, expect, it } from 'vitest'

import { buttonVariant } from './control.logic'
import {
  isExternalHref,
  linkDecoration,
  linkPresentation,
  resolveLinkTarget,
  routerLinkState,
  type LinkWeight,
} from './link.logic'

describe('isExternalHref', () => {
  it('treats an absolute URL as external', () => {
    expect(isExternalHref('https://example.com/post')).toBe(true)
    expect(isExternalHref('http://example.com')).toBe(true)
  })

  it('treats a protocol-relative URL as external', () => {
    expect(isExternalHref('//cdn.example.com/asset.png')).toBe(true)
  })

  it('treats an in-document or in-site path as internal', () => {
    expect(isExternalHref('/blog')).toBe(false)
    expect(isExternalHref('#reading-list')).toBe(false)
    expect(isExternalHref('blog/post')).toBe(false)
  })

  it('treats mailto and tel as internal, since they open no browsing context', () => {
    expect(isExternalHref('mailto:hello@example.com')).toBe(false)
    expect(isExternalHref('tel:+84900000000')).toBe(false)
    expect(isExternalHref('sms:+84900000000')).toBe(false)
  })
})

describe('resolveLinkTarget', () => {
  it('routes an in-app destination and never marks it external', () => {
    expect(resolveLinkTarget({ to: '/blog' })).toEqual({
      kind: 'router',
      to: '/blog',
      href: undefined,
      target: undefined,
      rel: undefined,
      isExternal: false,
      opensInNewTab: false,
    })
  })

  it('ignores an isExternal override on a routed destination', () => {
    expect(resolveLinkTarget({ to: '/blog', isExternal: true }).isExternal).toBe(false)
  })

  it('pairs target=_blank with rel=noopener noreferrer, always', () => {
    const target = resolveLinkTarget({ href: 'https://example.com' })

    expect(target.target).toBe('_blank')
    expect(target.rel).toBe('noopener noreferrer')
  })

  it('never emits a target without the matching rel', () => {
    const cases = [
      { href: 'https://example.com' },
      { href: '/blog' },
      { href: 'mailto:hello@example.com' },
      { href: '/blog', isExternal: true },
      { to: '/blog' },
    ]

    for (const input of cases) {
      const target = resolveLinkTarget(input)

      expect(target.target === '_blank').toBe(target.rel === 'noopener noreferrer')
    }
  })

  it('opens a mail link in place rather than in a new tab', () => {
    const target = resolveLinkTarget({ href: 'mailto:hello@example.com' })

    expect(target.opensInNewTab).toBe(false)
    expect(target.target).toBeUndefined()
  })

  it('honours an explicit external override for an ambiguous href', () => {
    const target = resolveLinkTarget({ href: '/download/report.pdf', isExternal: true })

    expect(target.isExternal).toBe(true)
    expect(target.opensInNewTab).toBe(true)
  })

  it('flags a new-tab link so the component can say so out loud', () => {
    expect(resolveLinkTarget({ href: 'https://example.com' }).opensInNewTab).toBe(true)
    expect(resolveLinkTarget({ href: '/blog' }).opensInNewTab).toBe(false)
  })
})

/**
 * Location state is behaviour: the account screens carry the page a reader was
 * interrupted on, and the author archive resolves which author it is showing
 * from it. Dropping it silently is how an interrupted reader ends up back at the
 * home page instead of their article, so the rule is worth a test of its own.
 */
describe('routerLinkState', () => {
  it('carries state on a routed destination', () => {
    expect(routerLinkState('router', { from: '/blog/76' })).toEqual({ from: '/blog/76' })
  })

  it('carries nothing when the caller offered nothing', () => {
    expect(routerLinkState('router')).toBeUndefined()
  })

  /*
   * An href leaves the router, so there is nowhere for the state to be read
   * back. The prop type refuses the pairing; this is the same rule for a caller
   * that is not type checked, which would otherwise put the value on the anchor.
   */
  it('drops state handed to a document request', () => {
    expect(routerLinkState('anchor', { from: '/blog/76' })).toBeUndefined()
  })
})

/** DESIGN.md: "no meaning depends on hover", and status is never colour alone. */
describe('linkDecoration', () => {
  it('underlines an inline link at rest, not only on hover', () => {
    expect(linkDecoration('always').textDecoration).toBe('underline')
  })

  it('still underlines on hover when the link is otherwise unambiguous', () => {
    const decoration = linkDecoration('hover')

    expect(decoration.textDecoration).toBe('none')
    expect(decoration._hover.textDecoration).toBe('underline')
  })

  it('offsets the underline so descenders stay legible', () => {
    expect(linkDecoration('always').textUnderlineOffset).toBe('0.25em')
  })
})

/**
 * A primary navigational call to action - Home's "Explore the blog" - needs
 * button weight without becoming a button. `linkPresentation` is where that
 * weight is decided, and where the promise that it borrows rather than
 * reinvents the Button appearance is kept.
 */
describe('linkPresentation', () => {
  it('is an inline text link unless a weight says otherwise', () => {
    const presentation = linkPresentation('text')

    expect(presentation.kind).toBe('text')
    expect(presentation.variant).toBeUndefined()
    expect(presentation.tone).toBeUndefined()
    expect(presentation.decoration).toEqual(linkDecoration('always'))
  })

  it('carries the underline choice through at text weight', () => {
    expect(linkPresentation('text', 'hover').decoration).toEqual(linkDecoration('hover'))
  })

  it('borrows the Button variant of the tone it is named after', () => {
    expect(linkPresentation('primary').variant).toBe(buttonVariant('primary'))
    expect(linkPresentation('secondary').variant).toBe(buttonVariant('secondary'))
  })

  /*
   * CONVENTIONS.md rule 4: one visual owner per surface. At button weight the
   * variant owns fill, border, hover, press and focus, so the link contributes
   * no decoration at all - not "a decoration that happens to be blank".
   */
  it('hands every visual to the variant at button weight', () => {
    for (const weight of ['primary', 'secondary'] as const) {
      expect(linkPresentation(weight).decoration).toBeUndefined()
      expect(linkPresentation(weight).kind).toBe('button')
    }
  })

  it('ignores the underline choice at button weight rather than half-applying it', () => {
    expect(linkPresentation('primary', 'always')).toEqual(linkPresentation('primary', 'hover'))
  })

  it('names exactly one appearance for every weight', () => {
    const weights: readonly LinkWeight[] = ['text', 'primary', 'secondary']

    for (const weight of weights) {
      const presentation = linkPresentation(weight)

      // A weight is a text link or a button-weight one, never both and never
      // neither: the variant and the decoration are exclusive.
      expect(presentation.variant === undefined).toBe(presentation.decoration !== undefined)
    }
  })
})
