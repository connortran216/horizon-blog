import { describe, expect, it } from 'vitest'

import { isExternalHref, linkDecoration, resolveLinkTarget } from './link.logic'

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
