/**
 * Horizon Design System v2 - the media box.
 *
 * `MediaFrame` reserves the space. It is the single visual owner of the media
 * surface - aspect ratio, clipping and the ground colour underneath - and
 * nothing rendered inside it sets any of those again.
 *
 * The corners are its too, unless it says otherwise. `radius="container"` is the
 * frame declining them: it renders square and the surface around it draws and
 * clips the corners the reader sees. That is how a cover bleeds to a card's edge
 * without either component overriding the other from outside - the frame says
 * what it owns, in its own API, and there is still exactly one owner.
 *
 * The aspect ratio is required, and `mediaFrameStyle` takes no state, so the
 * box is the same size whether the image is loading, ready, absent, failed or
 * being retried. That is the whole reason this component exists separately from
 * `ResponsiveImage`: a caller can put anything in a frame - a video, a diagram,
 * a default cover - and still get a layout that does not move.
 */

import { Box, type BoxProps } from '@chakra-ui/react'

import { mediaFrameStyle, type MediaFrameStyleInput } from './media.logic'

export interface MediaFrameProps extends Omit<BoxProps, 'aspectRatio'>, MediaFrameStyleInput {}

export function MediaFrame({ aspectRatio, radius = 'card', children, ...rest }: MediaFrameProps) {
  const style = mediaFrameStyle({ aspectRatio, radius })

  return (
    <Box
      aspectRatio={style.aspectRatio}
      borderRadius={style.borderRadius}
      overflow={style.overflow}
      position={style.position}
      bg={style.backgroundColor}
      width={style.width}
      {...rest}
    >
      {children}
    </Box>
  )
}
