/**
 * Horizon Design System v2 - the media state machine.
 *
 * An image on this site can be slow, absent, broken, or served from a URL that
 * has expired since the page was rendered. Those are five different things to
 * show, and scattering them across `useState` booleans in a render component is
 * how a surface ends up both "loading" and "failed" at once.
 *
 * States
 *
 *   absent    no source at all - a post with no cover
 *   loading   a source exists and the browser has not finished with it
 *   ready     decoded and painted
 *   error     the browser gave up on this source
 *   retrying  a fresh source is being resolved (a re-signed URL, say)
 *
 * Transitions
 *
 *   absent    --source(src)-------> loading
 *   loading   --loaded------------> ready
 *   loading   --failed------------> error
 *   loading   --source(other)-----> loading   (attempts reset)
 *   loading   --source(null)------> absent
 *   ready     --source(other)-----> loading
 *   ready     --failed------------> error     (an image can break later)
 *   ready     --source(null)------> absent
 *   error     --retry-------------> retrying  (only while attempts remain)
 *   error     --source(other)-----> loading
 *   retrying  --retry-resolved----> loading
 *   retrying  --retry-failed------> error
 *   any       --reset-------------> the initial state
 *
 * The reducer is total: an event that does not apply returns the same object,
 * so an out-of-order callback from a stale image cannot corrupt the state.
 */

export type MediaStatus = 'absent' | 'loading' | 'ready' | 'error' | 'retrying'

export interface MediaState {
  readonly status: MediaStatus
  readonly src: string | null
  /** Retries already spent on the current source. */
  readonly attempt: number
  /**
   * How many retries this source is allowed. The number means what it says:
   * `0` offers no retry at all - the right answer for a 24px avatar, where a
   * retry button would be a keyboard stop for nothing. Pass
   * `Number.POSITIVE_INFINITY` for unlimited.
   */
  readonly maxAttempts: number
  /** Why the last attempt failed. Diagnostic only - never shown as copy. */
  readonly reason: string | null
}

export type MediaEvent =
  | { readonly type: 'source'; readonly src: string | null }
  | { readonly type: 'loaded' }
  | { readonly type: 'failed'; readonly reason?: string }
  | { readonly type: 'retry' }
  | { readonly type: 'retry-resolved'; readonly src: string }
  | { readonly type: 'retry-failed'; readonly reason?: string }
  | { readonly type: 'reset' }

export interface MediaStateInput {
  readonly src?: string | null
  readonly maxAttempts?: number
}

export function initialMediaState({
  src = null,
  maxAttempts = 2,
}: MediaStateInput = {}): MediaState {
  return {
    status: src ? 'loading' : 'absent',
    src: src ?? null,
    attempt: 0,
    maxAttempts,
    reason: null,
  }
}

function withSource(state: MediaState, src: string | null): MediaState {
  if (!src) {
    return state.status === 'absent' && state.src === null
      ? state
      : { ...state, status: 'absent', src: null, attempt: 0, reason: null }
  }

  if (src === state.src && (state.status === 'loading' || state.status === 'ready')) {
    return state
  }

  // A different source is a different piece of media: the retry budget for the
  // old one does not carry over.
  return { ...state, status: 'loading', src, attempt: 0, reason: null }
}

export function mediaReducer(state: MediaState, event: MediaEvent): MediaState {
  switch (event.type) {
    case 'source':
      return withSource(state, event.src)

    case 'loaded':
      return state.status === 'loading' ? { ...state, status: 'ready', reason: null } : state

    case 'failed':
      return state.status === 'loading' || state.status === 'ready'
        ? { ...state, status: 'error', reason: event.reason ?? null }
        : state

    case 'retry':
      return state.status === 'error' && canRetry(state)
        ? { ...state, status: 'retrying', attempt: state.attempt + 1 }
        : state

    case 'retry-resolved':
      return state.status === 'retrying'
        ? { ...state, status: 'loading', src: event.src, reason: null }
        : state

    case 'retry-failed':
      return state.status === 'retrying'
        ? { ...state, status: 'error', reason: event.reason ?? null }
        : state

    case 'reset':
      return initialMediaState({ src: state.src, maxAttempts: state.maxAttempts })
  }
}

/** Retries left on the current source. Independent of the current status. */
export function canRetry(state: MediaState): boolean {
  return state.attempt < state.maxAttempts
}

/** A retry control is offered only when a retry could actually be started. */
export function retryOffered(state: MediaState): boolean {
  return state.status === 'error' && canRetry(state)
}

/**
 * The `img` element stays mounted while loading: unmounting it would cancel the
 * request that the `loaded` event is waiting for. It is only invisible.
 */
export function imageMounted(state: MediaState): boolean {
  return (state.status === 'loading' || state.status === 'ready') && state.src !== null
}

export function imageVisible(state: MediaState): boolean {
  return state.status === 'ready'
}

/**
 * What covers the frame. `null` means the image is showing and nothing is over
 * it. Every other status has an overlay, which is what makes "no async surface
 * renders blank" structural rather than a matter of remembering.
 */
export type MediaOverlay = 'absent' | 'loading' | 'retrying' | 'error' | null

export function mediaOverlay(state: MediaState): MediaOverlay {
  return state.status === 'ready' ? null : state.status
}
