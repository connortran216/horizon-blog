/**
 * Horizon Design System v2 - gallery content selection.
 *
 * The content and media controls resolve here, in one place, so an entry
 * renderer never has to branch on them itself. Everything below is built from
 * the fixtures the pattern bundles already ship; the gallery invents no new
 * sample content beyond the deliberately overlong strings that the "long"
 * setting needs, and those are as obviously synthetic as the fixtures are.
 */

import {
  samplePost,
  sampleLongPost,
  samplePostWithBrokenCover,
  samplePostWithManyTags,
  samplePostInSeries,
  samplePostWithoutMedia,
  samplePosts,
} from '../patterns/posts/fixtures'
import {
  sampleBareSeries,
  sampleSeries,
  sampleSeriesParts,
  sampleSeriesShelf,
  sampleSeriesWithBrokenCover,
} from '../patterns/series/fixtures'
import type { PostSummary } from '../patterns/posts/content.logic'
import type { SeriesSummary } from '../patterns/series/series.logic'
import type { ContentChoice, MediaChoice } from './types'

/** A cover that always resolves: the inline grey SAMPLE plate the fixtures use. */
export const PRESENT_IMAGE: string = samplePost.cover?.src ?? ''

/** A cover that never resolves. Same path the post fixtures use for failure. */
export const BROKEN_IMAGE = '/sample-media/this-file-does-not-exist.png'

export const SAMPLE_IMAGE_ALT = 'Sample placeholder artwork'

/** Long copy for the content control. Vietnamese and English, both overlong. */
export const longCopy = {
  title:
    'Sample post: những điều học được khi vận hành một hệ thống hàng đợi phân tán ' +
    'trong hai năm, và tại sao phần khó nhất không nằm ở hàng đợi - a deliberately ' +
    'overlong sample title that has to wrap on every review width',
  excerpt:
    'Sample excerpt. Một đoạn mô tả dài, viết bằng tiếng Việt có dấu, để kiểm tra ' +
    'cách hệ thống cắt dòng và giới hạn số dòng khi nội dung vượt quá khung. The ' +
    'same paragraph then continues in English, at length, so that a three-line ' +
    'clamp has something to cut and a two-line clamp has something to cut twice.',
  label: 'Sample label that is far longer than any label should ever be - nhãn dài bất thường',
  sentence:
    'Sample sentence. Một câu dài để kiểm tra cách văn bản xuống dòng bên trong ' +
    'một khung hẹp, followed by more English so the line wraps at every width.',
} as const

export function selectImage(media: MediaChoice): string | null {
  if (media === 'missing') {
    return null
  }

  return media === 'broken' ? BROKEN_IMAGE : PRESENT_IMAGE
}

function withMedia(post: PostSummary, media: MediaChoice): PostSummary {
  if (media === 'missing') {
    return { ...post, cover: null }
  }

  if (media === 'broken') {
    return { ...post, cover: samplePostWithBrokenCover.cover }
  }

  return { ...post, cover: post.cover ?? samplePost.cover }
}

function withLongCopy(post: PostSummary): PostSummary {
  return { ...post, title: longCopy.title, excerpt: longCopy.excerpt }
}

export function selectPost(content: ContentChoice, media: MediaChoice): PostSummary {
  const base = content === 'long' ? withLongCopy(sampleLongPost) : samplePost

  return withMedia(base, media)
}

/**
 * The whole sample shelf under the current controls. The set keeps its own
 * variety - no artwork, many topics, part of a Series - because a collection
 * that is uniform proves nothing about a grid.
 */
export function selectPosts(content: ContentChoice, media: MediaChoice): readonly PostSummary[] {
  const base =
    content === 'long'
      ? samplePosts.map((post, index) => (index === 0 ? withLongCopy(post) : post))
      : samplePosts

  return base.map((post) => withMedia(post, media))
}

function withSeriesMedia(series: SeriesSummary, media: MediaChoice): SeriesSummary {
  if (media === 'missing') {
    return { ...series, cover: null }
  }

  if (media === 'broken') {
    return { ...series, cover: sampleSeriesWithBrokenCover.cover }
  }

  return { ...series, cover: series.cover ?? sampleSeries.cover }
}

export function selectSeries(content: ContentChoice, media: MediaChoice): SeriesSummary {
  const base =
    content === 'long'
      ? { ...sampleSeries, title: longCopy.title, description: longCopy.excerpt }
      : sampleSeries

  return withSeriesMedia(base, media)
}

export function selectSeriesShelf(
  content: ContentChoice,
  media: MediaChoice,
): readonly SeriesSummary[] {
  const base =
    content === 'long'
      ? sampleSeriesShelf.map((series, index) =>
          index === 0
            ? { ...series, title: longCopy.title, description: longCopy.excerpt }
            : series,
        )
      : sampleSeriesShelf

  return base.map((series) => withSeriesMedia(series, media))
}

export {
  sampleBareSeries,
  samplePostInSeries,
  samplePostWithManyTags,
  samplePostWithoutMedia,
  sampleSeriesParts,
}
