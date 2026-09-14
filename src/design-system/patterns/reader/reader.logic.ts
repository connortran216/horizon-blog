/**
 * Horizon Design System v2 - reading decisions.
 *
 * Reading progress, the active heading in the table of contents, deep links to
 * a heading, and the order the reader's regions appear in.
 *
 * All four are arithmetic over numbers the caller has already measured. Nothing
 * here touches the DOM: the components read `getBoundingClientRect` once per
 * frame and hand the numbers to these functions, which is what makes "the TOC
 * highlights the right heading" something a test can prove.
 */

import { space, transitionFor } from '../../../theme/tokens'
import type { MotionPolicy } from '../../motion'

/* -------------------------------------------------------------------------- */
/* Reading progress                                                           */
/* -------------------------------------------------------------------------- */

export interface ReadingProgressInput {
  /** The prose element's top, relative to the viewport. */
  readonly contentTop: number
  readonly contentHeight: number
  readonly viewportHeight: number
}

/**
 * How far through the article the reader is, as a percentage.
 *
 * Measured against the bottom of the viewport rather than the top: a reader has
 * finished a paragraph when it leaves the screen, not when it reaches the top
 * of it, and a progress bar that only reaches 100% after the last line has
 * scrolled off the top never reaches 100% at all on a short article.
 *
 * Content shorter than the viewport is complete as soon as it is on screen. The
 * alternative - a bar stuck at 40% on a two-paragraph post - reads as a broken
 * page rather than as a short one.
 */
export function readingProgress({
  contentTop,
  contentHeight,
  viewportHeight,
}: ReadingProgressInput): number {
  if (!Number.isFinite(contentHeight) || contentHeight <= 0) {
    return 0
  }

  const consumed = viewportHeight - contentTop
  const percent = (consumed / contentHeight) * 100

  if (!Number.isFinite(percent)) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round(percent)))
}

/**
 * Whether a freshly measured percentage is worth publishing.
 *
 * The bar redraws every frame it is asked to; a subscriber does not want that.
 * Reading progress is whole percentages, so a reader scrolling through one
 * percent produces one event rather than one per frame - which is the
 * difference between a milestone report and a flood. `null` is "nothing
 * published yet", so the first measurement always goes out, including the zero
 * a reader starts an article at.
 */
export function shouldReportProgress(published: number | null, measured: number): boolean {
  return published !== measured
}

export interface ProgressAria {
  readonly role: 'progressbar'
  readonly 'aria-valuemin': 0
  readonly 'aria-valuemax': 100
  readonly 'aria-valuenow': number
  readonly 'aria-label': string
}

export function readingProgressAria(percent: number, label = 'Reading progress'): ProgressAria {
  return {
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': Math.min(100, Math.max(0, Math.round(percent))),
    'aria-label': label,
  }
}

/** The indicator is a scale, so the bar never triggers layout as it fills. */
export function readingProgressScale(percent: number): number {
  return Math.min(1, Math.max(0, percent / 100))
}

/**
 * The bar still fills under reduced motion - it is state, not decoration - but
 * it stops easing into place. Transition is the animation; the value is not.
 */
export function readingProgressTransition(policy: MotionPolicy): string | undefined {
  return policy.reduced ? undefined : transitionFor('transform', 'fast')
}

/* -------------------------------------------------------------------------- */
/* Table of contents                                                          */
/* -------------------------------------------------------------------------- */

export interface ReaderHeading {
  readonly id: string
  readonly text: string
  /** The heading rank in the document: 2 for `h2`, 3 for `h3`. */
  readonly depth: number
}

export interface TocItem extends ReaderHeading {
  /** Indent level, zero-based, normalised against the shallowest heading. */
  readonly level: number
  readonly isActive: boolean
  readonly href: string
}

/**
 * The table of contents.
 *
 * Indentation is normalised against the shallowest heading present, so an
 * article whose top-level sections are `h3` is not drawn permanently indented,
 * and one that skips from `h2` to `h4` does not open a two-step gap the reader
 * has to interpret.
 */
export function tocItems(
  headings: readonly ReaderHeading[],
  activeId: string | null = null,
): TocItem[] {
  if (headings.length === 0) {
    return []
  }

  const shallowest = headings.reduce((min, heading) => Math.min(min, heading.depth), Infinity)

  return headings.map((heading) => ({
    ...heading,
    level: Math.max(0, heading.depth - shallowest),
    isActive: heading.id === activeId,
    href: `#${heading.id}`,
  }))
}

