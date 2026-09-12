import { forwardRef } from 'react'
import { Grid as ChakraGrid, type GridProps as ChakraGridProps } from '@chakra-ui/react'

import {
  gridColumnTemplate,
  layoutBreakpoints,
  stackGap,
  type GridColumns,
  type LayoutBreakpoint,
} from './layout.logic'
import type { CollectionElement } from './semanticElements'

export interface GridProps extends Omit<ChakraGridProps, 'as' | 'gap' | 'templateColumns'> {
  /** Semantic element. `ul` when the cells are a real list. */
  as?: CollectionElement
  /** Desktop column count. One to four; wider grids are a pattern's problem. */
  columns?: GridColumns
  /** Spacing scale key: 1, 2, 3, 4, 6, 8, 12, 16 or 24. */
  gap?: Parameters<typeof stackGap>[0]
  /** Breakpoint at or above which the columns appear. Below it: one column. */
  collapseAt?: LayoutBreakpoint
}

/**
 * Two-dimensional arrangement with token spacing. Tracks are always
 * `minmax(0, 1fr)` so an unbreakable child (a long URL, a code span) scrolls
 * inside its own cell instead of widening the document.
 */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  { as = 'div', columns = 2, gap = 6, collapseAt = layoutBreakpoints.columns, ...rest },
  ref,
) {
  return (
    <ChakraGrid
      ref={ref}
      as={as}
      templateColumns={gridColumnTemplate(columns, collapseAt)}
      gap={stackGap(gap)}
      listStyleType={as === 'ul' || as === 'ol' ? 'none' : undefined}
      {...rest}
    />
  )
})
