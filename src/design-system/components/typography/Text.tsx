import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import type { TextElement } from '../layout/semanticElements'
import { resolveTextElement, typographyRecipe, type TypographyRecipeName } from './typography.logic'

export interface TextProps extends Omit<BoxProps, 'as'> {
  /** Editorial role. Defaults to `body`. */
  recipe?: TypographyRecipeName
  /** Override the element the recipe would pick. Structure beats size. */
  as?: TextElement
  /** Truncate to a line count. Omit for text that must stay fully readable. */
  lineClamp?: number
}

/**
 * A run of text at a named editorial size. Colour comes from the recipe and can
 * be overridden per call - a `body` run inside an inverted surface still needs
 * to say so - but size and weight are the recipe's, not the caller's.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { recipe = 'body', as, lineClamp, ...rest },
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
      {...(lineClamp === undefined
        ? {}
        : {
            display: '-webkit-box',
            overflow: 'hidden',
            sx: { WebkitBoxOrient: 'vertical', WebkitLineClamp: lineClamp },
          })}
      {...rest}
    />
  )
})
