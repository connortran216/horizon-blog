import { forwardRef, type ReactElement, type ReactNode } from 'react'
import {
  Link as ChakraLink,
  VisuallyHidden,
  type LinkProps as ChakraLinkProps,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

import { space } from '../../../theme/tokens'
import { linkDecoration, resolveLinkTarget, type LinkUnderline } from './link.logic'

interface ActionLinkBase extends Omit<
  ChakraLinkProps,
  'href' | 'isExternal' | 'as' | 'children' | 'target' | 'rel'
> {
  children: ReactNode
  underline?: LinkUnderline
  iconStart?: ReactElement
  iconEnd?: ReactElement
  /** Force the external treatment when the href alone cannot be judged. */
  isExternal?: boolean
  /** Spoken suffix for a link that opens a new tab. */
  newTabLabel?: string
}

/**
 * Exactly one destination. A link with both a route and an href has two
 * destinations and no way to choose between them, so the type refuses it.
 */
export type ActionLinkProps = ActionLinkBase &
  ({ to: string; href?: never } | { href: string; to?: never })

/**
 * A text link. Always a real `a` with a real destination - the router variant
 * renders React Router's `Link`, which is also an `a`, so middle-click, copy
 * link address and open-in-new-tab all work.
 *
 * An action that changes state rather than navigating is a `Button`, even when
 * it is styled quietly. A link that runs `preventDefault` and calls a handler is
 * the single most common accessibility defect in a component library, and this
 * component has no prop that would let you build one.
 */
export const ActionLink = forwardRef<HTMLAnchorElement, ActionLinkProps>(function ActionLink(
  {
    to,
    href,
    isExternal,
    underline = 'always',
    iconStart,
    iconEnd,
    newTabLabel = 'opens in a new tab',
    children,
    ...rest
  },
  ref,
) {
  const target = resolveLinkTarget({ to, href, isExternal })
  const decoration = linkDecoration(underline)

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
    ...decoration,
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
