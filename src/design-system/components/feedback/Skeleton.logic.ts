/**
 * Horizon Design System v2 - skeleton dimensions.
 *
 * A skeleton exists to stop the page moving when data lands, so its size cannot
 * be a guess. Every shape derives its dimension from the token that the real
 * content will use: a text skeleton is exactly as tall as the line height of
 * the type ramp entry it stands in for, a media skeleton holds the same aspect
 * ratio as the image, a block skeleton takes a spacing token.
 *
 * That is also why there is no free-form `height` prop. A caller who can type
 * `height="42px"` will, and the skeleton will then be 42px while the content is
 * 46px, which is the exact jump this component exists to prevent.
 */

import { radii, space, typeScale } from '../../../theme/tokens'
import type { SpaceToken, TypeScaleToken } from '../../../theme/tokens'

export type SkeletonShape =
  | {
      readonly shape: 'text'
      /** The type ramp entry the real text will use. */
      readonly textStyle: TypeScaleToken
      readonly lines?: number
      /** Ragged last line, as a CSS width. Defaults to 65%. */
      readonly lastLineWidth?: string
    }
  | {
      readonly shape: 'block'
      readonly height: SpaceToken
      readonly width?: string
    }
  | {
      readonly shape: 'media'
      /** Same value the real `MediaFrame` will hold, e.g. `'16 / 9'`. */
      readonly aspectRatio: string
      readonly width?: string
    }
  | {
      readonly shape: 'circle'
      readonly size: SpaceToken
    }

/** Responsive height, in the `{ base, sm }` shape Chakra takes directly. */
export interface ResponsiveHeight {
  readonly base: string
  readonly sm: string
}

export interface SkeletonLine {
  readonly height: ResponsiveHeight
  readonly width: string
}

export interface SkeletonDimensions {
  readonly lines: readonly SkeletonLine[]
  readonly gap: string
  readonly width?: string
  readonly height?: ResponsiveHeight | string
  readonly aspectRatio?: string
  readonly borderRadius: string
}

const DEFAULT_LAST_LINE_WIDTH = '65%'

export function resolveSkeletonDimensions(shape: SkeletonShape): SkeletonDimensions {
  switch (shape.shape) {
    case 'text': {
      const ramp = typeScale[shape.textStyle]
      const height: ResponsiveHeight = { base: ramp.lineHeight[0], sm: ramp.lineHeight[1] }
      const count = Math.max(1, Math.floor(shape.lines ?? 1))
      const lastWidth = shape.lastLineWidth ?? DEFAULT_LAST_LINE_WIDTH

      return {
        lines: Array.from({ length: count }, (_unused, index) => ({
          height,
          // A single line is not ragged: there is no paragraph to suggest.
          width: count > 1 && index === count - 1 ? lastWidth : '100%',
        })),
        gap: space[2],
        width: '100%',
        borderRadius: radii.tag,
      }
    }

    case 'block':
      return {
        lines: [],
        gap: space[2],
        width: shape.width ?? '100%',
        height: space[shape.height],
        borderRadius: radii.control,
      }

    case 'media':
      return {
        lines: [],
        gap: space[2],
        width: shape.width ?? '100%',
        aspectRatio: shape.aspectRatio,
        borderRadius: radii.card,
      }

    case 'circle':
      return {
        lines: [],
        gap: space[2],
        width: space[shape.size],
        height: space[shape.size],
        borderRadius: radii.tag,
      }
  }
}

/**
 * True when the resolved skeleton constrains at least one axis. Every shape
 * must satisfy this - a skeleton that reserves nothing is a blank surface, and
 * the content will jump when it lands.
 */
export function reservesLayout(dimensions: SkeletonDimensions): boolean {
  if (dimensions.aspectRatio !== undefined) {
    return true
  }

  if (dimensions.height !== undefined) {
    return true
  }

  return dimensions.lines.length > 0
}
