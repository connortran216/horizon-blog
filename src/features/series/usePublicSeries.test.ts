import { describe, expect, it } from 'vitest'
import { ApiError } from '../../core/services/api.service'
import { publicSeriesIsAbsent, publicSeriesRequestIsAbsent } from './usePublicSeries'
import type { PublicSeries } from './series.types'

const series = (parts: PublicSeries['parts']): PublicSeries => ({
  id: 9,
  slug: 'database-engineering',
  title: 'Database Engineering',
  description: '',
  author: { id: 1, name: 'Connor Tran' },
  updatedAt: '2026-08-16T00:00:00Z',
  parts,
})

describe('public Series detail state', () => {
  it('separates an absent Series from one that may load on a retry', () => {
    expect(publicSeriesRequestIsAbsent(new ApiError('missing', 404))).toBe(true)
    expect(publicSeriesRequestIsAbsent(new ApiError('temporary', 503))).toBe(false)
    expect(publicSeriesRequestIsAbsent(new Error('offline'))).toBe(false)
  })

  it('counts a Series with no published blogs as absent', () => {
    expect(publicSeriesIsAbsent(series([]))).toBe(true)
    expect(
      publicSeriesIsAbsent(
        series([
          {
            postId: 42,
            title: 'Indexes first',
            excerpt: '',
            readingTime: 6,
            tags: [],
            position: 1,
            publishedAt: null,
          },
        ]),
      ),
    ).toBe(false)
  })
})
