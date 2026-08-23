import { describe, expect, it } from 'vitest'
import { ApiError } from '../../core/services/api.service'
import { getPublicSeriesListError, incrementSeriesListRequestVersion } from './usePublicSeriesList'

describe('public Series list state', () => {
  it('keeps empty and transient failures independently retryable', () => {
    expect(getPublicSeriesListError(new ApiError('missing', 404))).toBe('No Series are available.')
    expect(getPublicSeriesListError(new ApiError('temporary', 503))).toBe(
      'Series could not load right now.',
    )
    expect(incrementSeriesListRequestVersion(2)).toBe(3)
  })
})
