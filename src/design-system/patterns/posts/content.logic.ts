/**
 * Horizon Design System v2 - the post content contracts.
 *
 * `PostMetadata` and `AuthorIdentity` are the two shapes every post pattern in
 * this area agrees on. They are deliberately not the API record: a card should
 * not have to know whether the field is called `published_at`, `publishedAt` or
 * `createdAt`, and a pattern that reads three of those spellings is a pattern
 * that will read a fourth next quarter. The feature layer maps its record into
 * these shapes once, and every pattern below reads the same two.
 *
 * All presentation decisions - which facts appear, in what order, how they
 * pluralise, what happens when one is missing - live here as pure functions so
 * they can be tested without rendering. `CONVENTIONS.md` explains why that is
 * the only kind of test this repository has.
 */

import type { ImageSource } from '../../components/media'

/** A person, as a post surface needs them. */
export interface AuthorIdentity {
  readonly name: string
  /** Absolute or resolved URL. `null` when the author has no picture. */
  readonly avatarUrl?: string | null
  /** Router path to the author archive. Absent means the name is plain text. */
  readonly profileHref?: string | null
}

/** The Series a post belongs to, as the post surfaces see it. */
export interface PostSeriesReference {
  readonly slug: string
  readonly title: string
  /** One-based. */
  readonly position: number
  readonly total: number
}

/** Every fact a post surface may show above or below the title. */
export interface PostMetadataContent {
  readonly author?: AuthorIdentity | null
  /** ISO-8601. */
  readonly publishedAt?: string | null
  /** ISO-8601. Used only when there is no publication date. */
  readonly updatedAt?: string | null
  readonly readingMinutes?: number | null
  readonly series?: PostSeriesReference | null
}

/**
 * A post's cover, as the discovery surfaces need it.
 *
 * `alt` is required and there is no `decorative` escape hatch: a cover plate on
 * a card is the largest thing on that card and it always carries meaning. A
 * post with no artwork omits the whole object instead, and the pattern draws
 * the absent state - which is a different thing from a picture nobody described.
 */
export interface PostCoverImage {
  readonly src?: string | null
  /** Width-descriptor candidates, when the feature layer has resolved them. */
  readonly sources?: readonly ImageSource[]
  readonly sizes?: string
  readonly alt: string
}

/** Everything a post discovery surface needs about one post. */
export interface PostSummary {
  /** Stable key. The route id or slug, whichever the caller keys its list on. */
  readonly id: string
  /** Router path to the post. */
  readonly href: string
  readonly title: string
  readonly excerpt?: string | null
  readonly cover?: PostCoverImage | null
  readonly tags?: readonly string[]
  readonly metadata: PostMetadataContent
}

/**
 * Shown when a post genuinely has no author name. It is a statement about the
 * data, not a person, which is why it is not a made-up name.
 */
export const UNKNOWN_AUTHOR_NAME = 'Unknown author'

/* -------------------------------------------------------------------------- */
/* Author                                                                     */
/* -------------------------------------------------------------------------- */

export function authorDisplayName(author: AuthorIdentity | null | undefined): string {
  const name = author?.name?.trim() ?? ''

  return name.length > 0 ? name : UNKNOWN_AUTHOR_NAME
}

/**
 * Up to two initials for the avatar fallback. Built from the first and last
 * word so "Nguyen Van An" gives "NA" rather than "NV", and a single-word name
 * gives one letter rather than two halves of the same syllable.
 *
 * `toLocaleUpperCase` without a locale argument, so a Turkish reader's dotted
 * capital I is produced by their own runtime rather than by an English rule.
 */
export function authorInitials(author: AuthorIdentity | null | undefined): string {
  const words = authorDisplayName(author)
    .split(/\s+/)
    .filter((word) => word.length > 0)

  if (words.length === 0) {
    return ''
  }

  const first = words[0]
  const last = words[words.length - 1]
  const letters = words.length === 1 ? first.slice(0, 1) : `${first.slice(0, 1)}${last.slice(0, 1)}`

  return letters.toLocaleUpperCase()
}