/** Indentation for one TOC level. A spacing token, never a magic pixel. */
export function tocIndent(level: number): string {
  const steps = [space[1], space[4], space[8]] as const

  return steps[Math.min(Math.max(0, level), steps.length - 1)]
}

export interface HeadingOffset {
  readonly id: string
  /** The heading's top, relative to the viewport. */
  readonly top: number
}

/**
 * Fraction of the viewport a heading has to pass before it counts as the one
 * being read. Not the very top: a heading is being read while it sits in the
 * upper third of the screen, and a threshold at zero makes the highlight jump
 * back to the previous section every time the reader scrolls up by one line.
 */
export const ACTIVE_HEADING_THRESHOLD = 0.3

/**
 * Which heading the reader is in.
 *
 * The last one that has crossed the threshold, or the first heading when none
 * has - a reader at the top of the article is in the first section, and
 * highlighting nothing there makes the TOC look broken for the whole first
 * screen.
 */
export function activeHeadingId(
  offsets: readonly HeadingOffset[],
  viewportHeight: number,
  threshold = ACTIVE_HEADING_THRESHOLD,
): string | null {
  if (offsets.length === 0) {
    return null
  }

  const line = viewportHeight * threshold
  let active: string | null = null

  for (const offset of offsets) {
    if (offset.top <= line) {
      active = offset.id
    }
  }

  return active ?? offsets[0].id
}

/** `aria-current="location"` on the active entry, and nothing on the rest. */
export function tocLinkAria(isActive: boolean): { readonly 'aria-current'?: 'location' } {
  return isActive ? { 'aria-current': 'location' } : {}
}

/**
 * Resolve a deep link against the headings that actually exist.
 *
 * A `#section-3` that no longer matches anything - the article was edited, the
 * link came from a search result, the reader typed it - resolves to `null` so
 * the reader lands at the top of the article instead of nowhere. The leading
 * `#` is optional because a `location.hash` carries it and a stored id does not.
 */
export function resolveHeadingDeepLink(
  hash: string | null | undefined,
  headings: readonly ReaderHeading[],
): string | null {
  const raw = (hash ?? '').trim().replace(/^#/, '')

  if (raw.length === 0) {
    return null
  }

  const decoded = safeDecode(raw)

  return headings.some((heading) => heading.id === decoded) ? decoded : null
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    // A malformed escape is not a crash - it is simply not one of our ids.
    return value
  }
}

/** `On this page (7)`, for the mobile disclosure summary. */
export function tocDisclosureLabel(count: number, label = 'On this page'): string {
  return count > 0 ? `${label} (${count})` : label
}

/* -------------------------------------------------------------------------- */
/* The article's own heading ramp                                             */
/* -------------------------------------------------------------------------- */

/**
 * `uix.8b`. Who wins the heading ramp inside a rendered article.
 *
 * `@milkdown/crepe`'s `theme/common/reset.css` ships
 * `.milkdown .ProseMirror h1…h6 { font-weight: 400 }` and a fixed 42/36/32/28/24/18px
 * ramp with its own line heights. That selector is two classes and an element -
 * specificity (0,2,1). Emotion compiles `Prose`'s `sx` into one generated class,
 * so `.css-hash h2` is (0,1,1) and loses: an article `h2` rendered at 36px/44px
 * weight 400, larger than the page title above it, fixed at every width, and not
 * the `sectionTitle` step the type ramp defines.
 *
 * Source order cannot settle it either, because the two stylesheets do not have
 * a fixed order: the Crepe theme arrives with a lazily imported chunk, after
 * Emotion's. So the weight is raised instead. Repeating `&` repeats the
 * generated class, and three repeats is (0,3,1), which outranks the renderer
 * whichever stylesheet is injected last. `Prose` is the declared owner of the
 * reading column, so it takes the ramp back rather than the editor stylesheet
 * conceding it - the same ownership `CREPE_LOCAL_SCROLL` already restates for
 * overflow.
 */
export const RENDERER_HEADING_CLASSES = 2
export const PROSE_HEADING_CLASS_REPEATS = 3

export const proseHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

export type ProseHeadingLevel = (typeof proseHeadingLevels)[number]

/** The type-ramp steps an article heading is allowed to use. */
export type ProseHeadingTextStyle = 'pageTitle' | 'sectionTitle' | 'cardTitle' | 'body'

