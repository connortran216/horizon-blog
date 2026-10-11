/**
 * The owner's Series, as the profile draws them.
 *
 * Two maps out of one list: each Series as a spine, and each blog in a Series
 * as the `Part X of Y` its owner card shows. Both use the owner's order, drafts
 * included - this is the author looking at their own plan, not a reader looking
 * at what is live.
 *
 * Pure, so every decision is testable without a DOM.
 */

import {
  formatPostDate,
  type PostSeriesReference,
  type SpinePart,
  type SpinePartState,
} from '../../design-system'
import type { OwnerSeries, OwnerSeriesPart } from './series.types'

/**
 * Where an author manages a Series. One route for every Series until the
 * per-Series owner page exists; kept here so the profile never writes it.
 */
export const OWNER_SERIES_MANAGE_PATH = '/series/manage'

/**
 * A part's state. The backend has two statuses; a draft with a publication
 * time is the scheduled one, which is what the profile's Scheduled tab means.
 */
export function ownerPartState(part: OwnerSeriesPart): SpinePartState {
  if (part.status === 'published') {
    return 'published'
  }

  return part.scheduledPublishAt ? 'scheduled' : 'draft'
}

function inReadingOrder(parts: readonly OwnerSeriesPart[]): OwnerSeriesPart[] {
  return [...parts].sort((left, right) => left.position - right.position)
}

export function toSpineParts(series: OwnerSeries): SpinePart[] {
  return inReadingOrder(series.parts).map((part) => ({
    id: String(part.postId),
    title: part.title,
    state: ownerPartState(part),
  }))
}

/** "Updated Oct 8, 2026", or nothing when the server sent no usable date. */
export function ownerSeriesUpdatedLabel(series: OwnerSeries): string | null {
  const date = formatPostDate(series.updatedAt)

  return date ? `Updated ${date.label}` : null
}

/**
 * Every blog in one of the owner's Series, keyed by blog id, with the position
 * its card shows. A blog belongs to at most one Series, so the first entry is
 * the only one.
 */
export function ownerSeriesByPostId(
  series: readonly OwnerSeries[],
): ReadonlyMap<string, PostSeriesReference> {
  const index = new Map<string, PostSeriesReference>()

  for (const item of series) {
    const parts = inReadingOrder(item.parts)

    parts.forEach((part, at) => {
      const key = String(part.postId)
      if (!index.has(key)) {
        index.set(key, {
          slug: item.slug,
          title: item.title,
          position: at + 1,
          total: parts.length,
          href: OWNER_SERIES_MANAGE_PATH,
        })
      }
    })
  }

  return index
}
