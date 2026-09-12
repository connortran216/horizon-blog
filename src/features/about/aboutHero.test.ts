import { describe, expect, it } from 'vitest'

import {
  AUTO_ADVANCE_MS,
  POINTER_CENTRE,
  USER_PAUSE_MS,
  ambientScene,
  clampThreadIndex,
  nextThreadIndex,
  pointerPositionIn,
  threadDetailId,
  threadOrdinal,
  threadState,
  trackAdvances,
  type AmbientSceneInput,
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

describe('pointerPositionIn', () => {
  const box = { left: 100, top: 50, width: 400, height: 200 }

  it('answers the centre at the centre', () => {
    expect(pointerPositionIn(box, 300, 150)).toEqual({ x: 0, y: 0 })
  })

  it('answers the corners at the corners', () => {
    expect(pointerPositionIn(box, 100, 50)).toEqual({ x: -1, y: -1 })
    expect(pointerPositionIn(box, 500, 250)).toEqual({ x: 1, y: 1 })
  })

  it('clamps a position reported outside the box', () => {
    expect(pointerPositionIn(box, -900, 900)).toEqual({ x: -1, y: 1 })
  })

  it('answers the centre for a box that has not been laid out', () => {
    expect(pointerPositionIn({ left: 0, top: 0, width: 0, height: 0 }, 40, 40)).toEqual(
      POINTER_CENTRE,
    )
  })
})

describe('ambientScene', () => {
  const moving: AmbientSceneInput = {
    threadIndex: 0,
    threadCount: 3,
    allowsAmbient: true,
    allowsPointerFollowing: true,
    isHeld: false,
  }

  it('follows the pointer at two rates, which is what reads as depth', () => {
    const scene = ambientScene(moving)

    expect(scene.isStill).toBe(false)
    expect(scene.travel.glowPx).toBeGreaterThan(scene.travel.washPx)
    expect(scene.travel.washPx).toBeGreaterThan(0)
  })

  it('runs the pass of light when nothing is being touched', () => {
    expect(ambientScene(moving).sweep.isRunning).toBe(true)
  })

  it('pauses the pass of light while the reader holds the track', () => {
    expect(ambientScene({ ...moving, isHeld: true }).sweep.isRunning).toBe(false)
  })

  it('keeps answering the pointer while the track is held', () => {
    const held = ambientScene({ ...moving, isHeld: true })

    expect(held.travel.glowPx).toBe(ambientScene(moving).travel.glowPx)
    expect(held.isStill).toBe(false)
  })

  it('gives each thread a visibly different scene', () => {
    const scenes = [0, 1, 2].map((threadIndex) => ambientScene({ ...moving, threadIndex }))
    const signatures = scenes.map(
      (scene) => `${scene.glow.opacity}/${scene.accentGlow.opacity}/${scene.glow.scale}`,
    )

    expect(new Set(signatures).size).toBe(scenes.length)
  })

  it('stays inside the profile table for an index past its end', () => {
    expect(ambientScene({ ...moving, threadIndex: 9 }).glow.opacity).toBeGreaterThan(0)
  })

  it('produces no movement at all under reduced motion', () => {
    const still = ambientScene({
      ...moving,
      allowsAmbient: false,
      allowsPointerFollowing: false,
    })

    expect(still.isStill).toBe(true)
    expect(still.travel).toEqual({ glowPx: 0, washPx: 0 })
    expect(still.glow.scale).toBe(1)
    expect(still.accentGlow.scale).toBe(1)
    expect(still.sweep.isRunning).toBe(false)
    expect(still.sweep.opacity).toBe(0)
  })

  it('draws the same still picture for every thread under reduced motion', () => {
    const scenes = [0, 1, 2].map((threadIndex) =>
      ambientScene({
        ...moving,
        threadIndex,
        allowsAmbient: false,
        allowsPointerFollowing: false,
      }),
    )

    for (const scene of scenes) {
      expect(scene).toEqual(scenes[0])
    }
  })

  it('stops the pointer response on its own, without stopping the scene', () => {
    const scene = ambientScene({ ...moving, allowsPointerFollowing: false })

    expect(scene.travel).toEqual({ glowPx: 0, washPx: 0 })
    expect(scene.sweep.isRunning).toBe(true)
    expect(scene.isStill).toBe(false)
  })
})

describe('dwell intervals', () => {
  it('gives the reader longer than one automatic step before the track resumes', () => {
    expect(USER_PAUSE_MS).toBeGreaterThan(AUTO_ADVANCE_MS)
  })
})
