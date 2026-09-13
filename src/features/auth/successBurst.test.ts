/**
 * The sign-in celebration's reduced-motion guard.
 *
 * The burst is a full-screen animation with no guard of its own - it is legacy
 * code the navbar still uses - so the guard is the gate in front of it, and the
 * thing worth proving is that under reduced motion the animation is not merely
 * quick but never loaded: no chunk fetched, no container appended to the
 * document, no React root created.
 *
 * The loader is injected, so that is provable here without a DOM: if the fake
 * was never called, nothing ran.
 */

import { describe, expect, it } from 'vitest'

import { fullMotionPolicy, reducedMotionPolicy } from '../../design-system'
import { celebrationAllowed, playSuccessBurst, type SuccessBurstModule } from './successBurst'

function recordingLoader() {
  const calls = { loaded: 0, bursts: 0 }

  const load = (): Promise<SuccessBurstModule> => {
    calls.loaded += 1

    return Promise.resolve({
      particleSystem: {
        showSuccessParticles: () => {
          calls.bursts += 1
        },
      },
    })
  }

  return { calls, load }
}

describe('celebrationAllowed', () => {
  it('lets the burst play when the reader has expressed no preference', () => {
    expect(celebrationAllowed(fullMotionPolicy)).toBe(true)
  })

  it('refuses it under reduced motion', () => {
    expect(celebrationAllowed(reducedMotionPolicy)).toBe(false)
  })

  /*
   * The burst is travel and rotation across the whole viewport, which is what
   * `translation` names. Reading the policy's own flag rather than only
   * `reduced` means a future policy that stops travel stops this too.
   */
  it('follows the motion policy rather than a media query of its own', () => {
    expect(celebrationAllowed({ ...fullMotionPolicy, translation: false })).toBe(false)
  })
})

describe('playSuccessBurst', () => {
  it('plays once on a successful sign in', async () => {
    const { calls, load } = recordingLoader()

    await expect(playSuccessBurst(fullMotionPolicy, load)).resolves.toBe(true)
    expect(calls.bursts).toBe(1)
  })

  it('does not even load the animation under reduced motion', async () => {
    const { calls, load } = recordingLoader()

    await expect(playSuccessBurst(reducedMotionPolicy, load)).resolves.toBe(false)
    expect(calls.loaded).toBe(0)
    expect(calls.bursts).toBe(0)
  })
})
