import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DEFAULT_ANALYTICS_DELIVERY_INTERVAL_MS,
  scheduleRoutineAnalyticsDelivery,
} from './useReaderSession'

describe('reader session analytics delivery', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses one shared 30-second routine delivery interval', () => {
    const flush = vi.fn()
    const stop = scheduleRoutineAnalyticsDelivery(flush)

    vi.advanceTimersByTime(DEFAULT_ANALYTICS_DELIVERY_INTERVAL_MS - 1)
    expect(flush).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(flush).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(DEFAULT_ANALYTICS_DELIVERY_INTERVAL_MS)
    expect(flush).toHaveBeenCalledTimes(2)

    stop()
    vi.advanceTimersByTime(DEFAULT_ANALYTICS_DELIVERY_INTERVAL_MS)
    expect(flush).toHaveBeenCalledTimes(2)
  })
})
