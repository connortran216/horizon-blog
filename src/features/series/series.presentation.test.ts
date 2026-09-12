import { describe, expect, it } from 'vitest'

import { toPublicPostPath } from '../../core'
import {
  seriesHref,
  seriesTopics,
  toSeriesDetailSummary,
  toSeriesPart,
  toSeriesReadingContext,
  toSeriesSummary,
} from './series.presentation'
import type { PublicSeries, PublicSeriesPart } from './series.types'

const part = (overrides: Partial<PublicSeriesPart> = {}): PublicSeriesPart => ({
  postId: 42,
  title: 'Indexes first',
  excerpt: 'Start with the read path.',
  readingTime: 6,
  tags: ['database'],
  position: 1,
  publishedAt: null,
  ...overrides,
})

const detail: PublicSeries = {
  id: 9,
  slug: 'database-engineering',
  title: 'Database Engineering',
  description: 'Connected blogs about practical database design.',
  author: { id: 1, name: 'Connor Tran' },
  updatedAt: '2026-08-16T00:00:00Z',
  parts: [part(), part({ postId: 43, title: 'Query plans', position: 2, tags: ['postgresql'] })],
}

describe('toSeriesSummary', () => {
  it('maps a listed Series onto the Series contract', () => {
    expect(
      toSeriesSummary({
        id: 9,
        slug: 'database-engineering',
        title: 'Database Engineering',
        description: 'Connected blogs about practical database design.',
        author: { id: 1, name: 'Connor Tran' },
        partCount: 4,
        updatedAt: '2026-08-16T00:00:00Z',
      }),
    ).toEqual({
      id: '9',
      slug: 'database-engineering',
      href: '/series/database-engineering',
      title: 'Database Engineering',
      description: 'Connected blogs about practical database design.',
      author: { name: 'Connor Tran' },
      partCount: 4,
      updatedAt: '2026-08-16T00:00:00Z',
    })
  })

  it('treats an empty description as no description', () => {
    expect(
      toSeriesSummary({
        id: 9,
        slug: 'a',
        title: 'A',
        description: '',
        author: { id: 1, name: 'Connor Tran' },
        partCount: 1,
        updatedAt: '2026-08-16T00:00:00Z',
      }).description,
    ).toBeNull()
  })
})

describe('toSeriesDetailSummary', () => {
  it('counts the parts the page actually received', () => {
    expect(toSeriesDetailSummary(detail).partCount).toBe(2)
  })
})

describe('toSeriesPart', () => {
  it('maps a part onto the ordered-part contract', () => {
    expect(toSeriesPart(part())).toEqual({
      id: '42',
      href: toPublicPostPath(42),
      title: 'Indexes first',
      excerpt: 'Start with the read path.',
      readingMinutes: 6,
      tags: ['database'],
      position: 1,
      publishedAt: null,
    })
  })

  it('reports a missing reading estimate as unknown rather than as zero', () => {
    expect(toSeriesPart(part({ readingTime: 0 })).readingMinutes).toBeNull()
  })

  it('treats an empty excerpt as no excerpt', () => {
    expect(toSeriesPart(part({ excerpt: '' })).excerpt).toBeNull()
  })
})

describe('seriesTopics', () => {
  it('keeps reading order and removes duplicates', () => {
    expect(
      seriesTopics([
        part({ tags: ['database', 'postgresql'] }),
        part({ postId: 43, tags: ['postgresql', 'indexes'] }),
      ]),
    ).toEqual(['database', 'postgresql', 'indexes'])
  })

  it('caps the list so one Series cannot fill the header with chips', () => {
    const many = part({ tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] })

    expect(seriesTopics([many])).toHaveLength(8)
    expect(seriesTopics([many], 3)).toEqual(['a', 'b', 'c'])
  })

  it('ignores blank tags', () => {
    expect(seriesTopics([part({ tags: ['  ', 'database'] })])).toEqual(['database'])
  })
})

describe('toSeriesReadingContext', () => {
  it('resolves both neighbours to public post paths', () => {
    const context = toSeriesReadingContext({
      series: { id: 9, slug: 'database-engineering', title: 'Database Engineering' },
      position: 2,
      total: 3,
      previous: part(),
      next: part({ postId: 44, title: 'Replication', position: 3 }),
    })

    expect(context.href).toBe(seriesHref('database-engineering'))
    expect(context.previous).toEqual({ href: toPublicPostPath(42), title: 'Indexes first' })
    expect(context.next).toEqual({ href: toPublicPostPath(44), title: 'Replication' })
  })

  it('leaves a missing neighbour null so no dead control is drawn', () => {
    const context = toSeriesReadingContext({
      series: { id: 9, slug: 'a', title: 'A' },
      position: 1,
      total: 2,
      previous: null,
      next: null,
    })

    expect(context.previous).toBeNull()
    expect(context.next).toBeNull()
  })
})
