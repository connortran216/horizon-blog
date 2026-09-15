import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createRequestDeadline,
  DEFAULT_REQUEST_TIMEOUT_MS,
  isCallerAbort,
  isDeadlineTimeout,
} from './request-deadline'

describe('createRequestDeadline', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('does not abort before the budget elapses', async () => {
    const deadline = createRequestDeadline({ timeoutMs: 1_000 })

    await vi.advanceTimersByTimeAsync(999)

    expect(deadline.signal?.aborted).toBe(false)
  })

  it('aborts with a TimeoutError once the budget elapses', async () => {
    const deadline = createRequestDeadline({ timeoutMs: 1_000 })

    await vi.advanceTimersByTimeAsync(1_000)

    expect(deadline.signal?.aborted).toBe(true)
    expect(isDeadlineTimeout(deadline.signal?.reason)).toBe(true)
    expect(isCallerAbort(deadline.signal?.reason)).toBe(false)
  })

  it('defaults to DEFAULT_REQUEST_TIMEOUT_MS when no override is given', async () => {
    const deadline = createRequestDeadline()

    expect(deadline.timeoutMs).toBe(DEFAULT_REQUEST_TIMEOUT_MS)

    await vi.advanceTimersByTimeAsync(DEFAULT_REQUEST_TIMEOUT_MS)

    expect(deadline.signal?.aborted).toBe(true)
  })

  it('release() cancels the timer so it never fires', async () => {
    const deadline = createRequestDeadline({ timeoutMs: 1_000 })

    deadline.release()
    await vi.advanceTimersByTimeAsync(5_000)

    expect(deadline.signal?.aborted).toBe(false)
  })

  it('disables the deadline entirely for a non-positive timeoutMs', async () => {
    const deadline = createRequestDeadline({ timeoutMs: 0 })

    await vi.advanceTimersByTimeAsync(60_000)

    expect(deadline.signal).toBeUndefined()
  })

  it('lets an external caller signal end the request independently, distinguishable from a timeout', async () => {
    const external = new AbortController()
    const deadline = createRequestDeadline({ timeoutMs: 5_000, signal: external.signal })

    external.abort()

    expect(deadline.signal?.aborted).toBe(true)
    expect(isCallerAbort(deadline.signal?.reason)).toBe(true)
    expect(isDeadlineTimeout(deadline.signal?.reason)).toBe(false)

    // The deadline timer is still pending underneath; releasing it should not throw.
    deadline.release()
  })

  it('still resolves to a timeout when the deadline fires before an external signal ever does', async () => {
    const external = new AbortController()
    const deadline = createRequestDeadline({ timeoutMs: 1_000, signal: external.signal })

    await vi.advanceTimersByTimeAsync(1_000)

    expect(isDeadlineTimeout(deadline.signal?.reason)).toBe(true)
    expect(external.signal.aborted).toBe(false)
  })
})

describe('isDeadlineTimeout / isCallerAbort', () => {
  it('only isDeadlineTimeout is true for a TimeoutError DOMException', () => {
    const error = new DOMException('timed out', 'TimeoutError')
    expect(isDeadlineTimeout(error)).toBe(true)
    expect(isCallerAbort(error)).toBe(false)
  })

  it('only isCallerAbort is true for an AbortError DOMException', () => {
    const error = new DOMException('aborted', 'AbortError')
    expect(isCallerAbort(error)).toBe(true)
    expect(isDeadlineTimeout(error)).toBe(false)
  })

  it('both are false for an unrelated error', () => {
    const error = new Error('boom')
    expect(isDeadlineTimeout(error)).toBe(false)
    expect(isCallerAbort(error)).toBe(false)
  })
})
