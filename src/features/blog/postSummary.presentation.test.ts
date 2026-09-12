import { describe, expect, it } from 'vitest'

import { toPublicPostPath, type BlogPostSummary } from '../../core'
import type { ResolvedMediaSource } from '../media/media.api'
import {
  coverSourcesFrom,
  postCoverFrom,
  postExcerptFrom,
  toPostSummary,
} from './postSummary.presentation'

const post: BlogPostSummary = {
  id: '42',
  title: 'Indexes first',
  subtitle: undefined,
  excerpt: 'Start with the read path.',
  author: { id: 7, username: 'Connor Tran', avatar: 'https://cdn.example.com/avatar.png' },
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-02T00:00:00Z',
  readingTime: 6,
  tags: ['database'],
  featuredImage: undefined,
  status: 'published',
  slug: '42',
  series: {
    id: 9,
    slug: 'database-engineering',
    title: 'Database Engineering',
    position: 1,
    total: 3,
  },
}

const media: ResolvedMediaSource = {
  id: 'm1',
  url: 'https://cdn.example.com/cover-1200.png',
  variants: [
    {
      url: 'https://cdn.example.com/cover-600.png',
      mimeType: 'image/png',
      sizeBytes: 1,
      height: 1,
      width: 600,
    },
    { url: '', mimeType: 'image/png', sizeBytes: 1, height: 1, width: 1200 },
    {
      url: 'https://cdn.example.com/cover-0.png',
      mimeType: 'image/png',
      sizeBytes: 1,
      height: 1,
      width: 0,
    },
  ],
}

describe('coverSourcesFrom', () => {
  it('drops variants that could not appear in a srcset', () => {
    expect(coverSourcesFrom(media)).toEqual([
      { src: 'https://cdn.example.com/cover-600.png', width: 600 },
    ])
  })

  it('returns undefined rather than an empty candidate list', () => {
    expect(coverSourcesFrom(undefined)).toBeUndefined()
    expect(
      coverSourcesFrom({ id: 'm2', url: 'https://cdn.example.com/a.png', variants: [] }),
    ).toBeUndefined()
  })
})

describe('postCoverFrom', () => {
  it('describes the cover with the post title', () => {
    expect(postCoverFrom(media, 'Indexes first', '50vw')).toEqual({
      src: 'https://cdn.example.com/cover-1200.png',
      sources: [{ src: 'https://cdn.example.com/cover-600.png', width: 600 }],
      sizes: '50vw',
      alt: 'Indexes first',
    })
  })

  it('is null when there is no artwork, so the absent state is reachable', () => {
    expect(postCoverFrom(undefined, 'Indexes first')).toBeNull()
    expect(postCoverFrom({ id: 'm3', url: '   ', variants: [] }, 'Indexes first')).toBeNull()
  })
})

describe('postExcerptFrom', () => {
  it('prefers the excerpt and falls back to the subtitle', () => {
    expect(postExcerptFrom({ excerpt: 'From the excerpt', subtitle: 'From the subtitle' })).toBe(
      'From the excerpt',
    )
    expect(postExcerptFrom({ excerpt: '', subtitle: 'From the subtitle' })).toBe(
      'From the subtitle',
    )
  })

  it('invents nothing when the post has neither', () => {
    expect(postExcerptFrom({ excerpt: '', subtitle: '' })).toBeNull()
    expect(postExcerptFrom({ excerpt: undefined, subtitle: undefined })).toBeNull()
  })
})

describe('toPostSummary', () => {
  it('maps the record onto the design system contract', () => {
    const summary = toPostSummary(post, media, { coverSizes: '50vw' })

    expect(summary.id).toBe('42')
    expect(summary.href).toBe(toPublicPostPath(42))
    expect(summary.title).toBe('Indexes first')
    expect(summary.excerpt).toBe('Start with the read path.')
    expect(summary.cover?.src).toBe('https://cdn.example.com/cover-1200.png')
    expect(summary.tags).toEqual(['database'])
    expect(summary.metadata.author).toEqual({
      name: 'Connor Tran',
      avatarUrl: 'https://cdn.example.com/avatar.png',
    })
    expect(summary.metadata.publishedAt).toBe('2026-06-01T00:00:00Z')
    expect(summary.metadata.readingMinutes).toBe(6)
    expect(summary.metadata.series).toEqual({
      slug: 'database-engineering',
      title: 'Database Engineering',
      position: 1,
      total: 3,
    })
  })

  it('drops the author where the surrounding page has already named them', () => {
    expect(toPostSummary(post, undefined, { withAuthor: false }).metadata.author).toBeNull()
  })

  it('reports an unknown reading time as unknown rather than as one minute', () => {
    const summary = toPostSummary({ ...post, readingTime: undefined }, undefined)

    expect(summary.metadata.readingMinutes).toBeNull()
  })

  it('carries no Series reference for a standalone post', () => {
    expect(toPostSummary({ ...post, series: null }, undefined).metadata.series).toBeNull()
  })
})
