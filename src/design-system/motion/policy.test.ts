import { describe, expect, it, vi } from 'vitest'

import { duration, easing, reducedMotionQuery, transform } from '../../theme/tokens'
import {
  ambientAllowed,
  cubicBezierPoints,
  durationSeconds,
  fullMotionPolicy,
  hoverLiftOffset,
  hoverLiftProps,
  loadingCycleMs,
  motionPolicyFor,
  parseDurationMs,
  parseLengthPx,
  pressFeedbackProps,
  readReducedMotion,
  reducedMotionPolicy,
  revealOffset,
  revealVariants,
  spinnerSpeed,
  staggerDelays,
  standardEase,
  subscribeReducedMotion,
  transitionFor,
  type MatchMediaLike,
  type MediaQueryChangeEvent,
  type MediaQueryLike,
} from './policy.logic'

describe('token parsing', () => {
  it('reads every duration token as milliseconds', () => {
    expect(parseDurationMs(duration.fast)).toBe(120)
    expect(parseDurationMs(duration.reveal)).toBe(480)
    expect(parseDurationMs('1.5s')).toBe(1500)
  })

  it('refuses a value that is not a duration', () => {
    expect(() => parseDurationMs('fast')).toThrow(TypeError)
    expect(() => parseDurationMs('120')).toThrow(TypeError)
  })

  it('reads the transform tokens, including the negative hover lift', () => {
    expect(parseLengthPx(transform.revealDistance)).toBe(14)
    expect(parseLengthPx(transform.hoverLift)).toBe(-2)
    expect(() => parseLengthPx('2rem')).toThrow(TypeError)
  })

  it('turns the system easing into Framer control points', () => {
    expect(cubicBezierPoints(easing.standard)).toEqual([0.22, 1, 0.36, 1])
    expect(standardEase).toEqual([0.22, 1, 0.36, 1])
    expect(() => cubicBezierPoints('ease-in-out')).toThrow(TypeError)
  })
})

describe('the motion policy', () => {
  it('stops translation, ambient movement, pointer following and layout projection', () => {
    const policy = motionPolicyFor(true)

    expect(policy).toBe(reducedMotionPolicy)
    expect(policy.translation).toBe(false)
    expect(policy.ambient).toBe(false)
    expect(policy.pointerFollowing).toBe(false)
    expect(policy.layoutProjection).toBe(false)
    expect(policy.loadingRhythm).toBe(false)
  })

  it('keeps colour, opacity and focus feedback under reduced motion', () => {
    expect(reducedMotionPolicy.opacity).toBe(true)
    expect(reducedMotionPolicy.colour).toBe(true)
    expect(reducedMotionPolicy.focus).toBe(true)
  })

  it('allows everything when no preference is expressed', () => {
    expect(motionPolicyFor(false)).toBe(fullMotionPolicy)
  })
})

describe('ambient movement', () => {
  // Acceptance criterion 4.1.1: no infinite decorative animation in reading
  // surfaces. The surface, not the preference, is what decides this.
  it('never runs on a reading surface, even with full motion allowed', () => {
    expect(ambientAllowed(fullMotionPolicy, 'reading')).toBe(false)
  })

  it('runs on a discovery surface only while motion is allowed', () => {
    expect(ambientAllowed(fullMotionPolicy, 'discovery')).toBe(true)
    expect(ambientAllowed(reducedMotionPolicy, 'discovery')).toBe(false)
  })
})

