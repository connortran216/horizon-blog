import { describe, expect, it } from 'vitest'

import {
  OWNER_SERIES_MANAGE_PATH,
  ownerPartState,
  ownerSeriesByPostId,
  ownerSeriesUpdatedLabel,
  toSpineParts,
} from './ownerSeries.presentation'
import type { OwnerSeries, OwnerSeriesPart } from './series.types'

const part = (overrides: Partial<OwnerSeriesPart> = {}): OwnerSeriesPart => ({
  postId: 1,
  title: 'Sample part',
  status: 'published',
  position: 1,
  publishedAt: null,
  scheduledPublishAt: null,
  ...overrides,
})

const series = (overrides: Partial<OwnerSeries> = {}): OwnerSeries => ({
  id: 3,
  slug: 'sample-series',
  title: 'Sample Series',
  description: 'Sample description.',
  parts: [],
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-08T09:00:00Z',
  ...overrides,
})

describe('ownerPartState', () => {
  it('reads a draft with a publication time as scheduled', () => {
    expect(ownerPartState(part())).toBe('published')
    expect(ownerPartState(part({ status: 'draft' }))).toBe('draft')
    expect(
      ownerPartState(part({ status: 'draft', scheduledPublishAt: '2026-10-14T02:00:00Z' })),
    ).toBe('scheduled')
  })
})

describe('toSpineParts', () => {
  it('orders the parts by position, whatever order the server sent', () => {
    const parts = toSpineParts(
      series({
        parts: [
          part({ postId: 20, title: 'Second', position: 2, status: 'draft' }),
          part({ postId: 10, title: 'First', position: 1 }),
        ],
      }),
    )

    expect(parts).toEqual([
      { id: '10', title: 'First', state: 'published' },
      { id: '20', title: 'Second', state: 'draft' },
    ])
  })
})

describe('ownerSeriesUpdatedLabel', () => {
  it('states the last update, or nothing for an unusable date', () => {
    expect(ownerSeriesUpdatedLabel(series())).toBe('Updated Oct 8, 2026')
    expect(ownerSeriesUpdatedLabel(series({ updatedAt: '' }))).toBeNull()
  })
})

describe('ownerSeriesByPostId', () => {
  it('gives every blog its position in the owner order, drafts counted', () => {
    const index = ownerSeriesByPostId([
      series({
        parts: [
          part({ postId: 7, position: 2, status: 'draft' }),
          part({ postId: 5, position: 1 }),
        ],
      }),
    ])

    expect(index.get('5')).toEqual({
      slug: 'sample-series',
      title: 'Sample Series',
      position: 1,
      total: 2,
      href: OWNER_SERIES_MANAGE_PATH,
    })
    expect(index.get('7')?.position).toBe(2)
    expect(index.has('9')).toBe(false)
  })
})
