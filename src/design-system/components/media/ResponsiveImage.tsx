/**
 * Horizon Design System v2 - a resilient image.
 *
 * The five media states rendered inside one frame that never changes size. The
 * decisions are elsewhere: the machine in `mediaState.logic.ts`, the alt
 * semantics and fade in `media.logic.ts`, the decode and resolver tasks in
 * `mediaResolution.logic.ts`. This file arranges them.
 *
 * Two things are worth reading twice:
 *
 * - Alt text is a discriminated union. `decorative` needs no alt; anything else
 *   requires one, and `altAttributes` throws on a blank string. Forgetting is
 *   a compile error, and remembering badly is a runtime error in development.
 * - The element is keyed on the source *and* the attempt count, so a retry
 *   against the same URL remounts the element and the browser issues a fresh
 *   request instead of resting on the failed one.
 * - `fit` is about the picture, not the box. It decides whether the image is
 *   cropped to fill the frame or shown whole against the frame's ground; the
 *   frame is the same frame either way, because `MediaFrame` is never told.
 */

import { useEffect, useRef } from 'react'
import { Image, type BoxProps } from '@chakra-ui/react'

import { createDisposerBag, useMotionPolicy } from '../../motion'
import { MediaError } from './MediaError'
import { MediaFrame } from './MediaFrame'
import { MediaPlaceholder } from './MediaPlaceholder'
import { MediaRetry } from './MediaRetry'
import {
  altAttributes,
  buildSrcSet,
  fallbackSource,
  mediaFadeStyle,
  mediaImageFit,
  type ImageSource,
  type MediaAltInput,
  type MediaCorners,
  type MediaFit,
} from './media.logic'
import { imageMounted, imageVisible, mediaOverlay } from './mediaState.logic'
import { createDecodeTask, type MediaSourceResolver } from './mediaResolution.logic'
import { useMediaState } from './useMediaState'

interface ResponsiveImageOwnProps {
  /** Required. The frame holds this in every state, so nothing reflows. */
  aspectRatio: string
  /**
   * A radius token, or `'container'` to hand the corners to the surface that
   * clips this image - the full-bleed case. See `MediaFrame`.
   */
  radius?: MediaCorners
  /**
   * How the picture meets the frame: `cover` crops to fill, `contain` keeps the
   * whole image visible against the frame's ground. It changes which pixels are
   * painted and nothing about the box - see `mediaImageFit`.
   */
  fit?: MediaFit
  src?: string | null
  /** Width-descriptor candidates. The widest doubles as the `src` fallback. */
  sources?: readonly ImageSource[]
  /** The `sizes` attribute. Pair it with `sources`. */
  sizes?: string
  /**
   * Asks the owning feature for a fresh source on retry - a re-signed URL, for
   * instance. Media resolution stays outside this component.
   */
  resolveSource?: MediaSourceResolver
  /**
   * Retries allowed per source. `0` offers no retry control at all - use it
   * where a retry button would be a keyboard stop for nothing, such as a small
   * avatar. `Number.POSITIVE_INFINITY` allows unlimited retries.
   */
  maxAttempts?: number
  /** A noun phrase for the loading and failure copy: "the cover image". */
  task?: string
  /** Shown when there is no source at all. */
  absentCaption?: string
  loading?: 'lazy' | 'eager'
  /** Layout props for the frame. The ratio and radius stay this component's. */
  frameProps?: Omit<BoxProps, 'children' | 'aspectRatio'>
  /**
   * The frame's CSS `view-transition-name`, for a shared-element transition
   * with a matching cover elsewhere - see `postCoverTransitionName`. Applied
   * to the frame via `sx` rather than a typed style prop, because the View
   * Transitions API's own property is newer than this repository's `csstype`
   * and `sx` already accepts arbitrary CSS by design.
   *
   * Left unset, this changes nothing: a frame with no name never takes part
   * in a shared-element transition, which is the same as today.
   */
  viewTransitionName?: string
}

export type ResponsiveImageProps = ResponsiveImageOwnProps & MediaAltInput

export function ResponsiveImage({
  aspectRatio,
  radius = 'card',
  fit,
  src,
  sources,
  sizes,
  resolveSource,
  maxAttempts = 2,
  task = 'the image',
  absentCaption,
  loading = 'lazy',
  frameProps,
  viewTransitionName,
  ...altInput
}: ResponsiveImageProps) {
  const policy = useMotionPolicy()
  const resolvedFrameProps = viewTransitionName
    ? {
        ...frameProps,
        sx: { viewTransitionName, ...(frameProps?.sx as object | undefined) },
      }
    : frameProps
  const resolved = fallbackSource(src, sources)
  const { state, onLoaded, onFailed, retry } = useMediaState({
    src: resolved,
    resolveSource,
    maxAttempts,
  })

  const imageRef = useRef<HTMLImageElement>(null)
  const alt = altAttributes(altInput as MediaAltInput)
  const overlay = mediaOverlay(state)
  const fade = mediaFadeStyle(policy, imageVisible(state))
  const imageFit = mediaImageFit(fit)
  const failedAction = `load ${task}`

  // A cached image is already decoded before React attaches a `load` handler,
  // so the handler alone would never fire and the frame would sit at "loading"
  // forever. The decode task covers that case and is disposed on unmount, so a
  // decode that finishes after the frame is gone is ignored.
  useEffect(() => {
    if (state.status !== 'loading') {
      return
    }

    const bag = createDisposerBag()

    bag.add(
      createDecodeTask({
        image: imageRef.current,
        onDecoded: onLoaded,
        onFailed,
      }),
    )

    return () => bag.dispose()
  }, [state.status, state.src, state.attempt, onLoaded, onFailed])

  return (
    <MediaFrame aspectRatio={aspectRatio} radius={radius} {...resolvedFrameProps}>
      {imageMounted(state) && state.src ? (
        <Image
          key={`${state.src}#${state.attempt}`}
          ref={imageRef}
          src={state.src}
          srcSet={buildSrcSet(sources)}
          sizes={sizes}
          loading={loading}
          decoding="async"
          {...alt}
          position="absolute"
          inset={0}
          width="100%"
          height="100%"
          objectFit={imageFit.objectFit}
          opacity={fade.opacity}
          transition={fade.transition}
          onLoad={onLoaded}
          onError={() => onFailed('The browser could not load the image.')}
        />
      ) : null}

      {overlay === 'error' ? (
        <MediaError failedAction={failedAction}>
          {/*
           * A decorative image that failed gets no retry button: it carried no
           * meaning, so there is nothing for the reader to recover.
           */}
          {alt['aria-hidden'] ? null : (
            <MediaRetry
              failedAction={failedAction}
              // The full phrase ("Try to load the sample cover image again")
              // is real content, not filler, so it stays the accessible name
              // via `label`'s `aria-label` fallback in RetryAction - it is
              // just too long to sit on a retry button as visible text. "Try
              // again" is unambiguous here: the button is already inside this
              // image's own failure state, so there is nothing else it could
              // mean.
              label="Try again"
              onRetry={retry}
              attempt={state.attempt}
              maxAttempts={state.maxAttempts}
            />
          )}
        </MediaError>
      ) : null}

      {overlay !== null && overlay !== 'error' ? (
        <MediaPlaceholder variant={overlay} task={task} caption={absentCaption} />
      ) : null}
    </MediaFrame>
  )
}
