/**
 * Horizon Design System v2 - Series fixtures.
 *
 * Production-shaped sample content for the B6 gallery, and obviously synthetic:
 * every Series is called a sample Series, every part title starts with "Sample",
 * and the artwork is a grey plate with SAMPLE drawn on it. None of this may be
 * mistaken for published writing and none of it is real user data.
 *
 * The set covers what actually breaks a rail and a part list: a long Series with
 * enough parts to page, a one-part Series so the singular is exercised, a Series
 * with no description and no artwork, and an owner-side order containing a
 * draft, a scheduled blog and a published one.
 */

import type {
  ManagedSeriesPart,
  SeriesDetail,
  SeriesPartSummary,
  SeriesReadingContext,
  SeriesSummary,
} from './series.logic'

const samplePlate = (label: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img">` +
      `<rect width="640" height="400" fill="gainsboro"/>` +
      `<text x="320" y="210" font-family="sans-serif" font-size="44" fill="dimgray" ` +
      `text-anchor="middle">${label}</text></svg>`,
  )}`

const sampleAuthor = { name: 'Sample Author', profileHref: '/authors/sample-author' }

function samplePart(position: number, extra: Partial<SeriesPartSummary> = {}): SeriesPartSummary {
  return {
    id: `sample-part-${position}`,
    href: `/blog/sample-part-${position}`,
    title: `Sample part ${position}: one step of the sample Series`,
    excerpt:
      'Sample excerpt. This part covers one step of the sample argument and hands ' +
      'the next one its starting point.',
    readingMinutes: 6 + position,
    tags: ['sample', 'architecture'],
    position,
    publishedAt: `2026-0${Math.min(9, position)}-12T09:00:00.000Z`,
    ...extra,
  }
}

export const sampleSeriesParts: readonly SeriesPartSummary[] = [
  samplePart(1),
  samplePart(2),
  samplePart(3, { excerpt: null, tags: [] }),
  samplePart(4),
  samplePart(5, { readingMinutes: null }),
  samplePart(6),
  samplePart(7),
  samplePart(8, {
    title:
      'Sample part 8: một tiêu đề dài để kiểm tra cách danh sách xuống dòng khi ' +
      'tên bài viết vượt quá một dòng',
  }),
]

export const sampleSeries: SeriesSummary = {
  id: 'sample-series-1',
  slug: 'sample-series',
  href: '/series/sample-series',
  title: 'A sample Series about building things',
  description:
    'Sample description. Eight sample blogs that build one idea in order, from the ' +
    'first sketch to the version that survived contact with production.',
  author: sampleAuthor,
  partCount: sampleSeriesParts.length,
  updatedAt: '2026-09-02T09:00:00.000Z',
  cover: { src: samplePlate('SAMPLE'), alt: 'Sample placeholder Series artwork' },
  topics: ['architecture', 'operations'],
}

export const sampleSeriesDetail: SeriesDetail = { ...sampleSeries, parts: sampleSeriesParts }

/** One part, so the singular in "Series · 1 blog" is exercised. */
export const sampleSingleBlogSeries: SeriesSummary = {
  id: 'sample-series-2',
  slug: 'sample-series-two',
  href: '/series/sample-series-two',
  title: 'A sample Series with one blog in it',
  description: 'Sample description for a Series that has only started.',
  author: sampleAuthor,
  partCount: 1,
  updatedAt: '2026-08-20T09:00:00.000Z',
  cover: { src: samplePlate('SAMPLE'), alt: 'Sample placeholder Series artwork' },
  topics: ['sample'],
}

/** No artwork, no description, no author. The thinnest honest Series card. */
export const sampleBareSeries: SeriesSummary = {
  id: 'sample-series-3',
  slug: 'sample-series-three',
  href: '/series/sample-series-three',
  title: 'A sample Series with no artwork or description',
  partCount: 3,
  cover: null,
}

/** Artwork that will never resolve, so the media failure path is visible. */
export const sampleSeriesWithBrokenCover: SeriesSummary = {
  id: 'sample-series-4',
  slug: 'sample-series-four',
  href: '/series/sample-series-four',
  title: 'A sample Series whose artwork fails to load',
  description: 'Sample description for the media failure case.',
  author: sampleAuthor,
  partCount: 5,
  updatedAt: '2026-07-14T09:00:00.000Z',
  cover: { src: '/sample-media/this-file-does-not-exist.png', alt: 'Sample placeholder artwork' },
}

export const sampleSeriesShelf: readonly SeriesSummary[] = [
  sampleSeries,
  sampleSingleBlogSeries,
  sampleBareSeries,
  sampleSeriesWithBrokenCover,
]

export const sampleSeriesContext: SeriesReadingContext = {
  slug: sampleSeries.slug,
  href: sampleSeries.href,
  title: sampleSeries.title,
  position: 3,
  total: sampleSeriesParts.length,
  previous: { href: '/blog/sample-part-2', title: 'Sample part 2: one step of the sample Series' },
  next: { href: '/blog/sample-part-4', title: 'Sample part 4: one step of the sample Series' },
}

/** The first part: no previous, so the single-target layout is exercised. */
export const sampleSeriesContextAtStart: SeriesReadingContext = {
  ...sampleSeriesContext,
  position: 1,
  previous: null,
  next: { href: '/blog/sample-part-2', title: 'Sample part 2: one step of the sample Series' },
}

export const sampleManagedParts: readonly ManagedSeriesPart[] = [
  {
    id: 'sample-part-1',
    title: 'Sample part 1: one step of the sample Series',
    status: 'published',
  },
  {
    id: 'sample-part-2',
    title: 'Sample part 2: one step of the sample Series',
    status: 'scheduled',
  },
  { id: 'sample-part-3', title: 'Sample part 3: an unfinished sample draft', status: 'draft' },
]
