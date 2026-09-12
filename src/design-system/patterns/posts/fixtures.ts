/**
 * Horizon Design System v2 - post fixtures.
 *
 * Production-shaped sample content for the B6 gallery. Everything here is
 * obviously synthetic and says so on its face: the author is "Sample Author",
 * every title starts with "Sample", and the artwork is a grey placeholder plate
 * with the word SAMPLE drawn on it. Nothing in this file may be mistaken for a
 * published post, and nothing in it is real user data.
 *
 * The set is chosen to cover the cases that actually break a card: a long
 * Vietnamese title that wraps to three lines, an excerpt long enough to clamp,
 * a post with no artwork at all, a post with eleven topics, a post inside a
 * Series, and a cover URL that will never resolve so the media failure path is
 * visible in the gallery rather than only in theory.
 */

import type { AuthorIdentity, PostSummary } from './content.logic'
import type { FilterTag } from './discovery.logic'

/**
 * A grey plate with SAMPLE on it. Inline so the gallery has one cover that
 * always resolves, and so no fixture ever reaches the network.
 */
const samplePlate = (label: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img">` +
      `<rect width="640" height="360" fill="gainsboro"/>` +
      `<text x="320" y="188" font-family="sans-serif" font-size="44" fill="dimgray" ` +
      `text-anchor="middle">${label}</text></svg>`,
  )}`

export const sampleAuthor: AuthorIdentity = {
  name: 'Sample Author',
  avatarUrl: samplePlate('SA'),
  profileHref: '/authors/sample-author',
}

/** An author record with nothing but a name, to exercise the initials path. */
export const sampleAuthorWithoutAvatar: AuthorIdentity = {
  name: 'Nguyen Van Sample',
}

export const samplePost: PostSummary = {
  id: 'sample-post-1',
  href: '/blog/sample-post-1',
  title: 'Sample post: how a request finds a server',
  excerpt:
    'Sample excerpt. A walk through the path a browser request takes from a name ' +
    'to an address to a socket, and the three places it usually goes wrong.',
  cover: { src: samplePlate('SAMPLE'), alt: 'Sample placeholder artwork' },
  tags: ['networking', 'http'],
  metadata: {
    author: sampleAuthor,
    publishedAt: '2026-08-14T09:00:00.000Z',
    readingMinutes: 9,
  },
}

/** Long title, long excerpt, diacritics. The clamping and wrapping case. */
export const sampleLongPost: PostSummary = {
  id: 'sample-post-2',
  href: '/blog/sample-post-2',
  title:
    'Sample post: những điều học được khi xây dựng một hệ thống hàng đợi phân tán ' +
    'và vận hành nó trong hai năm',
  excerpt:
    'Sample excerpt. Một bài viết dài về hàng đợi, độ trễ, và những đánh đổi mà ' +
    'không ai nhắc đến trong tài liệu chính thức. The same paragraph continues in ' +
    'English so the clamp is exercised in both scripts, and keeps going for long ' +
    'enough that a three-line clamp actually has something to cut.',
  cover: { src: samplePlate('SAMPLE'), alt: 'Sample placeholder artwork' },
  tags: ['queues', 'distributed-systems', 'operations'],
  metadata: {
    author: sampleAuthorWithoutAvatar,
    publishedAt: '2026-07-02T09:00:00.000Z',
    readingMinutes: 24,
  },
}

/** No artwork, no excerpt, no reading estimate. The thinnest honest card. */
export const samplePostWithoutMedia: PostSummary = {
  id: 'sample-post-3',
  href: '/blog/sample-post-3',
  title: 'Sample post with no cover image',
  cover: null,
  tags: [],
  metadata: {
    author: sampleAuthor,
    updatedAt: '2026-09-01T09:00:00.000Z',
  },
}

/** Eleven topics, so the overflow chip is exercised at every card width. */
export const samplePostWithManyTags: PostSummary = {
  id: 'sample-post-4',
  href: '/blog/sample-post-4',
  title: 'Sample post with a great many topics',
  excerpt: 'Sample excerpt for the topic overflow case.',
  cover: { src: samplePlate('SAMPLE'), alt: 'Sample placeholder artwork' },
  tags: [
    'python',
    'django',
    'postgres',
    'kafka',
    'redis',
    'docker',
    'kubernetes',
    'observability',
    'testing',
    'ci',
    'performance',
  ],
  metadata: {
    author: sampleAuthor,
    publishedAt: '2026-06-18T09:00:00.000Z',
    readingMinutes: 12,
  },
}

/** Part of a Series, so the Series line appears in the metadata row. */
export const samplePostInSeries: PostSummary = {
  id: 'sample-post-5',
  href: '/blog/sample-post-5',
  title: 'Sample post: part three of a sample Series',
  excerpt: 'Sample excerpt for a post that belongs to a Series.',
  cover: { src: samplePlate('SAMPLE'), alt: 'Sample placeholder artwork' },
  tags: ['architecture'],
  metadata: {
    author: sampleAuthor,
    publishedAt: '2026-05-30T09:00:00.000Z',
    readingMinutes: 7,
    series: {
      slug: 'sample-series',
      title: 'A sample Series about building things',
      position: 3,
      total: 8,
    },
  },
}

/**
 * A cover that will never resolve. Intentional: the gallery needs one card in
 * the media failure state, and a fixture that only ever succeeds hides it.
 */
export const samplePostWithBrokenCover: PostSummary = {
  id: 'sample-post-6',
  href: '/blog/sample-post-6',
  title: 'Sample post whose cover image fails to load',
  excerpt: 'Sample excerpt for the media failure case.',
  cover: { src: '/sample-media/this-file-does-not-exist.png', alt: 'Sample placeholder artwork' },
  tags: ['media'],
  metadata: {
    author: sampleAuthor,
    publishedAt: '2026-04-11T09:00:00.000Z',
    readingMinutes: 4,
  },
}

export const samplePosts: readonly PostSummary[] = [
  samplePost,
  sampleLongPost,
  samplePostWithoutMedia,
  samplePostWithManyTags,
  samplePostInSeries,
  samplePostWithBrokenCover,
]

export const sampleFilterTags: readonly FilterTag[] = [
  { id: 'tag-1', name: 'networking', count: 12 },
  { id: 'tag-2', name: 'python', count: 9 },
  { id: 'tag-3', name: 'distributed-systems', count: 6 },
  { id: 'tag-4', name: 'operations', count: 4 },
  { id: 'tag-5', name: 'architecture', count: 3 },
]

export const sampleSortOptions = [
  { value: 'newest', label: 'Latest first' },
  { value: 'shortest', label: 'Quick reads first' },
] as const
