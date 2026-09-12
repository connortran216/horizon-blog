import { forwardRef } from 'react'
import { Flex, type FlexProps } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { typographyRecipe } from './typography.logic'

export interface MetadataProps extends Omit<FlexProps, 'as'> {
  /** `p` for a sentence of metadata, `ul`/`dl` when the items are a real list. */
  as?: 'p' | 'div' | 'span' | 'ul' | 'dl'
}

/**
 * Date, reading time, Series position and other article facts.
 *
 * It wraps rather than truncating: a Vietnamese date string plus "Part 3 of 11"
 * does not fit on a 375px phone, and dropping half of it is worse than two
 * lines. Separators between items belong to the caller, and must be real
 * content or `aria-hidden` decoration - never a `::before` that a screen reader
 * announces as a bullet.
 */
export const Metadata = forwardRef<HTMLElement, MetadataProps>(function Metadata(
  { as = 'p', ...rest },
  ref,
) {
  const { textStyle, color } = typographyRecipe('metadata')

  return (
    <Flex
      ref={ref}
      as={as}
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      gap={space[2]}
      textStyle={textStyle}
      color={color}
      listStyleType={as === 'ul' ? 'none' : undefined}
      {...rest}
    />
  )
})
