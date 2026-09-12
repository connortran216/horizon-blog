/**
 * Horizon Design System v2 - media barrel.
 *
 * `MediaFrame` reserves the box, `ResponsiveImage` runs the state machine
 * inside one, and `MediaPlaceholder` / `MediaError` / `MediaRetry` are the
 * overlays it shows. `useMediaState` is exported so a domain pattern with its
 * own element - a video, a diagram - can reuse the machine without the image.
 */

export { MediaError } from './MediaError'
export type { MediaErrorProps } from './MediaError'

export { MediaFrame } from './MediaFrame'
export type { MediaFrameProps } from './MediaFrame'

export { MediaPlaceholder } from './MediaPlaceholder'
export type { MediaPlaceholderProps, MediaPlaceholderVariant } from './MediaPlaceholder'

export { MediaRetry } from './MediaRetry'
export type { MediaRetryProps } from './MediaRetry'

export { ResponsiveImage } from './ResponsiveImage'
export type { ResponsiveImageProps } from './ResponsiveImage'

export { useMediaState } from './useMediaState'
export type { MediaStateBinding, UseMediaStateInput } from './useMediaState'

export {
  altAttributes,
  assertAspectRatio,
  buildSrcSet,
  containerCorners,
  fallbackSource,
  frameOwnsCorners,
  isDecorative,
  mediaFadeStyle,
  mediaFrameStyle,
} from './media.logic'
export type {
  AltAttributes,
  ImageSource,
  MediaAltInput,
  MediaCorners,
  MediaFadeStyle,
  MediaFrameStyle,
  MediaFrameStyleInput,
} from './media.logic'

export {
  canRetry,
  imageMounted,
  imageVisible,
  initialMediaState,
  mediaOverlay,
  mediaReducer,
  retryOffered,
} from './mediaState.logic'
export type {
  MediaEvent,
  MediaOverlay,
  MediaState,
  MediaStateInput,
  MediaStatus,
} from './mediaState.logic'

export { createDecodeTask, runSourceResolution } from './mediaResolution.logic'
export type {
  DecodableImage,
  DecodeTaskInput,
  MediaResolverContext,
  MediaSourceResolver,
  SourceResolutionInput,
} from './mediaResolution.logic'
