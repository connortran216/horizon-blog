import { describe, expect, it } from 'vitest'

import {
  canRetry,
  imageMounted,
  imageVisible,
  initialMediaState,
  mediaOverlay,
  mediaReducer,
  retryOffered,
  type MediaEvent,
  type MediaState,
  type MediaStatus,
} from './mediaState.logic'

const run = (state: MediaState, ...events: MediaEvent[]): MediaState =>
  events.reduce(mediaReducer, state)

const allStatuses: MediaStatus[] = ['absent', 'loading', 'ready', 'error', 'retrying']

/** A state in each status, built by driving the machine rather than by hand. */
const statesByStatus = (): Record<MediaStatus, MediaState> => {
  const start = initialMediaState({ src: 'cover.jpg', maxAttempts: 2 })

  return {
    absent: initialMediaState(),
    loading: start,
    ready: run(start, { type: 'loaded' }),
    error: run(start, { type: 'failed' }),
    retrying: run(start, { type: 'failed' }, { type: 'retry' }),
  }
}

describe('the initial state', () => {
  it('starts absent with no source and loading with one', () => {
    expect(initialMediaState()).toEqual({
      status: 'absent',
      src: null,
      attempt: 0,
      maxAttempts: 2,
      reason: null,
    })
    expect(initialMediaState({ src: 'cover.jpg' }).status).toBe('loading')
    expect(initialMediaState({ src: '' }).status).toBe('absent')
  })
})

describe('the happy path', () => {
  it('absent -> loading -> ready', () => {
    const absent = initialMediaState()
    const loading = mediaReducer(absent, { type: 'source', src: 'cover.jpg' })

    expect(loading.status).toBe('loading')
    expect(loading.src).toBe('cover.jpg')

    const ready = mediaReducer(loading, { type: 'loaded' })

    expect(ready.status).toBe('ready')
    expect(ready.reason).toBeNull()
  })
})

describe('failure and retry', () => {
  // Acceptance criterion 4.3.1: loading, ready, absent, error and retry states
  // are covered, and 4.3.3: a retry can request a fresh signed source.
  it('loading -> error -> retrying -> loading with a different source', () => {
    const error = run(initialMediaState({ src: 'expired.jpg' }), {
      type: 'failed',
      reason: '403',
    })

    expect(error.status).toBe('error')
    expect(error.reason).toBe('403')
    expect(retryOffered(error)).toBe(true)

    const retrying = mediaReducer(error, { type: 'retry' })

    expect(retrying.status).toBe('retrying')
    expect(retrying.attempt).toBe(1)
    // The old source is still there so the resolver can be told what failed.
    expect(retrying.src).toBe('expired.jpg')

    const reloading = mediaReducer(retrying, { type: 'retry-resolved', src: 'signed-again.jpg' })

    expect(reloading.status).toBe('loading')
    expect(reloading.src).toBe('signed-again.jpg')
    expect(reloading.attempt).toBe(1)
    expect(reloading.reason).toBeNull()

    expect(mediaReducer(reloading, { type: 'loaded' }).status).toBe('ready')
  })

  it('retrying -> error when the resolver itself fails', () => {
    const retrying = run(
      initialMediaState({ src: 'cover.jpg' }),
      { type: 'failed' },
      { type: 'retry' },
    )
    const failed = mediaReducer(retrying, { type: 'retry-failed', reason: 'resolver down' })

    expect(failed.status).toBe('error')
    expect(failed.attempt).toBe(1)
    expect(failed.reason).toBe('resolver down')
  })

  it('stops offering a retry once the budget is spent', () => {
    let state = initialMediaState({ src: 'cover.jpg', maxAttempts: 2 })

    state = run(state, { type: 'failed' }, { type: 'retry' }, { type: 'retry-failed' })
    expect(state.attempt).toBe(1)
    expect(retryOffered(state)).toBe(true)

    state = run(state, { type: 'retry' }, { type: 'retry-failed' })
    expect(state.attempt).toBe(2)
    expect(canRetry(state)).toBe(false)
    expect(retryOffered(state)).toBe(false)

    // A retry event beyond the budget changes nothing at all.
    expect(mediaReducer(state, { type: 'retry' })).toBe(state)
  })

  it('allows unlimited retries when maxAttempts is infinite', () => {
    let state = run(
      initialMediaState({ src: 'cover.jpg', maxAttempts: Number.POSITIVE_INFINITY }),
      { type: 'failed' },
    )

    for (let index = 0; index < 5; index += 1) {
      state = run(state, { type: 'retry' }, { type: 'retry-failed' })
    }

    expect(state.attempt).toBe(5)
    expect(retryOffered(state)).toBe(true)
  })

  /*
   * A budget of zero used to mean unlimited, which is the opposite of how the
   * number reads and left "offer no retry" inexpressible - the case a 24px
   * avatar needs, where a retry button is a keyboard stop for nothing.
   */
  it('offers no retry at all when maxAttempts is zero', () => {
    const failed = run(initialMediaState({ src: 'avatar.jpg', maxAttempts: 0 }), { type: 'failed' })

    expect(failed.status).toBe('error')
    expect(canRetry(failed)).toBe(false)
    expect(retryOffered(failed)).toBe(false)
    expect(mediaReducer(failed, { type: 'retry' })).toBe(failed)
  })

  it('treats an image that breaks after it was ready as an error', () => {
    const ready = run(initialMediaState({ src: 'cover.jpg' }), { type: 'loaded' })

    expect(mediaReducer(ready, { type: 'failed', reason: 'decode' }).status).toBe('error')
  })
})

