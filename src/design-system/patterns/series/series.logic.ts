/**
 * Horizon Design System v2 - Series content and identity.
 *
 * `DESIGN.md`: "Series: book-like identity, overview, ordered parts, and
 * reading context." A Series is not a post with more fields, and a Series card
 * is not a `PostCard` with a different heading. The token source already says
 * so - `componentTokens.series` carries its own radius, its own cover radius
 * and a connector colour that no post surface has - and this module is where
 * that identity is turned into decisions a test can hold on to.
 *
 * The ordered parts are the other half. A part is not a card: it carries an
 * ordinal, it is connected to the part above and below it, and its position in
 * the reading order is the most important thing about it.
 */

import { componentTokens, radii, space } from '../../../theme/tokens'
import { formatPostDate, pluralise, type AuthorIdentity } from '../posts/content.logic'

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

export interface SeriesPartSummary {
  /** Stable key. The post id the API keys the part on. */
  readonly id: string
  readonly href: string
  readonly title: string
  readonly excerpt?: string | null
  readonly readingMinutes?: number | null
  readonly tags?: readonly string[]
  /** One-based reading position. */
  readonly position: number
  readonly publishedAt?: string | null
}

export interface SeriesCoverImage {
  readonly src?: string | null
  readonly alt: string
}

export interface SeriesSummary {
  readonly id: string
  readonly slug: string
  readonly href: string
  readonly title: string
  readonly description?: string | null
  readonly author?: AuthorIdentity | null
  readonly partCount: number
  readonly updatedAt?: string | null
  readonly cover?: SeriesCoverImage | null
  readonly topics?: readonly string[]
}

export interface SeriesDetail extends SeriesSummary {
  readonly parts: readonly SeriesPartSummary[]
}

/** Where the reader is inside a Series, as the reader page needs it. */
export interface SeriesReadingContext {
  readonly slug: string
  readonly href: string
  readonly title: string
  readonly position: number
  readonly total: number
  readonly previous: { readonly href: string; readonly title: string } | null
  readonly next: { readonly href: string; readonly title: string } | null
}

/** An owned Series part, as the management surface needs it. */
export interface ManagedSeriesPart {
  readonly id: string
  readonly title: string
  readonly status: 'draft' | 'published' | 'scheduled'
}

/* -------------------------------------------------------------------------- */
/* Book identity                                                              */
/* -------------------------------------------------------------------------- */

export interface SeriesPresentation {
  readonly cardRadius: string
  readonly coverRadius: string
  readonly connector: string
  readonly connectorActive: string
  readonly partRest: string
  readonly partCurrent: string
  /** Side of the ordinal marker. Big enough to be a target, not a button. */
  readonly ordinalSize: string
}

/**
 * The Series family's own values, read from the token source rather than
 * restated. A Series cover is drawn on the feature radius while a post card
 * cover is on the card radius, which is the cheapest reliable way to tell a
 * shelf of Series from a grid of posts at a glance.
 */
export function seriesPresentation(): SeriesPresentation {
  return {
    cardRadius: componentTokens.series.radius,
    coverRadius: componentTokens.series.coverRadius,
    connector: componentTokens.series.connector,
    connectorActive: componentTokens.series.connectorActive,
    partRest: componentTokens.series.partRest,
    partCurrent: componentTokens.series.partCurrent,
    ordinalSize: space[12],
  }
}

/**
 * Whether the Series surface still reads as a book rather than as another post
 * card. Asserted in `series.test.ts`; if the two families are ever tuned to the
 * same cover radius this fails, which is the point.
 */
