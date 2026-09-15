import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { containerMaxWidth } from './layout.logic'
import type { RegionElement } from './semanticElements'

export interface ProseMeasureProps extends Omit<BoxProps, 'as'> {
  /** Semantic element. `article` for a whole post, `div` for a fragment. */
  as?: RegionElement
  /** Centre the measure in its parent. Off by default: reading columns are left-aligned. */
  centered?: boolean
}

/**
 * Caps a run of text at the 68ch reading measure. It does not set type size -
 * that is `Text recipe="prose"` - because a measure and a type ramp are two
 * different decisions and a caller sometimes wants only one of them.
 *
 * `overflowWrap: anywhere` is here rather than in the prose recipe: it is the
 * measure that a long unbroken token would otherwise break out of.
 */
export const ProseMeasure = forwardRef<HTMLElement, ProseMeasureProps>(function ProseMeasure(
  { as = 'div', centered = false, ...rest },
  ref,
) {
  return (
    <Box
      ref={ref}
      as={as}
      width="100%"
      maxW={containerMaxWidth('prose')}
      mx={centered ? 'auto' : undefined}
      overflowWrap="anywhere"
      {...rest}
    />
  )
})
