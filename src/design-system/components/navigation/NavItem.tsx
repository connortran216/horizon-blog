import { forwardRef, type MouseEvent, type ReactElement, type ReactNode } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'

import { componentTokens, fontWeights, radii, space } from '../../../theme/tokens'
import { controlSizing } from '../actions/control.logic'
import { navItemElement, navItemState } from './navigation.logic'

interface NavItemBase extends Omit<BoxProps, 'as' | 'children' | 'onClick'> {
  children: ReactNode
  icon?: ReactElement
  isDisabled?: boolean
  onClick?: (event: MouseEvent<HTMLElement>) => void
}

export type NavItemProps = NavItemBase &
  (
    | {
        /** In-app route. Current state comes from the router, not from a prop. */
        to: string
        href?: never
        isCurrent?: never
      }
    | {
        /** External destination. Current state is the caller's to determine. */
        href: string
        to?: never
        isCurrent?: boolean
      }
    | {
        /** In-page command - a tab, a filter. Renders a button. */
        to?: never
        href?: never
        isCurrent?: boolean
      }
  )

/**
 * One entry in a navigation set.
 *
 * A route entry renders React Router's `NavLink`, which writes
 * `aria-current="page"` itself when the route matches, so the marked item can
 * never drift out of sync with the URL. Everything else renders an `a` or a
 * `button` and sets the same attribute from `isCurrent`. There is no branch that
 * produces a clickable `div`.
 *
 * All three cases are then styled by the same rule. Chakra's `_activeLink`
 * pseudo-selector is `&[aria-current=page]`, so the attribute that assistive
 * technology reads is literally the selector that draws the indicator - the two
 * cannot disagree.
 *
 * Hover only tints the background, which means nothing on its own. The current
 * item is marked by `aria-current` and by a 2px bar that is always in the DOM at
 * a fixed size and only changes opacity, so navigating never moves the items
 * beside it.
 */
export const NavItem = forwardRef<HTMLElement, NavItemProps>(function NavItem(
  { to, href, isCurrent = false, isDisabled = false, icon, children, onClick, ...rest },
  ref,
) {
  const element = navItemElement({ to, href })
  const sizing = controlSizing('md')
  const restState = navItemState({ isDisabled })
  const currentState = navItemState({ isCurrent: true, isDisabled })

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      event.preventDefault()

      return
    }

    onClick?.(event)
  }

  const shared: BoxProps = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: sizing.gap,
    minH: sizing.minH,
    px: space[3],
    borderRadius: componentTokens.control.radius,
    textStyle: sizing.textStyle,
    fontWeight: fontWeights.medium,
    textDecoration: 'none',
    color: restState.color,
    transition: restState.transition,
    onClick: handleClick,
    'aria-disabled': restState['aria-disabled'],
    _hover: isDisabled ? {} : { bg: componentTokens.header.itemHoverBg },
    _activeLink: {
      color: currentState.color,
      '& [data-nav-indicator]': { opacity: currentState.indicatorOpacity },
    },
    ...rest,
  }

  const content = (
    <>
      {icon === undefined ? null : (
        <Box as="span" aria-hidden="true" display="inline-flex">
          {icon}
        </Box>
      )}
      {children}
      <Box
        data-nav-indicator=""
        aria-hidden="true"
        position="absolute"
        left={space[3]}
        right={space[3]}
        bottom="0"
        height="2px"
        borderRadius={radii.tag}
        bg={restState.indicatorColor}
        opacity={restState.indicatorOpacity}
        transition={restState.transition}
      />
    </>
  )

  if (element === 'router-link') {
    return (
      <Box ref={ref} as={NavLink} to={to} {...shared}>
        {content}
      </Box>
    )
  }

  if (element === 'anchor') {
    return (
      <Box
        ref={ref}
        as="a"
        href={isDisabled ? undefined : href}
        aria-current={isCurrent ? 'page' : undefined}
        {...shared}
      >
        {content}
      </Box>
    )
  }

  return (
    <Box
      ref={ref}
      as="button"
      type="button"
      disabled={isDisabled}
      aria-current={isCurrent ? 'page' : undefined}
      {...shared}
    >
      {content}
    </Box>
  )
})