export function seriesIsDistinctFromPostCard(): boolean {
  return seriesPresentation().coverRadius !== componentTokens.card.radius
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

/** `Series · 4 blogs`. The eyebrow that names the object before its title. */
export function seriesIdentityLabel(partCount: number): string {
  return `Series · ${pluralise(Math.max(0, Math.floor(partCount)), 'blog')}`
}

/** `01`, `07`, `12`. Two digits so the left edge of the list stays straight. */
export function partOrdinal(position: number): string {
  return String(Math.max(1, Math.floor(position))).padStart(2, '0')
}

/** `Part 3 of 8`, the wording `DESIGN.md` fixes for Series position. */
export function partLabel(position: number, total: number): string {
  return `Part ${position} of ${total}`
}

export interface SeriesFact {
  readonly kind: 'parts' | 'duration' | 'updated' | 'author'
  readonly label: string
}

/**
 * The facts under a Series title: how many blogs, how long in total, who wrote
 * them, when it last changed. Absent facts are dropped, and a total reading
 * time of zero is treated as absent rather than shown as "0 min total".
 */
export function seriesFacts(series: SeriesSummary, totalMinutes?: number | null): SeriesFact[] {
  const facts: SeriesFact[] = [
    { kind: 'parts', label: pluralise(Math.max(0, Math.floor(series.partCount)), 'blog') },
  ]

  if (totalMinutes != null && Number.isFinite(totalMinutes) && totalMinutes > 0) {
    facts.push({ kind: 'duration', label: `${Math.ceil(totalMinutes)} min total` })
  }

  if (series.author?.name?.trim()) {
    facts.push({ kind: 'author', label: series.author.name.trim() })
  }

  const updated = formatPostDate(series.updatedAt)

  if (updated) {
    facts.push({ kind: 'updated', label: `Updated ${updated.label}` })
  }

  return facts
}

/** Sum the parts' reading estimates, or `null` when none of them has one. */
export function seriesTotalMinutes(parts: readonly SeriesPartSummary[]): number | null {
  const total = parts.reduce(
    (sum, part) => sum + (Number.isFinite(part.readingMinutes) ? (part.readingMinutes ?? 0) : 0),
    0,
  )

  return total > 0 ? total : null
}

/* -------------------------------------------------------------------------- */
/* Ordered parts                                                              */
/* -------------------------------------------------------------------------- */

export type PartReadingState = 'previous' | 'current' | 'upcoming'

export interface PartConnector {
  /** A line running up to the part above. */
  readonly above: boolean
  /** A line running down to the part below. */
  readonly below: boolean
  readonly state: PartReadingState
  /** The connector below this part is drawn in the active colour. */
  readonly activeBelow: boolean
}

/**
 * The ordered connectors that make a part list read as a sequence.
 *
 * The first part has no line above it and the last none below, so the run has a
 * visible beginning and end rather than trailing off into the page. When the
 * reader is inside the Series, everything before their position is drawn as
 * travelled: the connector up to and including the current part is active, the
 * rest is not. That is the one piece of state a part list carries, and it is
 * the reason a part list can never be a stack of post cards.
 */
export function partConnector(
  index: number,
  count: number,
  currentIndex: number | null = null,
): PartConnector {
  const state: PartReadingState =
    currentIndex == null || index > currentIndex
      ? 'upcoming'
      : index === currentIndex
        ? 'current'
        : 'previous'

  return {
    above: index > 0,
    below: index < count - 1,
    state,
    activeBelow: currentIndex != null && index < currentIndex,
  }
}

/** The colour of one connector segment. Never a literal at the call site. */
export function connectorColor(connector: PartConnector): string {
  const presentation = seriesPresentation()

  return connector.activeBelow ? presentation.connectorActive : presentation.connector
}

export interface SeriesSpineSegments {
  /** The trace entering this part from the previous part. */
  readonly above: boolean
  /** The trace leaving this part toward the next part. */
  readonly below: boolean
}

/**
 * Which connector segments belong to the active book-spine trace.
 *
 * The target can be the part the reader is currently on or a temporary
 * pointer/keyboard preview. Invalid targets produce no trace rather than
 * painting progress beyond the real list.
 */
export function seriesSpineSegments(
  index: number,
  count: number,
  activeIndex: number | null,
): SeriesSpineSegments {
  const target = activeIndex != null && activeIndex >= 0 && activeIndex < count ? activeIndex : null

  return {
    above: target != null && index > 0 && index <= target,
    below: target != null && index < target && index < count - 1,
  }
}

/* -------------------------------------------------------------------------- */
/* Reading context                                                            */
/* -------------------------------------------------------------------------- */

export type SeriesNavDirection = 'previous' | 'next'

export interface SeriesNavTarget {
  readonly direction: SeriesNavDirection
  readonly href: string
  readonly title: string
  /** Accessible name: the direction plus the destination's own title. */
  readonly ariaLabel: string
}

/**
 * The previous and next parts, as navigation targets.
 *
 * Each one carries the destination's title in its accessible name. "Next" on
 * its own is the most common defect in a reader's Series navigation: a screen
 * reader user tabbing the page hears "Previous, Next" and has no way to know
 * what either one opens.
 */
export function seriesNavTargets(context: SeriesReadingContext): SeriesNavTarget[] {
  const targets: SeriesNavTarget[] = []

  if (context.previous) {
    targets.push({
      direction: 'previous',
      href: context.previous.href,
      title: context.previous.title,
      ariaLabel: `Previous part: ${context.previous.title}`,
    })
  }

  if (context.next) {
    targets.push({
      direction: 'next',
      href: context.next.href,
      title: context.next.title,
      ariaLabel: `Next part: ${context.next.title}`,
    })
  }

  return targets
}

/** `Part 3 of 8`, for the reading-context header. */
export function seriesContextLabel(context: SeriesReadingContext): string {
  return partLabel(context.position, context.total)
}

/* -------------------------------------------------------------------------- */
/* Managing a Series                                                          */
/* -------------------------------------------------------------------------- */

export type MoveDirection = 'up' | 'down'

export interface ManageItemControls {
  readonly canMoveUp: boolean
  readonly canMoveDown: boolean
  readonly moveUpLabel: string
  readonly moveDownLabel: string
  readonly removeLabel: string
  /** `01`, matching the reader-facing part list. */
  readonly ordinal: string
}

/**
 * The controls on one row of the Series manager.
 *
 * Every label names the blog it acts on. Three identical "Move up" buttons in a
 * list is the same failure as three identical "Next" links: the control works
 * and nobody can tell which one they are on.
 */
export function manageItemControls(
  index: number,
  count: number,
  title: string,
): ManageItemControls {
  return {
    canMoveUp: index > 0,
    canMoveDown: index < count - 1,
    moveUpLabel: `Move ${title} earlier in the Series`,
    moveDownLabel: `Move ${title} later in the Series`,
    removeLabel: `Remove ${title} from the Series`,
    ordinal: partOrdinal(index + 1),
  }
}

/**
 * Move one item. Out-of-range moves return the original array rather than a
 * copy, so a caller can compare by identity and skip a render.
 */
export function moveItem<T>(items: readonly T[], index: number, direction: MoveDirection): T[] {
  const target = direction === 'up' ? index - 1 : index + 1

  if (index < 0 || index >= items.length || target < 0 || target >= items.length) {
    return items as T[]
  }

  const next = [...items]
  const moved = next[index]
  next[index] = next[target]
  next[target] = moved

  return next
}

export function removeItemAt<T>(items: readonly T[], index: number): T[] {
  if (index < 0 || index >= items.length) {
    return items as T[]
  }

  return items.filter((_, position) => position !== index)
}

/**
 * Whether the order on screen still matches the order that was loaded.
 *
 * The manager replaces the whole order in one call, so an unsaved reorder is
 * data the reader can lose by navigating away. Knowing it is dirty is what lets
 * the surface say so.
 */
export function orderIsDirty(original: readonly string[], next: readonly string[]): boolean {
  if (original.length !== next.length) {
    return true
  }

  return original.some((id, index) => id !== next[index])
}

/** Radius the manager rows sit on. Denser than a reader-facing part. */
export const manageRowRadius = radii.control