describe('derived motion values', () => {
  it('collapses Framer durations to zero under reduced motion', () => {
    expect(durationSeconds('enter', fullMotionPolicy)).toBeCloseTo(0.32)
    expect(durationSeconds('enter', reducedMotionPolicy)).toBe(0)
  })

  it('drops the entry travel but keeps the fade', () => {
    expect(revealVariants(fullMotionPolicy)).toEqual({
      hidden: { opacity: 0, y: 14 },
      visible: { opacity: 1, y: 0 },
    })
    expect(revealVariants(reducedMotionPolicy)).toEqual({
      hidden: { opacity: 0, y: 0 },
      visible: { opacity: 1, y: 0 },
    })
    expect(revealOffset(reducedMotionPolicy)).toBe(0)
  })

  it('drops the hover lift entirely under reduced motion', () => {
    expect(hoverLiftOffset(fullMotionPolicy)).toBe(-2)
    expect(hoverLiftProps(fullMotionPolicy).whileHover).toEqual({ y: -2 })
    expect(hoverLiftProps(reducedMotionPolicy).whileHover).toEqual({ y: 0 })
  })

  it('keeps press feedback as opacity when the scale is removed', () => {
    expect(pressFeedbackProps(fullMotionPolicy).whileTap.scale).toBeLessThan(1)

    const reduced = pressFeedbackProps(reducedMotionPolicy).whileTap

    expect(reduced.scale).toBe(1)
    expect(reduced.opacity).toBeLessThan(1)
  })

  it('zeroes the delay as well as the duration under reduced motion', () => {
    expect(transitionFor('normal', fullMotionPolicy, 0.25)).toEqual({
      duration: 0.2,
      delay: 0.25,
      ease: standardEase,
    })
    expect(transitionFor('normal', reducedMotionPolicy, 0.25)).toEqual({
      duration: 0,
      delay: 0,
      ease: standardEase,
    })
  })
})

describe('stagger sequencing', () => {
  it('spaces children by the step token', () => {
    expect(staggerDelays({ count: 3, policy: fullMotionPolicy })).toEqual([0, 0.12, 0.24])
  })

  it('caps the wait so a long list still finishes', () => {
    const delays = staggerDelays({ count: 40, policy: fullMotionPolicy, maxDelay: 0.6 })

    expect(Math.max(...delays)).toBe(0.6)
    expect(delays).toHaveLength(40)
  })

  it('reveals the whole group at once under reduced motion', () => {
    expect(staggerDelays({ count: 4, policy: reducedMotionPolicy })).toEqual([0, 0, 0, 0])
  })

  it('handles an empty list', () => {
    expect(staggerDelays({ count: 0, policy: fullMotionPolicy })).toEqual([])
  })
})

describe('the loading rhythm', () => {
  it('is derived from the longest duration token, not invented', () => {
    expect(loadingCycleMs(3)).toBe(parseDurationMs(duration.reveal) * 3)
    expect(spinnerSpeed()).toBe(`${parseDurationMs(duration.reveal)}ms`)
  })
})

describe('reading the preference', () => {
  const queryList = (matches: boolean): MediaQueryLike => ({ matches })

  it('assumes full motion where there is no matchMedia', () => {
    expect(readReducedMotion(undefined)).toBe(false)
    expect(readReducedMotion(null)).toBe(false)
  })

  it('asks for the one query the token layer owns', () => {
    const matchMedia = vi.fn<MatchMediaLike>(() => queryList(true))

    expect(readReducedMotion(matchMedia)).toBe(true)
    expect(matchMedia).toHaveBeenCalledWith(reducedMotionQuery)
  })

  it('subscribes and unsubscribes through the modern listener API', () => {
    const listeners: Array<(event: MediaQueryChangeEvent) => void> = []
    const removeEventListener = vi.fn()
    const query: MediaQueryLike = {
      matches: false,
      addEventListener: (_type, listener) => listeners.push(listener),
      removeEventListener,
    }
    const seen: boolean[] = []

    const dispose = subscribeReducedMotion(
      () => query,
      (reduced) => seen.push(reduced),
    )

    listeners[0]({ matches: true })
    expect(seen).toEqual([true])

    dispose()
    expect(removeEventListener).toHaveBeenCalledTimes(1)
    expect(removeEventListener.mock.calls[0][0]).toBe('change')
    expect(removeEventListener.mock.calls[0][1]).toBe(listeners[0])
  })

  it('falls back to the legacy listener pair', () => {
    const removeListener = vi.fn()
    let captured: ((event: MediaQueryChangeEvent) => void) | null = null
    const query: MediaQueryLike = {
      matches: false,
      addListener: (listener) => {
        captured = listener
      },
      removeListener,
    }

    const dispose = subscribeReducedMotion(
      () => query,
      () => {},
    )

    expect(captured).not.toBeNull()
    dispose()
    expect(removeListener).toHaveBeenCalledWith(captured)
  })

  it('still returns a disposer when there is nothing to subscribe to', () => {
    expect(() => subscribeReducedMotion(null, () => {})()).not.toThrow()
    expect(() =>
      subscribeReducedMotion(
        () => ({ matches: false }),
        () => {},
      )(),
    ).not.toThrow()
  })
})