describe('changing the source', () => {
  it('resets the retry budget for a genuinely different image', () => {
    const spent = run(
      initialMediaState({ src: 'first.jpg', maxAttempts: 2 }),
      { type: 'failed' },
      { type: 'retry' },
      { type: 'retry-failed' },
    )

    expect(spent.attempt).toBe(1)

    const swapped = mediaReducer(spent, { type: 'source', src: 'second.jpg' })

    expect(swapped.status).toBe('loading')
    expect(swapped.attempt).toBe(0)
    expect(swapped.reason).toBeNull()
  })

  it('ignores a repeat of the source it is already showing', () => {
    const ready = run(initialMediaState({ src: 'cover.jpg' }), { type: 'loaded' })

    expect(mediaReducer(ready, { type: 'source', src: 'cover.jpg' })).toBe(ready)

    const loading = initialMediaState({ src: 'cover.jpg' })

    expect(mediaReducer(loading, { type: 'source', src: 'cover.jpg' })).toBe(loading)
  })

  it('retries the same source after a failure rather than ignoring it', () => {
    const error = run(initialMediaState({ src: 'cover.jpg' }), { type: 'failed' })
    const again = mediaReducer(error, { type: 'source', src: 'cover.jpg' })

    expect(again.status).toBe('loading')
  })

  it('goes absent when the source is removed', () => {
    const ready = run(initialMediaState({ src: 'cover.jpg' }), { type: 'loaded' })
    const absent = mediaReducer(ready, { type: 'source', src: null })

    expect(absent.status).toBe('absent')
    expect(absent.src).toBeNull()
  })

  it('leaves an already-absent state untouched', () => {
    const absent = initialMediaState()

    expect(mediaReducer(absent, { type: 'source', src: null })).toBe(absent)
  })
})

describe('out-of-order events', () => {
  it('ignores every event that does not apply to the current status', () => {
    const states = statesByStatus()

    // A stale `loaded` from an image element that has since been replaced must
    // not drag an errored or absent frame into `ready`.
    expect(mediaReducer(states.absent, { type: 'loaded' })).toBe(states.absent)
    expect(mediaReducer(states.error, { type: 'loaded' })).toBe(states.error)
    expect(mediaReducer(states.retrying, { type: 'loaded' })).toBe(states.retrying)

    expect(mediaReducer(states.absent, { type: 'failed' })).toBe(states.absent)
    expect(mediaReducer(states.retrying, { type: 'failed' })).toBe(states.retrying)

    expect(mediaReducer(states.loading, { type: 'retry' })).toBe(states.loading)
    expect(mediaReducer(states.ready, { type: 'retry' })).toBe(states.ready)

    expect(mediaReducer(states.loading, { type: 'retry-resolved', src: 'x.jpg' })).toBe(
      states.loading,
    )
    expect(mediaReducer(states.error, { type: 'retry-failed' })).toBe(states.error)
  })

  it('resets from any status', () => {
    const states = statesByStatus()

    allStatuses.forEach((status) => {
      const reset = mediaReducer(states[status], { type: 'reset' })

      expect(reset.attempt, status).toBe(0)
      expect(reset.reason, status).toBeNull()
      expect(reset.status, status).toBe(states[status].src ? 'loading' : 'absent')
    })
  })
})

describe('what the frame shows', () => {
  // Acceptance criterion 4.2.1 applied to media: no async surface renders
  // blank. Every status except `ready` has an overlay, and `ready` has an
  // image, so there is no status with neither.
  it('always shows either the image or an overlay', () => {
    const states = statesByStatus()

    allStatuses.forEach((status) => {
      const state = states[status]
      const showsSomething = imageVisible(state) || mediaOverlay(state) !== null

      expect(showsSomething, status).toBe(true)
    })
  })

  it('names the overlay after the status, and drops it once ready', () => {
    const states = statesByStatus()

    expect(mediaOverlay(states.absent)).toBe('absent')
    expect(mediaOverlay(states.loading)).toBe('loading')
    expect(mediaOverlay(states.retrying)).toBe('retrying')
    expect(mediaOverlay(states.error)).toBe('error')
    expect(mediaOverlay(states.ready)).toBeNull()
  })

  it('keeps the element mounted while loading so the load event can arrive', () => {
    const states = statesByStatus()

    expect(imageMounted(states.loading)).toBe(true)
    expect(imageVisible(states.loading)).toBe(false)

    expect(imageMounted(states.ready)).toBe(true)
    expect(imageVisible(states.ready)).toBe(true)

    expect(imageMounted(states.absent)).toBe(false)
    expect(imageMounted(states.error)).toBe(false)
    expect(imageMounted(states.retrying)).toBe(false)
  })
})
