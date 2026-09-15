/**
 * Horizon Design System v2 - the Series plate.
 *
 * A Series has a book identity, and this is where it comes from. Two things
 * separate it from a post cover: it is drawn on the feature radius rather than
 * the card radius, and it carries a spine - a bar down the leading edge in the
 * Series connector colour, which is the same line that runs between the parts
 * in `PartList`.
 *
 * The spine is decoration and is hidden from assistive technology. What it does
 * for a sighted reader is make a shelf of Series unmistakable next to a grid of
 * posts, which is the whole point of a distinct identity.
 */

import { Box, type BoxProps } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { ResponsiveImage } from '../../components/media'
import { seriesPresentation, type SeriesCoverImage } from './series.logic'

export interface SeriesCoverProps extends Omit<BoxProps, 'children'> {
  cover?: SeriesCoverImage | null
  /** Shown in the frame when there is no artwork. */
  title: string
  /** Defaults to the wide editorial plate the Series shelf uses. */
  aspectRatio?: string
  sizes?: string
  /** Drop the spine where the plate is already inside a bordered card. */
  withSpine?: boolean
}

export function SeriesCover({
  cover,
  title,
  aspectRatio = '16 / 10',
  sizes = '(min-width: 801px) 50vw, 100vw',
  withSpine = true,
  ...rest
}: SeriesCoverProps) {
  const presentation = seriesPresentation()

  return (
    <Box position="relative" {...rest}>
      <ResponsiveImage
        aspectRatio={aspectRatio}
        radius="feature"
        src={cover?.src}
        sizes={sizes}
        alt={cover?.alt ?? title}
        task="the Series artwork"
        absentCaption={title}
      />
      {withSpine ? (
        <Box
          aria-hidden="true"
          position="absolute"
          insetBlock={space[6]}
          insetInlineStart={0}
          width={space[1]}
          borderRadius={presentation.coverRadius}
          bg={presentation.connectorActive}
          pointerEvents="none"
        />
      ) : null}
    </Box>
  )
}
