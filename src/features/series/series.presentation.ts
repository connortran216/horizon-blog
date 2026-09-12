/**
 * The feature layer's map from the public Series API onto the design system's
 * Series contract.
 *
 * The API speaks in `postId`, `partCount` and `PublicSeriesContext`; the Series
 * patterns speak in `SeriesSummary`, `SeriesPartSummary` and
 * `SeriesReadingContext`. Translating once here keeps every Series surface
 * reading the same shapes, and keeps the translation itself testable without a
 * DOM.
 *
 * Nothing in the public Series payload carries cover artwork, so `cover` is
 * deliberately absent and the design system draws its own absent plate. That is
 * the honest state, not a gap papered over with a stock image.
 */

import { toPublicPostPath } from '../../core'
import type { SeriesPartSummary, SeriesReadingContext, SeriesSummary } from '../../design-system'
import type {
  PublicSeries,
  PublicSeriesContext,
  PublicSeriesPart,
  PublicSeriesSummary,
} from './series.types'

/** Router path to a Series overview. One place, so no page spells it by hand. */
export function seriesHref(slug: string): string {
  return `/series/${slug}`
}

export function toSeriesSummary(series: PublicSeriesSummary): SeriesSummary {
  return {
    id: String(series.id),
    slug: series.slug,
    href: seriesHref(series.slug),
    title: series.title,
    description: series.description || null,
    author: { name: series.author.name },
    partCount: series.partCount,
    updatedAt: series.updatedAt,
  }
}

/**
 * A Series detail page's own summary. The part count comes from the parts that
 * were actually returned rather than from a separate field, because the detail
 * payload has no `part_count` and counting what is on the page is what keeps
 * "Series · 4 blogs" true when one part is unpublished.
 */
export function toSeriesDetailSummary(series: PublicSeries): SeriesSummary {
  return {
    id: String(series.id),
    slug: series.slug,
    href: seriesHref(series.slug),
    title: series.title,
    description: series.description || null,
    author: { name: series.author.name },
    partCount: series.parts.length,
    updatedAt: series.updatedAt,
  }
}

export function toSeriesPart(part: PublicSeriesPart): SeriesPartSummary {
  return {
    id: String(part.postId),
    href: toPublicPostPath(part.postId),
    title: part.title,
    excerpt: part.excerpt || null,
    readingMinutes: part.readingTime > 0 ? part.readingTime : null,
    tags: part.tags,
    position: part.position,
    publishedAt: part.publishedAt,
  }
}

export function toSeriesParts(parts: readonly PublicSeriesPart[]): SeriesPartSummary[] {
  return parts.map(toSeriesPart)
}

/**
 * The topics a Series covers: every topic its parts carry, de-duplicated in
 * first-appearance order and capped.
 *
 * Order follows the reading order rather than an alphabetical sort, so the
 * topic the Series opens on is the first one a reader sees. The cap is here and
 * not at the call site because two pages showing a different number of topics
 * for the same Series is the kind of drift nobody notices.
 */
export function seriesTopics(parts: readonly PublicSeriesPart[], limit = 8): string[] {
  const seen = new Set<string>()
  const topics: string[] = []

  for (const part of parts) {
    for (const tag of part.tags) {
      const name = tag.trim()

      if (name.length === 0 || seen.has(name)) {
        continue
      }

      seen.add(name)
      topics.push(name)

      if (topics.length >= limit) {
        return topics
      }
    }
  }

  return topics
}

/** Where the reader is inside a Series, as the reading-context pattern needs it. */
export function toSeriesReadingContext(context: PublicSeriesContext): SeriesReadingContext {
  return {
    slug: context.series.slug,
    href: seriesHref(context.series.slug),
    title: context.series.title,
    position: context.position,
    total: context.total,
    previous: context.previous
      ? { href: toPublicPostPath(context.previous.postId), title: context.previous.title }
      : null,
    next: context.next
      ? { href: toPublicPostPath(context.next.postId), title: context.next.title }
      : null,
  }
}