export interface ProseHeadingStyle {
  readonly textStyle: ProseHeadingTextStyle
  /** Headings stay semibold at every level; the renderer flattened them to 400. */
  readonly fontWeight: 'semibold'
  readonly marginBlockStart: string
  readonly marginBlockEnd: string
  /** A deep link must not land the heading under the floating header. */
  readonly scrollMarginBlockStart: string
}

/** `&&& h2` - see `PROSE_HEADING_CLASS_REPEATS`. */
export function proseHeadingSelector(level: ProseHeadingLevel): string {
  return `${'&'.repeat(PROSE_HEADING_CLASS_REPEATS)} ${level}`
}

/** Whether the ramp above still outranks the renderer's stylesheet. */
export function proseOutranksRenderer(): boolean {
  return PROSE_HEADING_CLASS_REPEATS > RENDERER_HEADING_CLASSES
}

/**
 * The ramp itself.
 *
 * Every step is a `textStyles` entry, which is where the responsive pair lives,
 * so an article heading scales between 375 and 1440 the way every other heading
 * in the system does. `h1` takes the page-title step rather than anything
 * larger: an article body that opens with `#` must not outrank the page title
 * it sits under, and the ramp has to stay monotonic from there down.
 */
export function proseHeadingRamp(): Record<ProseHeadingLevel, ProseHeadingStyle> {
  const deepLinkClearance = space[16]

  return {
    h1: {
      textStyle: 'pageTitle',
      fontWeight: 'semibold',
      marginBlockStart: space[12],
      marginBlockEnd: space[4],
      scrollMarginBlockStart: deepLinkClearance,
    },
    h2: {
      textStyle: 'sectionTitle',
      fontWeight: 'semibold',
      marginBlockStart: space[12],
      marginBlockEnd: space[4],
      scrollMarginBlockStart: deepLinkClearance,
    },
    h3: {
      textStyle: 'cardTitle',
      fontWeight: 'semibold',
      marginBlockStart: space[8],
      marginBlockEnd: space[3],
      scrollMarginBlockStart: deepLinkClearance,
    },
    h4: {
      textStyle: 'body',
      fontWeight: 'semibold',
      marginBlockStart: space[6],
      marginBlockEnd: space[2],
      scrollMarginBlockStart: deepLinkClearance,
    },
    h5: {
      textStyle: 'body',
      fontWeight: 'semibold',
      marginBlockStart: space[6],
      marginBlockEnd: space[2],
      scrollMarginBlockStart: deepLinkClearance,
    },
    h6: {
      textStyle: 'body',
      fontWeight: 'semibold',
      marginBlockStart: space[4],
      marginBlockEnd: space[2],
      scrollMarginBlockStart: deepLinkClearance,
    },
  }
}

/* -------------------------------------------------------------------------- */
/* Where the reader's parts go                                                */
/* -------------------------------------------------------------------------- */

/**
 * The reader's regions, in the order `DESIGN.md` puts them: "article identity,
 * stable prose, contextual navigation, feedback, and conversation."
 */
export const readerRegions = [
  'identity',
  'metadata',
  'cover',
  'prose',
  'seriesContext',
  'feedback',
  'discussion',
  'related',
] as const

export type ReaderRegion = (typeof readerRegions)[number]

export function readerRegionIndex(region: ReaderRegion): number {
  return readerRegions.indexOf(region)
}

export type ReaderElement =
  | 'reactions'
  | 'share'
  | 'comments'
  | 'toc'
  | 'progress'
  | 'author'
  | 'readingTime'

/**
 * `dsv2.5.3` acceptance 3: reader feedback does not move into the opening
 * metadata.
 *
 * The pull to move a heart count and a share button up beside the byline is
 * strong - it is where every social product puts them - and it is wrong here.
 * The opening metadata answers "should I read this?"; reactions and sharing
 * answer "what did I think of it?", and a reader who has not read the article
 * has no answer to give. Putting the two together also turns the first thing on
 * a reading surface into a row of buttons.
 *
 * So the mapping is a function, and the test asserts that nothing which asks
 * for a reaction resolves to a region at or before the prose.
 */
export function readerSlotFor(element: ReaderElement): ReaderRegion {
  switch (element) {
    case 'reactions':
    case 'share':
      return 'feedback'
    case 'comments':
      return 'discussion'
    case 'toc':
    case 'progress':
      return 'prose'
    default:
      return 'metadata'
  }
}

/** Whether a region comes after the reader has actually read something. */
export function isAfterProse(region: ReaderRegion): boolean {
  return readerRegionIndex(region) > readerRegionIndex('prose')
}
