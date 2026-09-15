import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { typographyRecipe } from './typography.logic'

export interface EyebrowProps extends Omit<BoxProps, 'as'> {
  /** `span` inside a heading, `p` as a standalone kicker. */
  as?: 'span' | 'p' | 'div'
}

/**
 * The small uppercase kicker above a section or feature heading.
 *
 * It is not a heading and must not be one: it repeats or categorises the
 * heading below it, so putting it in the outline would give every section two
 * entries. Nest it in the heading as a `span` when it reads as part of the
 * title.
 */
export const Eyebrow = forwardRef<HTMLElement, EyebrowProps>(function Eyebrow(
  { as = 'span', ...rest },
  ref,
) {
  const { textStyle } = typographyRecipe('metadata')

  return (
    <Box
      ref={ref}
      as={as}
      display="block"
      textStyle={textStyle}
      textTransform="uppercase"
      letterSpacing="wider"
      color="text.muted"
      {...rest}
    />
  )
})