/** Whether the name should be a link. An empty href is not a destination. */
export function authorProfileHref(author: AuthorIdentity | null | undefined): string | null {
  const href = author?.profileHref?.trim() ?? ''

  return href.length > 0 ? href : null
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export interface FormattedDate {
  /** Human-readable, e.g. `Sep 6, 2026`. */
  readonly label: string
  /** `YYYY-MM-DD`, for the `datetime` attribute of a `time` element. */
  readonly machine: string
}

/**
 * Format a real date, or return `null` so the caller drops the item entirely.
 *
 * Not `toLocaleDateString`: its output depends on the runtime's locale data, so
 * the same build renders a different string on two machines and no test can
 * assert on it. A blog needs one legible date, and this produces one.
 *
 * An unparseable or empty value is `null`, never `Invalid Date` and never
 * today's date - a card that quietly claims to have been published today is
 * worse than a card with no date.
 */
export function formatPostDate(value: string | null | undefined): FormattedDate | null {
  const raw = value?.trim() ?? ''

  if (raw.length === 0) {
    return null
  }

  const parsed = new Date(raw)
  const time = parsed.getTime()

  if (Number.isNaN(time)) {
    return null
  }

  const year = parsed.getUTCFullYear()
  const month = parsed.getUTCMonth()
  const day = parsed.getUTCDate()
  const pad = (part: number) => String(part).padStart(2, '0')

  return {
    label: `${MONTHS[month]} ${day}, ${year}`,
    machine: `${year}-${pad(month + 1)}-${pad(day)}`,
  }
}

/* -------------------------------------------------------------------------- */
/* Counts and pluralisation                                                   */
/* -------------------------------------------------------------------------- */

/**
 * English pluralisation for the small set of nouns this system counts. It is a
 * function rather than a template at every call site because "1 blogs" and
 * "2 reply" are the defects that survive review, and there is exactly one place
 * here to get them right.
 */
export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${Math.abs(count) === 1 ? singular : plural}`
}

/**
 * Reading time, rounded up, floored at one minute, or `null` when the post has
 * no estimate. "0 min read" says the post is empty; omitting the fact says only
 * that we do not know how long it takes, which is the truth.
 */
export function readingTimeLabel(minutes: number | null | undefined): string | null {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) {
    return null
  }

  return `${Math.max(1, Math.ceil(minutes))} min read`
}

/** `Part 3 of 8`. The system's wording for Series position, per `DESIGN.md`. */
export function seriesPositionLabel(series: PostSeriesReference): string {
  return `Part ${series.position} of ${series.total}`
}

/* -------------------------------------------------------------------------- */
/* Metadata line                                                              */
/* -------------------------------------------------------------------------- */

export type PostMetadataItemKind = 'author' | 'date' | 'readingTime' | 'series'

export interface PostMetadataItem {
  readonly kind: PostMetadataItemKind
  readonly label: string
  /** Present on the date item, for a `time` element's `datetime`. */
  readonly machineDate?: string
  /** Present when the item is a link. */
  readonly href?: string
  /** True when the label alone is ambiguous and needs a spoken prefix. */
  readonly srPrefix?: string
}

export interface PostMetadataOptions {
  /** Drop the author where the surrounding page has already named them. */
  readonly showAuthor?: boolean
  /** Drop the Series line where a dedicated Series pattern already shows it. */
  readonly showSeries?: boolean
  readonly showReadingTime?: boolean
}

/**
 * The metadata line, as an ordered list of the facts that actually exist.
 *
 * Order is fixed - author, date, reading time, Series - because a reader
 * scanning a grid of cards should find the same fact in the same position on
 * every one of them. Absent facts are dropped rather than rendered as a dash,
 * so a card with no reading estimate is shorter instead of emptier.
 *
 * The publication date wins over the update date. When only the update date
 * exists it is labelled as one: a draft that was edited yesterday has not been
 * published, and showing the edit date bare would claim otherwise.
 */
export function postMetadataItems(
  content: PostMetadataContent,
  options: PostMetadataOptions = {},
): PostMetadataItem[] {
  const { showAuthor = true, showSeries = true, showReadingTime = true } = options
  const items: PostMetadataItem[] = []

  if (showAuthor && content.author) {
    const href = authorProfileHref(content.author)

    items.push({
      kind: 'author',
      label: authorDisplayName(content.author),
      ...(href ? { href } : {}),
    })
  }

  const published = formatPostDate(content.publishedAt)
  const updated = published ? null : formatPostDate(content.updatedAt)
  const date = published ?? updated

  if (date) {
    items.push({
      kind: 'date',
      label: published ? date.label : `Updated ${date.label}`,
      machineDate: date.machine,
      ...(published ? {} : { srPrefix: 'Last updated' }),
    })
  }

  const reading = showReadingTime ? readingTimeLabel(content.readingMinutes) : null

  if (reading) {
    items.push({ kind: 'readingTime', label: reading })
  }

  if (showSeries && content.series) {
    items.push({
      kind: 'series',
      label: seriesPositionLabel(content.series),
      href: `/series/${content.series.slug}`,
      srPrefix: content.series.title,
    })
  }

  return items
}

/* -------------------------------------------------------------------------- */
/* Body copy                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The excerpt, or `null`.
 *
 * There is deliberately no filler string here. `DESIGN.md` forbids invented
 * content, and "Fresh thoughts are on the way." is invented content that reads
 * like an editorial promise the site has not made. A post with no excerpt shows
 * its title and its metadata, and that is a complete card.
 */
export function excerptOrNull(excerpt: string | null | undefined): string | null {
  const trimmed = excerpt?.trim() ?? ''

  return trimmed.length > 0 ? trimmed : null
}

export interface VisibleTags {
  readonly visible: readonly string[]
  readonly overflowCount: number
  /** `+4 more`, or `null` when nothing overflowed. */
  readonly overflowLabel: string | null
  /** Spoken on the overflow chip so the count is not a bare number. */
  readonly overflowSrLabel: string | null
}

/**
 * Cap a tag list without losing the count.
 *
 * A post with eleven tags must not push its own title off the card, and it must
 * not silently look like a post with three. The overflow count is the honest
 * middle: three chips and "+8 more".
 */
export function visibleTags(
  tags: readonly string[] | null | undefined,
  limit: number,
): VisibleTags {
  const cleaned = (tags ?? []).map((tag) => tag.trim()).filter((tag) => tag.length > 0)
  const cap = Math.max(0, Math.floor(limit))
  const visible = cleaned.slice(0, cap)
  const overflowCount = cleaned.length - visible.length

  return {
    visible,
    overflowCount,
    overflowLabel: overflowCount > 0 ? `+${overflowCount} more` : null,
    overflowSrLabel: overflowCount > 0 ? `${pluralise(overflowCount, 'more topic')}` : null,
  }
}
