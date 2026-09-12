import { describe, expect, it } from 'vitest'

import {
  UNKNOWN_AUTHOR_NAME,
  authorDisplayName,
  authorInitials,
  authorProfileHref,
  excerptOrNull,
  formatPostDate,
  pluralise,
  postMetadataItems,
  readingTimeLabel,
  seriesPositionLabel,
  visibleTags,
} from './content.logic'

describe('author identity', () => {
  it('uses the name when there is one', () => {
    expect(authorDisplayName({ name: 'Sample Author' })).toBe('Sample Author')
  })

  it('names the absence rather than inventing a person', () => {
    expect(authorDisplayName(null)).toBe(UNKNOWN_AUTHOR_NAME)
    expect(authorDisplayName({ name: '   ' })).toBe(UNKNOWN_AUTHOR_NAME)
  })

  it('builds initials from the first and last word', () => {
    expect(authorInitials({ name: 'Nguyen Van Sample' })).toBe('NS')
    expect(authorInitials({ name: 'Sample' })).toBe('S')
  })

  it('keeps initials to two letters however long the name is', () => {
    expect(authorInitials({ name: 'A B C D E F' })).toHaveLength(2)
  })

  it('treats a blank profile href as no destination', () => {
    expect(authorProfileHref({ name: 'Sample Author', profileHref: '  ' })).toBeNull()
    expect(authorProfileHref({ name: 'Sample Author', profileHref: '/authors/x' })).toBe(
      '/authors/x',
    )
  })
})

describe('formatPostDate', () => {
  it('formats a real date the same way on every machine', () => {
    expect(formatPostDate('2026-08-14T09:00:00.000Z')).toEqual({
      label: 'Aug 14, 2026',
      machine: '2026-08-14',
    })
  })

  it('handles a date-only string', () => {
    expect(formatPostDate('2026-01-05')?.label).toBe('Jan 5, 2026')
  })

  it('returns null rather than claiming a post was published today', () => {
    expect(formatPostDate(undefined)).toBeNull()
    expect(formatPostDate('')).toBeNull()
    expect(formatPostDate('not a date')).toBeNull()
  })
})

describe('counts and pluralisation', () => {
  it('never renders "1 blogs"', () => {
    expect(pluralise(1, 'blog')).toBe('1 blog')
    expect(pluralise(0, 'blog')).toBe('0 blogs')
    expect(pluralise(4, 'blog')).toBe('4 blogs')
  })

  it('takes an irregular plural', () => {
    expect(pluralise(2, 'reply', 'replies')).toBe('2 replies')
    expect(pluralise(1, 'reply', 'replies')).toBe('1 reply')
  })

  it('rounds reading time up and floors it at a minute', () => {
    expect(readingTimeLabel(0.2)).toBe('1 min read')
    expect(readingTimeLabel(9)).toBe('9 min read')
    expect(readingTimeLabel(9.1)).toBe('10 min read')
  })

  it('omits reading time rather than claiming a post takes no time', () => {
    expect(readingTimeLabel(0)).toBeNull()
    expect(readingTimeLabel(-3)).toBeNull()
    expect(readingTimeLabel(null)).toBeNull()
    expect(readingTimeLabel(Number.NaN)).toBeNull()
  })

  it('uses the design contract wording for Series position', () => {
    expect(seriesPositionLabel({ slug: 's', title: 'S', position: 3, total: 8 })).toBe(
      'Part 3 of 8',
    )
  })
})

describe('postMetadataItems', () => {
  const author = { name: 'Sample Author', profileHref: '/authors/sample-author' }

  it('keeps one fixed order so a grid of cards scans', () => {
    const items = postMetadataItems({
      author,
      publishedAt: '2026-08-14T09:00:00.000Z',
      readingMinutes: 9,
      series: { slug: 'sample', title: 'Sample Series', position: 2, total: 5 },
    })

    expect(items.map((item) => item.kind)).toEqual(['author', 'date', 'readingTime', 'series'])
  })

  it('drops the facts that do not exist instead of rendering a dash', () => {
    const items = postMetadataItems({ author: null, publishedAt: null, readingMinutes: null })

    expect(items).toEqual([])
  })

  it('prefers the publication date over the update date', () => {
    const items = postMetadataItems({
      publishedAt: '2026-08-14T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    })

    expect(items).toHaveLength(1)
    expect(items[0].label).toBe('Aug 14, 2026')
  })

  it('labels an update date as one, so an unpublished post cannot look published', () => {
    const items = postMetadataItems({ updatedAt: '2026-09-01T09:00:00.000Z' })

    expect(items[0].label).toBe('Updated Sep 1, 2026')
    expect(items[0].srPrefix).toBe('Last updated')
  })

  it('carries a machine-readable date for the time element', () => {
    const items = postMetadataItems({ publishedAt: '2026-08-14T09:00:00.000Z' })

    expect(items[0].machineDate).toBe('2026-08-14')
  })

  it('links the author only when there is a profile to link to', () => {
    expect(postMetadataItems({ author })[0].href).toBe('/authors/sample-author')
    expect(postMetadataItems({ author: { name: 'Sample Author' } })[0].href).toBeUndefined()
  })

  it('lets a surface that already names the author drop it', () => {
    const items = postMetadataItems(
      { author, publishedAt: '2026-08-14T09:00:00.000Z' },
      { showAuthor: false },
    )

    expect(items.map((item) => item.kind)).toEqual(['date'])
  })

  it('gives the Series item the Series title as its spoken context', () => {
    const items = postMetadataItems({
      series: { slug: 'sample', title: 'Sample Series', position: 2, total: 5 },
    })

    expect(items[0].label).toBe('Part 2 of 5')
    expect(items[0].srPrefix).toBe('Sample Series')
    expect(items[0].href).toBe('/series/sample')
  })
})

describe('excerptOrNull', () => {
  it('never substitutes editorial filler for a missing excerpt', () => {
    expect(excerptOrNull(undefined)).toBeNull()
    expect(excerptOrNull('   ')).toBeNull()
    expect(excerptOrNull(' Sample excerpt. ')).toBe('Sample excerpt.')
  })
})

describe('visibleTags', () => {
  const many = ['a', 'b', 'c', 'd', 'e']

  it('caps the list and keeps the count', () => {
    const result = visibleTags(many, 2)

    expect(result.visible).toEqual(['a', 'b'])
    expect(result.overflowCount).toBe(3)
    expect(result.overflowLabel).toBe('+3 more')
    expect(result.overflowSrLabel).toBe('3 more topics')
  })

  it('says nothing about overflow when nothing overflowed', () => {
    const result = visibleTags(['a'], 3)

    expect(result.overflowCount).toBe(0)
    expect(result.overflowLabel).toBeNull()
    expect(result.overflowSrLabel).toBeNull()
  })

  it('pluralises the overflow announcement', () => {
    expect(visibleTags(many, 4).overflowSrLabel).toBe('1 more topic')
  })

  it('drops blank tags rather than rendering an empty chip', () => {
    expect(visibleTags(['a', '  ', 'b'], 5).visible).toEqual(['a', 'b'])
  })

  it('survives a missing tag list', () => {
    expect(visibleTags(undefined, 3).visible).toEqual([])
  })
})
