import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import type { HeadingElement } from '../layout/semanticElements'
import { resolveTextElement, typographyRecipe, type HeadingRecipeName } from './typography.logic'

export interface HeadingProps extends Omit<BoxProps, 'as'> {
  /** Editorial role. Defaults to `sectionTitle`. */
  recipe?: HeadingRecipeName
  /**
   * Heading rank. Set it whenever the visual size and the document outline
   * disagree - which is most of the time on a real page.
   */
  as?: HeadingElement
}

/**
 * A heading. The `as` prop is restricted to `h1`-`h6`, so a heading recipe can
 * never accidentally render as a `div` and drop out of the document outline.
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { recipe = 'sectionTitle', as, ...rest },
  ref,
) {
  const { element } = resolveTextElement(recipe, as)
  const { textStyle, color } = typographyRecipe(recipe)

  return (
    <Box
      ref={ref}
      as={element}
      textStyle={textStyle}
      color={color}
      letterSpacing="tight"
      {...rest}
    />
  )
})
