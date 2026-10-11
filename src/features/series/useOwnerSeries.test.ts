import { describe, expect, it } from 'vitest'

import { ownerSeriesLoading } from './useOwnerSeries'

describe('owner Series loading state', () => {
  it('reads as loading before the first request starts, so nothing claims zero Series', () => {
    expect(ownerSeriesLoading(true, 'idle')).toBe(true)
    expect(ownerSeriesLoading(true, 'loading')).toBe(true)
  })

  it('stops loading once the list has an answer, either way', () => {
    expect(ownerSeriesLoading(true, 'ready')).toBe(false)
    expect(ownerSeriesLoading(true, 'failed')).toBe(false)
  })

  it('is never loading without the grant, because no request is made', () => {
    expect(ownerSeriesLoading(false, 'idle')).toBe(false)
  })
})
