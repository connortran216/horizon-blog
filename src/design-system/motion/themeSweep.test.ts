import { describe, expect, it, vi } from 'vitest'

import { themeSweepAttribute } from '../../theme/tokens'
import { fullMotionPolicy, reducedMotionPolicy } from './policy.logic'
import { runThemeSweep, themeSweepKeyframes } from './themeSweep.logic'
import { startViewTransition, type ViewTransitionDocumentLike } from './viewTransition.logic'

const fakeRoot = () => {
  const attributes = new Map<string, string>()

  return {
    attributes,
    documentElement: {
      setAttribute: (name: string, value: string) => attributes.set(name, value),
      removeAttribute: (name: string) => attributes.delete(name),
    },
  }
}

describe('runThemeSweep', () => {
  it('marks the root for the life of one animated transition, then clears it', async () => {
    const root = fakeRoot()
    const update = vi.fn()
    let finish: () => void = () => {}
    const transitionDocument: ViewTransitionDocumentLike = {
      startViewTransition: (callback) => {
        callback()

        return { finished: new Promise<void>((resolve) => (finish = resolve)) }
      },
    }

    const result = runThemeSweep({
      document: root,
      runTransition: (fn) =>
        startViewTransition({ document: transitionDocument, policy: fullMotionPolicy, update: fn }),
      update,
    })

    expect(result.animated).toBe(true)
    expect(update).toHaveBeenCalledOnce()
    expect(root.attributes.has(themeSweepAttribute)).toBe(true)

    finish()
    await result.finished

    expect(root.attributes.has(themeSweepAttribute)).toBe(false)
  })

  it('applies immediately and leaves no mark under reduced motion', () => {
    const root = fakeRoot()
    const update = vi.fn()

    const result = runThemeSweep({
      document: root,
      runTransition: (fn) =>
        startViewTransition({ document: {}, policy: reducedMotionPolicy, update: fn }),
      update,
    })

    expect(result.animated).toBe(false)
    expect(update).toHaveBeenCalledOnce()
    expect(root.attributes.size).toBe(0)
  })

  it('still runs the update with no document at all', () => {
    const update = vi.fn()

    runThemeSweep({
      document: null,
      runTransition: (fn) =>
        startViewTransition({ document: null, policy: fullMotionPolicy, update: fn }),
      update,
    })

    expect(update).toHaveBeenCalledOnce()
  })
})

describe('themeSweepKeyframes', () => {
  it('opens from a closed line at the middle to the whole viewport', () => {
    expect(themeSweepKeyframes.from.clipPath).toBe('inset(50% 0 50% 0)')
    expect(themeSweepKeyframes.to.clipPath).toBe('inset(0 0 0 0)')
  })
})
