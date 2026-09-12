import { describe, expect, it, vi } from 'vitest'

import { fullMotionPolicy, reducedMotionPolicy } from './policy.logic'
import { startViewTransition, type ViewTransitionDocumentLike } from './viewTransition.logic'

const capableDocument = (): ViewTransitionDocumentLike & { calls: () => number } => {
  let calls = 0

  return {
    startViewTransition(update) {
      calls += 1
      update()

      return { finished: Promise.resolve() }
    },
    calls: () => calls,
  }
}

describe('startViewTransition', () => {
  it('runs the update inside a transition when the browser supports one', async () => {
    const documentLike = capableDocument()
    const update = vi.fn()

    const result = startViewTransition({ document: documentLike, policy: fullMotionPolicy, update })

    expect(result.animated).toBe(true)
    expect(documentLike.calls()).toBe(1)
    expect(update).toHaveBeenCalledTimes(1)
    await expect(result.finished).resolves.toBeUndefined()
  })

  it('skips the transition under reduced motion but still applies the update', () => {
    const documentLike = capableDocument()
    const update = vi.fn()

    const result = startViewTransition({
      document: documentLike,
      policy: reducedMotionPolicy,
      update,
    })

    expect(result.animated).toBe(false)
    expect(documentLike.calls()).toBe(0)
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('applies the update when the API is absent', () => {
    const update = vi.fn()

    expect(startViewTransition({ document: {}, policy: fullMotionPolicy, update }).animated).toBe(
      false,
    )
    expect(startViewTransition({ document: null, policy: fullMotionPolicy, update }).animated).toBe(
      false,
    )
    expect(update).toHaveBeenCalledTimes(2)
  })

  it('applies the update exactly once when the API throws', () => {
    const update = vi.fn()
    const documentLike: ViewTransitionDocumentLike = {
      startViewTransition() {
        throw new Error('transition refused')
      },
    }

    const result = startViewTransition({ document: documentLike, policy: fullMotionPolicy, update })

    expect(result.animated).toBe(false)
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('resolves rather than rejects when an interrupted transition rejects', async () => {
    const documentLike: ViewTransitionDocumentLike = {
      startViewTransition(update) {
        update()

        return { finished: Promise.reject(new Error('skipped')) }
      },
    }
    const update = vi.fn()

    const result = startViewTransition({ document: documentLike, policy: fullMotionPolicy, update })

    await expect(result.finished).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledTimes(1)
  })
})
