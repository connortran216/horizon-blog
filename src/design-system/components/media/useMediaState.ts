/**
 * Horizon Design System v2 - the media state binding.
 *
 * `useReducer` over the machine in `mediaState.logic.ts`, plus one effect that
 * drives the injected resolver while the machine is in `retrying`. Every branch
 * worth testing is in the two logic modules; this is the wiring.
 *
 * Retry without a resolver still works: the state returns to `loading` with the
 * same source, which is the right behaviour for a transient network failure.
 */

import { useCallback, useEffect, useReducer, useRef } from 'react'

import { createDisposerBag } from '../../motion'
import { initialMediaState, mediaReducer, retryOffered, type MediaState } from './mediaState.logic'
import { runSourceResolution, type MediaSourceResolver } from './mediaResolution.logic'

export interface UseMediaStateInput {
  readonly src?: string | null
  /**
   * Asks the owning feature for a fresh source - a re-signed URL, a different
   * size, a fallback host. Left out, a retry re-requests the same source.
   */
  readonly resolveSource?: MediaSourceResolver
  /** Zero means unlimited retries. */
  readonly maxAttempts?: number
}

export interface MediaStateBinding {
  readonly state: MediaState
  /** The image decoded. */
  readonly onLoaded: () => void
  readonly onFailed: (reason?: string) => void
  /** Start a retry. Ignored unless a retry is currently offered. */
  readonly retry: () => void
  readonly retryOffered: boolean
}

export function useMediaState({
  src = null,
  resolveSource,
  maxAttempts = 2,
}: UseMediaStateInput = {}): MediaStateBinding {
  const [state, dispatch] = useReducer(mediaReducer, { src, maxAttempts }, initialMediaState)

  // The resolver is read through a ref so that an inline arrow function in the
  // caller does not restart an in-flight resolution on every render.
  const resolverRef = useRef(resolveSource)
  resolverRef.current = resolveSource

  useEffect(() => {
    dispatch({ type: 'source', src })
  }, [src])

  useEffect(() => {
    if (state.status !== 'retrying') {
      return
    }

    const resolver = resolverRef.current

    if (!resolver) {
      // No resolver: re-request the same source. `ResponsiveImage` keys the
      // element on the attempt count, so the element remounts and the browser
      // issues a fresh request rather than sitting on the failed one.
      if (state.src) {
        dispatch({ type: 'retry-resolved', src: state.src })
      } else {
        dispatch({ type: 'retry-failed', reason: 'There is no source to retry.' })
      }

      return
    }

    const bag = createDisposerBag()

    bag.add(
      runSourceResolution({
        resolver,
        context: { attempt: state.attempt, previousSrc: state.src },
        onResolved: (resolved) => dispatch({ type: 'retry-resolved', src: resolved }),
        onFailed: (reason) => dispatch({ type: 'retry-failed', reason }),
      }),
    )

    return () => bag.dispose()
  }, [state.status, state.attempt, state.src])

  const onLoaded = useCallback(() => dispatch({ type: 'loaded' }), [])
  const onFailed = useCallback((reason?: string) => dispatch({ type: 'failed', reason }), [])
  const retry = useCallback(() => dispatch({ type: 'retry' }), [])

  return { state, onLoaded, onFailed, retry, retryOffered: retryOffered(state) }
}
