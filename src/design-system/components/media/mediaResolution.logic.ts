/**
 * Horizon Design System v2 - durable media resolution.
 *
 * Retry has to be able to ask for a *different* source, not re-request the one
 * that just failed: a Horizon cover comes from a signed URL, and the common
 * failure is an expiry rather than a missing file. Mutating the URL inside the
 * render component would bake one storage provider's signing scheme into a
 * design-system primitive.
 *
 * So resolution is injected. The component is handed an async resolver, calls
 * it, and knows nothing about what it does - repository, cache, signing
 * service, or a stub in the gallery.
 *
 * Both helpers return a disposer, and neither calls back after it has run. That
 * is the whole contract: an unmounted frame is never told about an answer it
 * can no longer use.
 */

import { guardAsync, type Disposer } from '../../motion'

export interface MediaResolverContext {
  /** Which retry this is. 1 for the first retry. */
  readonly attempt: number
  /** The source that just failed, if there was one. */
  readonly previousSrc: string | null
}

export type MediaSourceResolver = (context: MediaResolverContext) => Promise<string>

export interface SourceResolutionInput {
  readonly resolver: MediaSourceResolver
  readonly context: MediaResolverContext
  readonly onResolved: (src: string) => void
  readonly onFailed: (reason: string) => void
}

const describeReason = (reason: unknown): string =>
  reason instanceof Error ? reason.message : String(reason)

/**
 * Run one resolution attempt. A resolver that throws synchronously, rejects, or
 * hands back an empty string all reach `onFailed` - an empty source would put
 * the machine back into `loading` with nothing to load, which is the one way
 * this component could hang.
 */
export function runSourceResolution({
  resolver,
  context,
  onResolved,
  onFailed,
}: SourceResolutionInput): Disposer {
  let promise: Promise<string>

  try {
    promise = resolver(context)
  } catch (reason) {
    onFailed(describeReason(reason))

    return () => {}
  }

  return guardAsync(Promise.resolve(promise), {
    onResolved: (src) => {
      const trimmed = typeof src === 'string' ? src.trim() : ''

      if (trimmed.length === 0) {
        onFailed('The resolver returned no source.')

        return
      }

      onResolved(trimmed)
    },
    onRejected: (reason) => onFailed(describeReason(reason)),
  })
}

/**
 * The subset of `HTMLImageElement` the decode step needs, typed structurally so
 * a test can hand in a plain object.
 */
export interface DecodableImage {
  readonly complete?: boolean
  readonly naturalWidth?: number
  readonly decode?: () => Promise<void>
}

export interface DecodeTaskInput {
  readonly image: DecodableImage | null | undefined
  readonly onDecoded: () => void
  readonly onFailed: (reason: string) => void
}

/**
 * Wait for the image to be decoded, not merely loaded. `decode()` is what makes
 * the fade honest: on a large photo, `load` fires while the browser still has
 * work to do, and fading in there shows a partially drawn image.
 *
 * Where `decode()` is missing, a cached image that is already `complete` counts
 * as decoded, a `complete` image with no intrinsic width is a failure, and
 * anything else waits for the element's own `load` and `error` events.
 */
export function createDecodeTask({ image, onDecoded, onFailed }: DecodeTaskInput): Disposer {
  if (!image) {
    return () => {}
  }

  if (typeof image.decode === 'function') {
    return guardAsync(Promise.resolve(image.decode()), {
      onResolved: () => onDecoded(),
      onRejected: (reason) => onFailed(describeReason(reason)),
    })
  }

  if (image.complete === true) {
    if ((image.naturalWidth ?? 0) > 0) {
      onDecoded()
    } else {
      onFailed('The image has no intrinsic size.')
    }
  }

  return () => {}
}
