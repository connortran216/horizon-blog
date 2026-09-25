import { describe, expect, it } from 'vitest'

import {
  AUTO_ADVANCE_MS,
  THREAD_FOCUS,
  USER_PAUSE_MS,
  clampThreadIndex,
  nextThreadIndex,
  threadDetailId,
  threadFocus,
  threadOrdinal,
  threadState,
  trackAdvances,
} from './aboutHero.logic'

describe('trackAdvances', () => {
  it('runs when motion is allowed, nothing is paused and there is somewhere to go', () => {
    expect(trackAdvances({ count: 3, isPaused: false, allowsAmbient: true })).toBe(true)
  })

  it('stops under reduced motion', () => {
    expect(trackAdvances({ count: 3, isPaused: false, allowsAmbient: false })).toBe(false)
  })

  it('stops while the reader has the track paused', () => {
    expect(trackAdvances({ count: 3, isPaused: true, allowsAmbient: true })).toBe(false)
  })

  it('stops when there is only one thread to show', () => {
    expect(trackAdvances({ count: 1, isPaused: false, allowsAmbient: true })).toBe(false)
    expect(trackAdvances({ count: 0, isPaused: false, allowsAmbient: true })).toBe(false)
  })
})

describe('nextThreadIndex', () => {
  it('moves forward', () => {
    expect(nextThreadIndex(0, 3)).toBe(1)
    expect(nextThreadIndex(1, 3)).toBe(2)
  })

  it('wraps at the end', () => {
    expect(nextThreadIndex(2, 3)).toBe(0)
  })

  it('answers 0 for an empty track rather than dividing by zero', () => {
    expect(nextThreadIndex(0, 0)).toBe(0)
  })
})

describe('clampThreadIndex', () => {
  it('leaves an index inside the list alone', () => {
    expect(clampThreadIndex(1, 3)).toBe(1)
  })

  it('pulls an index past the end back onto the last thread', () => {
    expect(clampThreadIndex(7, 3)).toBe(2)
  })

  it('pulls a negative index back to the first thread', () => {
    expect(clampThreadIndex(-2, 3)).toBe(0)
  })

  it('answers 0 for an empty track', () => {
    expect(clampThreadIndex(2, 0)).toBe(0)
  })
})

describe('threadOrdinal', () => {
  it('prints a zero-padded, one-based position', () => {
    expect(threadOrdinal(0)).toBe('01')
    expect(threadOrdinal(2)).toBe('03')
  })

  it('does not pad past two digits', () => {
    expect(threadOrdinal(11)).toBe('12')
  })
})

describe('threadState', () => {
  it('lifts the current thread a luminance step, not a hue step', () => {
    const state = threadState(1, 1)

    expect(state.isActive).toBe(true)
    expect(state.titleColor).toBe('text.primary')
    expect(state.labelColor).toBe('action.primary')
  })

  it('leaves the other threads readable rather than dimming them out', () => {
    const state = threadState(0, 1)

    expect(state.isActive).toBe(false)
    expect(state.titleColor).toBe('text.secondary')
    expect(state.labelColor).toBe('text.muted')
  })

  it('emphasises exactly one thread', () => {
    const active = [0, 1, 2].filter((index) => threadState(index, 2).isActive)

    expect(active).toEqual([2])
  })

  it('presses the selected control and releases the others', () => {
    expect([0, 1, 2].map((index) => threadState(index, 1).ariaPressed)).toEqual([
      false,
      true,
      false,
    ])
  })

  it('reports selection through aria-pressed, not through colour alone', () => {
    for (const index of [0, 1, 2]) {
      const state = threadState(index, 1)

      expect(state.ariaPressed).toBe(state.isActive)
    }
  })
})

describe('threadDetailId', () => {
  it('gives each thread a stable, unique id for aria-describedby', () => {
    const ids = [0, 1, 2].map(threadDetailId)

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids[0]).toBe('about-thread-01-detail')
  })
})

describe('threadFocus', () => {
  it('gives each of the three threads its own place beside the copy', () => {
    const places = [0, 1, 2].map((index) => threadFocus(index, 3))

    expect(new Set(places.map((place) => `${place?.x}:${place?.y}`)).size).toBe(3)
    for (const place of places) {
      expect(place?.x).toBeGreaterThan(0.6)
    }
  })

  it('reads down the plate in track order', () => {
    const [build, write, shape] = [0, 1, 2].map((index) => threadFocus(index, 3)!)

    expect(build.y).toBeLessThan(write.y)
    expect(write.y).toBeLessThan(shape.y)
  })

  it('clamps a stale index and reuses places on a longer track', () => {
    expect(threadFocus(9, 3)).toEqual(THREAD_FOCUS[2])
    expect(threadFocus(3, 4)).toEqual(THREAD_FOCUS[0])
  })

  it('has no focus on an empty track', () => {
    expect(threadFocus(0, 0)).toBeNull()
  })
})

describe('dwell intervals', () => {
  it('gives the reader longer than one automatic step before the track resumes', () => {
    expect(USER_PAUSE_MS).toBeGreaterThan(AUTO_ADVANCE_MS)
  })
})
