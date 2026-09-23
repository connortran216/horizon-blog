import { forwardRef, type ReactElement, type ReactNode } from 'react'
import {
  Box,
  Link as ChakraLink,
  VisuallyHidden,
  useStyleConfig,
  type LinkProps as ChakraLinkProps,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

import { reducedMotionQuery, space, transform, transitionFor } from '../../../theme/tokens'
import { controlSizing } from './control.logic'
import {
  linkPresentation,
  needsTouchSizing,
  resolveLinkTarget,
  routerLinkState,
  type LinkUnderline,
  type LinkWeight,
  type RouterLinkState,
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
  /**
   * Which way the trailing icon travels on hover. `forward` for a link that
   * goes somewhere else; `down` for one that scrolls the page - an arrow
   * pointing down should move down.
   */
  iconTravel?: 'forward' | 'down'
  /**
   * Marks a text-weight link as a section's or a card's action rather than a
   * link a reader meets mid-sentence - "View CV", "Forgot password?", the
   * lone link in an empty state. Standalone text links get the same 44px
   * touch floor a button-weight link gets, without adopting the Button fill,
   * border or focus treatment: the link still looks like a link, it is just
   * no longer sized like one word among many.
   *
   * Defaults to `false`, which is the inline case - a link inside a
   * paragraph. Setting this on an inline link is the regression this prop
   * exists to prevent: a 44px line box breaks the paragraph's line height for
   * every line it touches. See `needsTouchSizing` for why this cannot be
   * inferred instead of stated.
   *
   * Meaningless at `primary`/`secondary` weight, which already meets the
   * floor through the Button recipe - passing it there changes nothing, the
   * same way `underline` is ignored there.
   */
  standalone?: boolean
}

/**
 * Exactly one destination. A link with both a route and an href has two
 * destinations and no way to choose between them, so the type refuses it.
 *
 * `state` is part of the routed destination rather than a separate prop for the
 * same reason: location state only exists inside the router, so pairing it with
 * an `href` is a mistake the type can catch instead of a value that vanishes on
 * the way to another origin.
 */
export type ActionLinkProps = ActionLinkBase &
  (
    | {
        to: string
        href?: never
        /**
         * Handed straight to React Router and read back with
         * `useLocation().state`. `undefined` means "carry nothing".
         */
        state?: RouterLinkState
      }
    | { href: string; to?: never; state?: never }
  )

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
 * The routed branch carries React Router location state, which is behaviour
 * rather than decoration: the account screens pass the destination a reader was
 * interrupted on, and the author archive resolves which author it is showing
 * from it. The document branch cannot - see `routerLinkState`.
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
    state,
    isExternal,
    underline = 'always',
    weight = 'text',
    standalone = false,
    iconStart,
    iconEnd,
    iconTravel = 'forward',
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
   * navigational call to action is never the cramped case that `sm` exists for
   * - whether it borrows the Button variant at button weight or stays a plain
   * text link marked `standalone`. The measurements come from `controlSizing`,
   * the same call `Button` makes.
   */
  const sizing = controlSizing('md')
  const touchSized = needsTouchSizing(presentation.kind, standalone)

  /*
   * Directional icon travel, one of the approved motion behaviours: on hover
   * the icon moves a little way towards where the link goes - an arrow at the
   * end goes forward, one at the start goes back. The wrapper spans exist so
   * the transform lands on the icon alone and the text never shifts; the
   * distance is the hover lift's magnitude on the other axis. Reduced motion
   * takes the travel to zero below rather than to a faster snap.
   */
  const content = (
    <>
      {iconStart ? (
        <Box as="span" display="inline-flex" data-icon-travel="start" aria-hidden="true">
          {iconStart}
        </Box>
      ) : null}
      {children}
      {iconEnd ? (
        <Box
          as="span"
          display="inline-flex"
          data-icon-travel={iconTravel === 'down' ? 'down' : 'end'}
          aria-hidden="true"
        >
          {iconEnd}
        </Box>
      ) : null}
      {target.opensInNewTab ? <VisuallyHidden> ({newTabLabel})</VisuallyHidden> : null}
    </>
  )

  /*
   * Selectors have to travel in `sx`. A key such as `& > *` written as a plain
   * prop is not a style prop to Chakra, so it reaches the DOM as an attribute
   * name React refuses - which is what the `min-width` rule below used to do
   * silently, and why the long-URL fix it carries only started working when it
   * moved here. The icon travel needs the same route.
   */
  const nestedRules = {
    '& > *': { minWidth: 0 },
    '& [data-icon-travel]': { transition: transitionFor('transform', 'fast') },
    '&:hover [data-icon-travel="end"]': { transform: `translateX(${transform.iconTravel})` },
    '&:hover [data-icon-travel="start"]': { transform: `translateX(-${transform.iconTravel})` },
    '&:hover [data-icon-travel="down"]': { transform: `translateY(${transform.iconTravel})` },
    [`@media ${reducedMotionQuery}`]: {
      '&:hover [data-icon-travel]': { transform: 'none' },
    },
  }

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
            ...nestedRules,
            minHeight: sizing.minH,
            paddingInline: sizing.px,
            gap: sizing.gap,
            textStyle: sizing.textStyle,
          },
        }
      : touchSized
        ? /*
           * `standalone` at text weight. Plain style props rather than `sx`:
           * there is no Button recipe underneath to be outranked, and no fill,
           * border or focus treatment to add - `presentation.decoration` above
           * already owns every visual here, this only changes the box it sits
           * in. Height is the floor the audit found missing; width is the same
           * floor for content narrow enough to need it, which is why it is a
           * minimum rather than a fixed size - it never shrinks a link that is
           * already wider than 44px, such as every current standalone caller.
           */
          {
            minHeight: sizing.minH,
            minWidth: sizing.minW,
            sx: nestedRules,
          }
        : { sx: nestedRules }),
    ...rest,
  }

  if (target.kind === 'router' && target.to !== undefined) {
    return (
      <ChakraLink
        as={RouterLink}
        to={target.to}
        state={routerLinkState(target.kind, state)}
        {...shared}
      >
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
