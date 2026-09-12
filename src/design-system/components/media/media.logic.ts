/**
 * Horizon Design System v2 - media presentation decisions.
 *
 * Three things live here, and they share a file because they share one
 * invariant: none of them may depend on the media status.
 *
 * - `mediaFrameStyle` takes an aspect ratio and a corner decision, and nothing
 *   else. It cannot vary with the state because the state is not one of its
 *   arguments, which is how "no reflow when an image arrives or fails" is
 *   enforced rather than remembered. The corner decision is who owns the
 *   corners, not how round they are: a radius token, or `containerCorners` for
 *   a frame whose container draws and clips them instead.
 * - `altAttributes` turns an explicit alt/decorative choice into DOM
 *   attributes, and refuses a content image with a blank alt.
 * - `mediaFadeStyle` fades in after decode, and does not fade under reduced
 *   motion.
 */

import { componentTokens, radii, transitionFor } from '../../../theme/tokens'
import type { RadiusToken, SemanticColorToken } from '../../../theme/tokens'
import type { MotionPolicy } from '../../motion'

/* -------------------------------------------------------------------------- */
/* Frame                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The sentinel a frame passes instead of a radius token to say "I do not own my
 * corners; the thing that contains me does."
 *
 * `CONVENTIONS.md` rule 4 gives border, radius and clipping to one owner. A
 * full-bleed cover inside a card is the case where that owner has to be the
 * card rather than the picture: the card already draws the corners the reader
 * sees, and a picture that drew its own inside them would be the second owner.
 * Declining is therefore part of the frame's own API rather than a `borderRadius`
 * written onto it from outside - the outside override is exactly what rule 4 is
 * there to prevent, and it is invisible to a test.
 */
export const containerCorners = 'container'

/**
 * Who owns this frame's corners: a radius token means the frame does and draws
 * it, `containerCorners` means it owns none and renders square.
 *
 * A frame that declines is only correct inside a container that clips - see
 * `surfaceClipsChildren` in `components/surface/surface.logic.ts`. Nothing else
 * about the frame changes: it still reserves its aspect ratio and still paints
 * the placeholder ground, so the layout guarantee is untouched.
 */
export type MediaCorners = RadiusToken | typeof containerCorners

export function frameOwnsCorners(radius: MediaCorners): radius is RadiusToken {
  return radius !== containerCorners
}

/**
 * Zero is the absence of a radius rather than a design value, which is why it is
 * a literal here and not a token - the same reason `surfaceStyle` writes
 * `boxShadow: 'none'`. Every radius the system actually draws still comes from
 * the radius scale.
 */
const noRadius = '0'

export interface MediaFrameStyleInput {
  /** A CSS aspect ratio, e.g. `'16 / 9'`. Required - this is what holds the box. */
  readonly aspectRatio: string
  readonly radius?: MediaCorners
}

export interface MediaFrameStyle {
  readonly aspectRatio: string
  readonly borderRadius: string
  readonly overflow: 'hidden'
  readonly position: 'relative'
  readonly backgroundColor: SemanticColorToken
  readonly width: '100%'
}

/**
 * The frame is the single visual owner of the media surface: the reserved box
 * and the clip are always its, and the corners are its too unless it has
 * explicitly handed them to its container with `containerCorners`. Either way
 * there is exactly one owner, and nothing inside the frame sets any of them.
 *
 * The corner decision changes one declaration and nothing else. `aspectRatio`,
 * `overflow` and the ground colour are identical in both cases, so a full-bleed
 * cover reserves its box exactly as an inset one does.
 */
export function mediaFrameStyle({
  aspectRatio,
  radius = 'card',
}: MediaFrameStyleInput): MediaFrameStyle {
  return {
    aspectRatio: assertAspectRatio(aspectRatio),
    borderRadius: frameOwnsCorners(radius) ? radii[radius] : noRadius,
    overflow: 'hidden',
    position: 'relative',
    // The placeholder colour is on the frame, so an absent, loading, retrying
    // or failed image all sit on the same ground and nothing flashes white.
    backgroundColor: componentTokens.media.placeholderBg,
    width: '100%',
  }
}

const ASPECT_RATIO_PATTERN = /^\s*\d+(\.\d+)?\s*(\/\s*\d+(\.\d+)?\s*)?$/

/**
 * A frame with no usable ratio would collapse to nothing and the page would
 * jump when the image landed - the exact failure this component exists to
 * prevent, so it is a thrown error rather than a fallback.
 */
export function assertAspectRatio(value: string): string {
  if (!ASPECT_RATIO_PATTERN.test(value)) {
    throw new TypeError(
      `MediaFrame needs an explicit aspect ratio such as "16 / 9"; received "${value}".`,
    )
  }

  return value.trim()
}

/* -------------------------------------------------------------------------- */
/* Alt text                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The alt decision is a discriminated union, so it cannot be skipped: a
 * decorative image says so, and every other image has to supply a string. There
 * is no third shape, and no default.
 */
export type MediaAltInput =
  | { readonly decorative: true; readonly alt?: never }
  | { readonly decorative?: false; readonly alt: string }

export interface AltAttributes {
  readonly alt: string
  readonly role?: 'presentation'
  readonly 'aria-hidden'?: true
}

export function altAttributes(input: MediaAltInput): AltAttributes {
  if (input.decorative === true) {
    // Empty alt plus presentation plus aria-hidden: belt and braces, because
    // assistive technology disagrees about which of the three is sufficient.
    return { alt: '', role: 'presentation', 'aria-hidden': true }
  }

  const alt = input.alt?.trim() ?? ''

  if (alt.length === 0) {
    throw new TypeError(
      'A content image needs alt text. Pass `decorative` if the image carries no meaning.',
    )
  }

  return { alt }
}

export function isDecorative(input: MediaAltInput): boolean {
  return input.decorative === true
}

/* -------------------------------------------------------------------------- */
/* Fade                                                                       */
/* -------------------------------------------------------------------------- */

export interface MediaFadeStyle {
  readonly opacity: number
  readonly transition: string | undefined
}

/**
 * Opacity only, and only after the image has decoded - fading a half-decoded
 * image is what produces the flash of a partially drawn photo. Under reduced
 * motion the image simply appears: the transition is dropped, not shortened.
 */
export function mediaFadeStyle(policy: MotionPolicy, visible: boolean): MediaFadeStyle {
  return {
    opacity: visible ? 1 : 0,
    transition: policy.reduced ? undefined : transitionFor('opacity', 'normal'),
  }
}

/* -------------------------------------------------------------------------- */
/* Responsive sources                                                         */
/* -------------------------------------------------------------------------- */

export interface ImageSource {
  readonly src: string
  /** Intrinsic width in pixels, for the `w` descriptor. */
  readonly width: number
}

/** `undefined` rather than an empty string: an empty srcset is invalid HTML. */
export function buildSrcSet(sources: readonly ImageSource[] | undefined): string | undefined {
  if (!sources || sources.length === 0) {
    return undefined
  }

  return [...sources]
    .sort((left, right) => left.width - right.width)
    .map((source) => `${source.src} ${Math.round(source.width)}w`)
    .join(', ')
}

/**
 * The widest source is the `src` fallback for a browser that ignores `srcset`,
 * and the source a caller gave explicitly always wins.
 */
export function fallbackSource(
  src: string | undefined | null,
  sources: readonly ImageSource[] | undefined,
): string | null {
  if (src) {
    return src
  }

  if (!sources || sources.length === 0) {
    return null
  }

  return sources.reduce((widest, source) => (source.width > widest.width ? source : widest)).src
}
