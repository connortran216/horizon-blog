import { describe, expect, it } from 'vitest'

import { shouldTrackActiveTime } from './reader-session.activity'

describe('reader session activity helpers', () => {
  it('tracks active time only while visible, focused, and recently active', () => {
    expect(
      shouldTrackActiveTime({
        nowMs: 10_000,
        lastActivityMs: 8_000,
        idleTimeoutMs: 30_000,
        isVisible: true,
        isFocused: true,
      }),
    ).toBe(true)

    expect(
      shouldTrackActiveTime({
        nowMs: 40_001,
        lastActivityMs: 10_000,
        idleTimeoutMs: 30_000,
        isVisible: true,
        isFocused: true,
      }),
    ).toBe(false)

    expect(
      shouldTrackActiveTime({
        nowMs: 10_000,
        lastActivityMs: 8_000,
        idleTimeoutMs: 30_000,
        isVisible: false,
        isFocused: true,
      }),
    ).toBe(false)

    expect(
      shouldTrackActiveTime({
        nowMs: 10_000,
        lastActivityMs: 8_000,
        idleTimeoutMs: 30_000,
        isVisible: true,
        isFocused: false,
      }),
    ).toBe(false)
  })
})
