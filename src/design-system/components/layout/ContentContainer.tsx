import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { containerGutter, containerMaxWidth, type ContainerWidth } from './layout.logic'
import type { RegionElement } from './semanticElements'

export interface ContentContainerProps extends Omit<BoxProps, 'as'> {
  /** Semantic element. `main` and `header` are the common overrides. */
  as?: RegionElement
  /** `content` is the 1120px frame, `prose` the reading measure. */
  width?: ContainerWidth
  /** Drop the side gutters when an ancestor already provides them. */
  gutter?: boolean
}

/**
 * Horizontal frame. It centres its children and owns the side gutters, and it
 * owns nothing else - no background, no border, no padding on the block axis.
 * Vertical rhythm belongs to `Section`.
 */
export const ContentContainer = forwardRef<HTMLElement, ContentContainerProps>(
  function ContentContainer({ as = 'div', width = 'content', gutter = true, ...rest }, ref) {
    return (
      <Box
        ref={ref}
        as={as}
        width="100%"
        maxW={containerMaxWidth(width)}
        mx="auto"
        px={gutter ? containerGutter() : undefined}
        {...rest}
      />
    )
  },
)
