/**
 * How a link decides what it is.
 *
 * Two questions, both of which are wrong often enough to be worth isolating:
 * whether a destination is inside the app (a router navigation) or outside it (a
 * document request), and whether a link that leaves the site says so.
 */

export type LinkKind = 'router' | 'anchor'

export interface LinkTargetInput {
  /** In-app route. Takes precedence: an in-app route is never external. */
  readonly to?: string
  /** Absolute URL, `mailto:`, `tel:`, or a same-document `#fragment`. */
  readonly href?: string
  /** Force the external treatment for an href the heuristic cannot judge. */
  readonly isExternal?: boolean
}

export interface LinkTargetOutput {
  readonly kind: LinkKind
  readonly to: string | undefined
  readonly href: string | undefined
  readonly target: '_blank' | undefined
  readonly rel: 'noopener noreferrer' | undefined
  readonly isExternal: boolean
  /** True when the link needs a spoken "opens in a new tab" suffix. */
  readonly opensInNewTab: boolean
}

const schemeWithoutNavigation = ['mailto:', 'tel:', 'sms:']

/**
 * An href is external when it names a host: an absolute URL or a
 * protocol-relative one. A fragment, a root-relative path or a `mailto:` is not
 * - the first two stay in the document, and the third opens a mail client
 * rather than a browsing context.
 */
export function isExternalHref(href: string): boolean {
  if (schemeWithoutNavigation.some((scheme) => href.startsWith(scheme))) {
    return false
  }

  return href.startsWith('//') || /^[a-z][a-z0-9+.-]*:\/\//i.test(href)
}

/**
 * `rel="noopener noreferrer"` rides with every `target="_blank"` and is not
 * optional: without `noopener` the opened document gets a handle on this one
 * through `window.opener`.
 */
export function resolveLinkTarget({ to, href, isExternal }: LinkTargetInput): LinkTargetOutput {
  if (to !== undefined) {
    return {
      kind: 'router',
      to,
      href: undefined,
      target: undefined,
      rel: undefined,
      isExternal: false,
      opensInNewTab: false,
    }
  }

  const external = isExternal ?? (href === undefined ? false : isExternalHref(href))
  const newTab =
    external && href !== undefined && !schemeWithoutNavigation.some((s) => href.startsWith(s))

  return {
    kind: 'anchor',
    to: undefined,
    href,
    target: newTab ? '_blank' : undefined,
    rel: newTab ? 'noopener noreferrer' : undefined,
    isExternal: external,
    opensInNewTab: newTab,
  }
}

export type LinkUnderline = 'always' | 'hover'

export interface LinkDecoration {
  readonly textDecoration: 'underline' | 'none'
  readonly textUnderlineOffset: string
  readonly _hover: { textDecoration: 'underline' | 'none' }
}

/**
 * Inline links underline at rest. Colour alone does not distinguish a link from
 * emphasised text for a reader who cannot separate the two hues, and an
 * underline that only appears on hover is invisible to a touch user entirely.
 *
 * `hover` exists for links that are already unambiguous by position - a nav
 * item, a card that is one big link - where a permanent underline would be
 * noise. It is a deliberate opt-out, not the default.
 */
export function linkDecoration(underline: LinkUnderline): LinkDecoration {
  return {
    textDecoration: underline === 'always' ? 'underline' : 'none',
    textUnderlineOffset: '0.25em',
    _hover: { textDecoration: 'underline' },
  }
}
