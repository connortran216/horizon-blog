import { describe, expect, it } from 'vitest'

import { getTrackedLinkUrl } from './reader-session.links'

describe('reader session link helpers', () => {
  it('extracts http links from delegated click targets without blocking navigation', () => {
    const anchor = {
      closest: (selector: string) =>
        selector === 'a[href]'
          ? {
              href: 'https://example.com/resource',
              getAttribute: () => 'https://example.com/resource',
            }
          : null,
    } as unknown as Element

    expect(getTrackedLinkUrl(anchor)).toBe('https://example.com/resource')
  })

  it('ignores hash and non-http links', () => {
    const hashAnchor = {
      closest: () => ({ href: 'https://blog.example/#section', getAttribute: () => '#section' }),
    } as unknown as Element
    const mailAnchor = {
      closest: () => ({
        href: 'mailto:hello@example.com',
        getAttribute: () => 'mailto:hello@example.com',
      }),
    } as unknown as Element

    expect(getTrackedLinkUrl(hashAnchor)).toBeNull()
    expect(getTrackedLinkUrl(mailAnchor)).toBeNull()
  })
})
