/**
 * Horizon Design System v2 - the owner's spine of a Series.
 *
 * The spine is how an author sees a Series at a glance: one mark per part on a
 * hairline, in reading order. What it has to say is which parts a reader can
 * reach. A reader walks a Series from Part 1, so the line is lit through the
 * unbroken run of published parts from the start and goes dark at the first
 * part that is not live - the place a reader stops, even when a later part is
 * already published.
 *
 * Every fact the marks draw is also in words: the tally under the title and a
 * spoken label per mark. Shape and colour repeat the words; they never replace
 * them.
 */

import { pluralise } from '../posts/content.logic'

export type SpinePartState = 'published' | 'scheduled' | 'draft'

export interface SpinePart {
  readonly id: string
  readonly title: string
  readonly state: SpinePartState
}

export interface SpineMark {
  readonly id: string
  readonly state: SpinePartState
  /** One-based. */
  readonly position: number
  readonly title: string
  /** Whether the lit run reaches this mark. */
  readonly lit: boolean
  /** The whole fact, for assistive technology: "Part 2, draft: Title". */
  readonly spoken: string
}

const stateWords: Record<SpinePartState, string> = {
  published: 'live',
  scheduled: 'scheduled',
  draft: 'draft',
}

/**
 * The most parts drawn as separate marks. Twelve 16px marks with room between
 * them fit the narrowest track (a phone's content width, or the spine's
 * `spineColumnMin`); past that the spine is drawn as one segmented bar.
 */
export const SPINE_MARK_LIMIT = 12

export function spineIsDense(count: number): boolean {
  return count > SPINE_MARK_LIMIT
}

/** How many parts, from Part 1, a reader can walk through without a gap. */
export function spineLiveRun(parts: readonly Pick<SpinePart, 'state'>[]): number {
  let run = 0

  for (const part of parts) {
    if (part.state !== 'published') {
      break
    }
    run += 1
  }

  return run
}

/**
 * How far along the line the light reaches, from 0 to 1.
 *
 * Marks sit at equal steps from the first to the last, so the run ending at
 * mark `k` (zero-based) covers `k / (count - 1)` of the line. One live part
 * lights its own mark and no line; a single-part Series has no line at all.
 */
export function spineLitExtent(parts: readonly Pick<SpinePart, 'state'>[]): number {
  const run = spineLiveRun(parts)

  if (parts.length < 2 || run < 2) {
    return 0
  }

  return (run - 1) / (parts.length - 1)
}

export function spineMarks(parts: readonly SpinePart[]): SpineMark[] {
  const run = spineLiveRun(parts)

  return parts.map((part, index) => ({
    id: part.id,
    state: part.state,
    position: index + 1,
    title: part.title,
    lit: index < run,
    spoken: `Part ${index + 1}, ${stateWords[part.state]}: ${part.title}`,
  }))
}

/**
 * The tally under the title.
 *
 * "5 parts · 2 live · 3 not live yet" - the three numbers an author needs
 * before deciding whether a Series is ready to be read. An empty Series says
 * so, and says readers cannot see it, because the public Series pages show
 * live parts only.
 */
export function spineTally(parts: readonly Pick<SpinePart, 'state'>[]): string {
  if (parts.length === 0) {
    return 'No parts yet · not shown to readers'
  }

  const live = parts.filter((part) => part.state === 'published').length
  const waiting = parts.length - live
  const facts = [pluralise(parts.length, 'part'), `${live} live`]

  if (waiting > 0) {
    facts.push(`${waiting} not live yet`)
  }

  return facts.join(' · ')
}

/** The track's own name, for the list of marks. */
export function spineTrackLabel(title: string): string {
  return `Parts of ${title}, in reading order`
}
