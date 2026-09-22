import { describe, expect, it, vi } from 'vitest'

import {
  LIGHT_REST,
  finePointerQuery,
  lightPositionIn,
  pointerLightState,
  readFinePointer,
  subscribeFinePointer,
} from './pointerLight.logic'
import type { MediaQueryLike } from './policy.logic'

const box = { left: 100, top: 50, width: 400, height: 250 }

describe('lightPositionIn', () => {
  it('maps the pointer to unit coordinates inside the surface', () => {
    expect(lightPositionIn(box, 300, 175)).toEqual({ x: 0.5, y: 0.5 })
    expect(lightPositionIn(box, 100, 50)).toEqual({ x: 0, y: 0 })
  })

  it('clamps a pointer that has left the surface', () => {
    expect(lightPositionIn(box, 900, -20)).toEqual({ x: 1, y: 0 })
  })

  it('rests when the surface has no size yet', () => {
    expect(lightPositionIn({ ...box, width: 0 }, 300, 175)).toEqual(LIGHT_REST)
  })
})

describe('pointerLightState', () => {
  const base = { allowsPointerFollowing: true, hasFinePointer: true, isHovering: true }

  it('lights up for a hovering fine pointer under full motion', () => {
    expect(pointerLightState(base)).toEqual({ isEnabled: true, opacity: 1 })
  })

  it('fades out when the pointer leaves', () => {
    expect(pointerLightState({ ...base, isHovering: false })).toEqual({
      isEnabled: true,
      opacity: 0,
    })
  })

  it('does not exist on a touch device', () => {
    expect(pointerLightState({ ...base, hasFinePointer: false }).isEnabled).toBe(false)
  })

  it('does not exist under reduced motion', () => {
    expect(pointerLightState({ ...base, allowsPointerFollowing: false }).isEnabled).toBe(false)
  })

  it('can be switched off by the caller', () => {
    expect(pointerLightState({ ...base, disabled: true }).isEnabled).toBe(false)
  })
})

describe('reading the pointer query', () => {
  it('assumes touch when there is no matchMedia', () => {
    expect(readFinePointer(undefined)).toBe(false)
  })

  it('asks the fine-pointer query', () => {
    const matchMedia = vi.fn(
      (query: string): MediaQueryLike => ({ matches: query === finePointerQuery }),
    )

    expect(readFinePointer(matchMedia)).toBe(true)
    expect(matchMedia).toHaveBeenCalledWith(finePointerQuery)
  })

  it('subscribes and disposes through the modern listener API', () => {
    const add = vi.fn()
    const remove = vi.fn()
    const matchMedia = (): MediaQueryLike => ({
      matches: true,
      addEventListener: add,
      removeEventListener: remove,
    })
    const listener = vi.fn()

    const dispose = subscribeFinePointer(matchMedia, listener)

    expect(add).toHaveBeenCalledOnce()
    add.mock.calls[0][1]({ matches: false })
    expect(listener).toHaveBeenCalledWith(false)

    dispose()
    expect(remove).toHaveBeenCalledOnce()
  })

  it('returns a no-op disposer without matchMedia', () => {
    expect(() => subscribeFinePointer(null, () => {})()).not.toThrow()
  })
})
