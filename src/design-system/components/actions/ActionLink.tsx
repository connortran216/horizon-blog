import { forwardRef, type ReactElement, type ReactNode } from 'react'
import {
  Link as ChakraLink,
  VisuallyHidden,
  useStyleConfig,
  type LinkProps as ChakraLinkProps,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

import { space } from '../../../theme/tokens'
import { controlSizing } from './control.logic'
import {
  linkPresentation,
  resolveLinkTarget,
  type LinkUnderline,
  type LinkWeight,
} from './link.logic'

interface ActionLinkBase extends Omit<
  ChakraLinkProps,
  | 'href'
  | 'isExternal'
  | 'as'
  | 'children'
  | 'target'
  | 'rel'
  // The Link theme's own theming props. This component picks its appearance
  // from `weight`, and a second, unrelated `variant` arriving from a caller
  // would be a quiet way to overrule it.
  | 'variant'
  | 'size'
  | 'colorScheme'
  | 'styleConfig'
> {
  children: ReactNode
  underline?: LinkUnderline
  iconStart?: ReactElement
  iconEnd?: ReactElement
  /** Force the external treatment when the href alone cannot be judged. */
  isExternal?: boolean
  /** Spoken suffix for a link that opens a new tab. */
  newTabLabel?: string
  /**
   * How much the link weighs. `text` is the inline link and the default;
   * `primary` and `secondary` give a navigational call to action the weight of
   * the `Button` tone of the same name without making it a button.
   *
   * `underline` is ignored at button weight - see `linkPresentation`.
   */
  weight?: LinkWeight
}

/**
 * Exactly one destination. A link with both a route and an href has two
 * destinations and no way to choose between them, so the type refuses it.
 */
export type ActionLinkProps = ActionLinkBase &
  ({ to: string; href?: never } | { href: string; to?: never })

/**
 * A link. Always a real `a` with a real destination - the router variant
 * renders React Router's `Link`, which is also an `a`, so middle-click, copy
 * link address and open-in-new-tab all work. That is true at every weight: a
 * primary-weight call to action is a link wearing the Button variant, not a
 * button that navigates.
 *
 * An action that changes state rather than navigating is a `Button`, even when
 * it is styled quietly. A link that runs `preventDefault` and calls a handler is
 * the single most common accessibility defect in a component library, and this
 * component has no prop that would let you build one.
 *
 * Focus is the global `*:focus-visible` rule in both branches. Neither writes
 * `_focus`, so the ring a reader tabs onto is the system's own - the theme's
 * Button `_focusVisible` where the weight borrows it, and the global rule
 * otherwise.
 */
export const ActionLink = forwardRef<HTMLAnchorElement, ActionLinkProps>(function ActionLink(
  {
    to,
    href,
    isExternal,
    underline = 'always',
    weight = 'text',
    iconStart,
    iconEnd,
    newTabLabel = 'opens in a new tab',
    children,
    ...rest
  },
  ref,
) {
  const target = resolveLinkTarget({ to, href, isExternal })
  const presentation = linkPresentation(weight, underline)
  /*
   * The Button recipe, resolved from the theme rather than restated here, so a
   * primary-weight link and a primary Button are the same object dressed by the
   * same tokens. A text link does not use it; the hook is called anyway because
   * hooks cannot be conditional, and resolving an unused recipe is cheap.
   *
   * It has to arrive as `sx` rather than as style props: Chakra applies `sx`
   * last, so this is the only layer that outranks the Link theme's own base
   * style - which is what an inline link, not a call to action, is written for.
   */
  const buttonRecipe = useStyleConfig('Button', { variant: presentation.variant })
  /*
   * `md` is the 44x44 touch target of the accessibility floor, and a
   * navigational call to action is never the cramped case that `sm` exists for.
   * The measurements come from `controlSizing`, the same call `Button` makes.
   */
  const sizing = controlSizing('md')

  const content = (
    <>
      {iconStart}
      {children}
      {iconEnd}
      {target.opensInNewTab ? <VisuallyHidden> ({newTabLabel})</VisuallyHidden> : null}
    </>
  )

  const shared = {
    ref,
    display: 'inline-flex',
    alignItems: 'center',
    gap: space[2],
    /*
     * `inline-flex` is here so an icon can sit on the text's baseline, but it
     * costs the link its ability to wrap: a flex box shrinks to fit its content
     * and its items refuse to shrink below theirs, so a long unbroken
     * destination grows past its container and gets clipped. Measured on the CV
     * at 375px, a project URL rendered 672px wide inside a 343px card and the
     * reader lost half the address with no way to reach it.
     *
     * `minWidth: 0` on the items restores the shrink; `overflowWrap: anywhere`
     * gives the break somewhere to land. Ordinary short links are unaffected -
     * they never reach their container's edge.
     */
    minWidth: 0,
    overflowWrap: 'anywhere' as const,
    '& > *': { minWidth: 0 },
    ...presentation.decoration,
    ...(presentation.kind === 'button'
      ? {
          justifyContent: 'center',
          /*
           * One object, because `sx` replaces rather than merges: the recipe's
           * own `_hover`, `_active` and `_focusVisible` survive precisely
           * because nothing outside this object competes for them. The three
           * measurements written over the recipe are the system's control
           * sizing, which is where `Button` differs from Chakra's defaults too.
           */
          sx: {
            ...buttonRecipe,
            minHeight: sizing.minH,
            paddingInline: sizing.px,
            gap: sizing.gap,
            textStyle: sizing.textStyle,
          },
        }
      : {}),
    ...rest,
  }

  if (target.kind === 'router' && target.to !== undefined) {
    return (
      <ChakraLink as={RouterLink} to={target.to} {...shared}>
        {content}
      </ChakraLink>
    )
  }

  return (
    <ChakraLink href={target.href} target={target.target} rel={target.rel} {...shared}>
      {content}
    </ChakraLink>
  )
})
