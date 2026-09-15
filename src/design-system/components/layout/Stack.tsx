import { forwardRef } from 'react'
import { Flex, type FlexProps } from '@chakra-ui/react'

import {
  stackFlexDirection,
  stackGap,
  type LayoutBreakpoint,
  type StackDirection,
} from './layout.logic'
import type { CollectionElement } from './semanticElements'

export interface StackProps extends Omit<FlexProps, 'as' | 'direction' | 'gap'> {
  /** Semantic element. `ul` / `ol` when the children are a real list. */
  as?: CollectionElement
  direction?: StackDirection
  /** Spacing scale key: 1, 2, 3, 4, 6, 8, 12, 16 or 24. */
  gap?: Parameters<typeof stackGap>[0]
  /**
   * Breakpoint at or above which a row stays a row. Below it the stack is a
   * column. Pass `undefined` to keep a row at every width - only safe for a
   * couple of short controls.
   */
  collapseAt?: LayoutBreakpoint
}

/**
 * One-dimensional arrangement with token spacing. It sets direction, gap and
 * nothing else; alignment and wrapping stay open through `FlexProps` because
 * they are composition decisions, not system decisions.
 */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { as = 'div', direction = 'column', gap = 4, collapseAt = 'md', ...rest },
  ref,
) {
  return (
    <Flex
      ref={ref}
      as={as}
      flexDirection={stackFlexDirection(direction, collapseAt)}
      gap={stackGap(gap)}
      listStyleType={as === 'ul' || as === 'ol' ? 'none' : undefined}
      {...rest}
    />
  )
})
