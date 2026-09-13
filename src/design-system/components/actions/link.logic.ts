/**
 * How a link decides what it is.
 *
 * Three questions, all of which are wrong often enough to be worth isolating:
 * whether a destination is inside the app (a router navigation) or outside it (a
 * document request), whether a link that leaves the site says so, and how much
 * visual weight it carries.
 */

import { buttonVariant, type ButtonTone, type ButtonVariant } from './control.logic'

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

/* -------------------------------------------------------------------------- */
/* Router state                                                               */
/* -------------------------------------------------------------------------- */

/**
 * What a router link carries alongside its destination.
 *
 * Opaque on purpose. React Router stores the value and hands it back through
 * `useLocation().state`, and the shapes in this app have nothing in common - the
 * account screens pass the post-authentication destination, the reader passes
 * the author id the archive resolves itself from. Naming a union of them here
 * would make the design system the place every feature's navigation contract is
 * registered, which is the opposite of what a primitive is for.
 */
export type RouterLinkState = unknown

/**
 * State rides on the router branch and nowhere else.
 *
 * There is no such thing as location state on a document request: an `href`
 * leaves the router entirely, so a value handed to one would be dropped
 * silently at exactly the moment a reader is sent somewhere else. The prop type
 * already refuses the pairing at compile time; this is the same rule at
 * runtime, so a caller that is not type checked loses the state instead of
 * leaking `state="[object Object]"` onto an anchor.
 */
export function routerLinkState(
  kind: LinkKind,
  state?: RouterLinkState,
): RouterLinkState | undefined {
  return kind === 'router' ? state : undefined
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

/* -------------------------------------------------------------------------- */
/* Weight                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * How much a link weighs.
 *
 * `text` is the inline link the reader meets inside a sentence. The other two
 * are the navigational call to action - "Explore the blog" - which is a link by
 * every semantic that matters (it has a destination, it can be copied, opened
 * in a new tab, middle-clicked) and a button by every semantic that does not.
 *
 * The weight is on the link rather than on `Button` on purpose. `Button` is
 * always a native `button` and does not expose `as`, which is what stops an
 * action quietly becoming a link and a link quietly becoming a fake button;
 * `ShareAction` is the standing evidence for the cost of going the other way,
 * where Chakra's polymorphism could not see through this system's narrowed
 * props and the trigger had to be widened to `ElementType` to compile. Nothing
 * here needs widening: a weighted link is still a link, so it keeps the link's
 * own props and its own type.
 */
export type LinkWeight = 'text' | 'primary' | 'secondary'

export interface LinkPresentation {
  /** `text` draws itself; `button` borrows the Button variant named by `tone`. */
  readonly kind: 'text' | 'button'
  readonly tone: ButtonTone | undefined
  readonly variant: ButtonVariant | undefined
  /**
   * `undefined` at button weight, and that is the point rather than an
   * omission: `CONVENTIONS.md` rule 4 allows one visual owner per surface, and
   * at button weight that owner is the Button variant - fill, border, radius,
   * hover, press and focus all come from it. A link decoration reaching in over
   * the top would be the second owner. The affordance survives: a filled or
   * outlined control is unambiguous without a line under its label, which is
   * the same reason `underline="hover"` exists for a nav item.
   */
  readonly decoration: LinkDecoration | undefined
}

/**
 * What a weight means, in one place, so the link and its tests agree.
 *
 * The two weighted values are spelled the same as the `Button` tones they map
 * to, and the mapping goes through `buttonVariant`, so a link with button
 * weight and a button with the same tone cannot drift apart: retoning the
 * system is still the single edit `control.logic.ts` promises.
 */
export function linkPresentation(
  weight: LinkWeight,
  underline: LinkUnderline = 'always',
): LinkPresentation {
  if (weight === 'text') {
    return {
      kind: 'text',
      tone: undefined,
      variant: undefined,
      decoration: linkDecoration(underline),
    }
  }

  return {
    kind: 'button',
    tone: weight,
    variant: buttonVariant(weight),
    decoration: undefined,
  }
}
