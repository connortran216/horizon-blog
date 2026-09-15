import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { componentTokens } from '../../../theme/tokens'
import type { RegionElement } from '../layout/semanticElements'
import { surfaceInteraction, surfaceStyle, type SurfaceDepth } from './surface.logic'

export interface SurfaceProps extends Omit<BoxProps, 'as'> {
  /** Semantic element. `article` for a post card, `aside` for a side panel. */
  as?: RegionElement
  /**
   * The depth role this surface plays. `flat` sits on the page, `raised` lifts
   * off it, `feature` is the layered editorial treatment. Never a shadow value.
   */
  depth?: SurfaceDepth
  /**
   * Add hover and press depth. Only set this when the surface itself is inside
   * a link or button - a hover state on something you cannot activate is a lie.
   */
  isInteractive?: boolean
  /** Turn off the built-in padding when the surface holds full-bleed media. */
  padded?: boolean
}

/**
 * The system's one owner of border, radius, shadow, clipping and hover depth.
 *
 * A component either uses a Surface and lets it own those five things, or it
 * owns them itself and does not use a Surface. Setting `borderRadius` on a
 * Surface from outside is the failure mode this component exists to prevent -
 * it is possible through `BoxProps`, and it is a review finding when it happens.
 *
 * Because it clips (`surfaceClipsChildren`), a Surface can also own the corners
 * of a child that has declined its own - a `MediaFrame` at `radius="container"`.
 * That is a full-bleed cover: the picture reaches the Surface's edge and the
 * Surface's radius is still the only radius in play. Pair it with
 * `padded={false}` and give the padding to the copy block beneath the media,
 * the way the approved prototype's `.article-card` / `.card-copy` do.
 */
export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface(
  { as = 'div', depth = 'flat', isInteractive = false, padded = true, ...rest },
  ref,
) {
  const style = surfaceStyle(depth)

  return (
    <Box
      ref={ref}
      as={as}
      bg={style.bg}
      borderStyle="solid"
      borderWidth={style.borderWidth}
      borderColor={style.borderColor}
      borderRadius={style.borderRadius}
      boxShadow={style.boxShadow}
      overflow={style.overflow}
      p={padded ? componentTokens.card.padding : undefined}
      {...(isInteractive ? surfaceInteraction() : {})}
      {...rest}
    />
  )
})
