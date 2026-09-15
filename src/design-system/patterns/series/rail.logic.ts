/**
 * Horizon Design System v2 - the horizontal rail.
 *
 * `DESIGN.md`, responsive behaviour: "Horizontal rails preserve native touch
 * scrolling, show a next-item peek, snap, and add controls for capable input."
 * Every word of that is a constraint, and each one is here as arithmetic:
 *
 * - *native touch scrolling* - the rail is a scroll container, not a translated
 *   track. Nothing here sets `transform` on the strip, so a finger, a trackpad,
 *   a scrollbar, `Tab` and a screen reader's own scrolling all keep working.
 * - *peek* - the item basis is deliberately narrower than the viewport, so part
 *   of the next card is always visible. A rail whose items exactly fill the
 *   container looks like a static row and nobody swipes it.
 * - *snap* - item alignment, so a gesture lands on a card rather than between
 *   two of them.
 * - *controls for capable input* - overlay arrows, which are an addition to the
 *   scrolling and never a replacement for it.
 *
 * `dsv2.5.2` acceptance 1 lives here too: no visible "3 of 8" when the controls
 * already communicate position - but the position is still announced.
 */

import { radii, semanticColors, type SemanticColorToken } from '../../../theme/tokens'
import type { MotionPolicy } from '../../motion'
// The rail direction is the navigation primitive's type, not a second copy of
// it. `RailControl` and `RailOverlayControls` have to agree on it.
import type { RailDirection } from '../../components/navigation'

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * How much of the container is given over to the next item's edge. 18% is
 * enough to read as a partial card at 375px and small enough that three items
 * still fit on a desktop rail.
 */
export const RAIL_PEEK_FRACTION = 0.18

/**
 * The flex basis for one rail item, as a percentage string.
 *
 * `visibleItems` is how many should sit fully in view; the peek is taken out of
 * the total rather than out of each item, so the fraction of the next card that
 * shows is the same whether one item is visible or three.
 */
export function railItemBasis(visibleItems: number): string {
  const count = Math.max(1, Math.floor(visibleItems))
  const percent = ((1 - RAIL_PEEK_FRACTION) * 100) / count

  return `${Math.round(percent * 100) / 100}%`
}

export interface RailVisibleItems {
  readonly base: number
  readonly sm?: number
  readonly md?: number
  readonly lg?: number
}

/**
 * How many cards sit fully in view at each width, unless a caller says
 * otherwise. It is a named constant rather than a default argument buried in
 * `SeriesRail` because a shelf has to know it: a rail handed this many items or
 * fewer has nothing to scroll, so its arrows, its snap and its peek are all
 * furniture. See `railWidestVisibleItems`.
 */
export const defaultRailVisibleItems: RailVisibleItems = { base: 1, sm: 2, md: 3 }

/** The most cards the rail ever shows at once. */
export function railWidestVisibleItems(
  visible: RailVisibleItems = defaultRailVisibleItems,
): number {
  return Math.max(visible.base, visible.sm ?? 0, visible.md ?? 0, visible.lg ?? 0)
}

/**
 * Whether a shelf of this many items is worth putting on a rail at all.
 *
 * The Series shelf used to ask the API for two, which on a desktop rail meant
 * three slots holding two cards: both arrows dead, nothing to snap to and no
 * next-item peek.
 */
export function railIsScrollable(
  itemCount: number,
  visible: RailVisibleItems = defaultRailVisibleItems,
): boolean {
  return itemCount > railWidestVisibleItems(visible)
}

/** The same basis at each breakpoint, in the shape Chakra takes directly. */
export function railItemBasisResponsive(visible: RailVisibleItems): Record<string, string> {
  const entries: [string, number][] = [['base', visible.base]]

  if (visible.sm != null) {
    entries.push(['sm', visible.sm])
  }

  if (visible.md != null) {
    entries.push(['md', visible.md])
  }

  if (visible.lg != null) {
    entries.push(['lg', visible.lg])
  }

  return Object.fromEntries(entries.map(([key, count]) => [key, railItemBasis(count)]))
}

/* -------------------------------------------------------------------------- */
/* Position                                                                   */
/* -------------------------------------------------------------------------- */

export interface RailMeasurements {
  readonly scrollLeft: number
  readonly scrollWidth: number
  readonly clientWidth: number
  readonly itemCount: number
}

export interface RailPosition {
  readonly activeIndex: number
  readonly itemCount: number
  readonly atStart: boolean
  readonly atEnd: boolean
  readonly canScrollPrevious: boolean
  readonly canScrollNext: boolean
}

/**
 * A one-pixel tolerance on both ends.
 *
 * Browsers report fractional scroll offsets on a zoomed or high-DPI display, so
 * `scrollLeft === 0` is not reliably true at the start of a rail and
 * `scrollLeft + clientWidth === scrollWidth` is almost never exactly true at the
 * end. Without the tolerance the "next" arrow stays enabled forever on a rail
 * that has nowhere left to go.
 */
const EDGE_TOLERANCE_PX = 1

export function railPosition({
  scrollLeft,
  scrollWidth,
  clientWidth,
  itemCount,
}: RailMeasurements): RailPosition {
  const count = Math.max(0, Math.floor(itemCount))
  const maxScroll = Math.max(0, scrollWidth - clientWidth)
  const clamped = Math.min(Math.max(0, scrollLeft), maxScroll)
  const atStart = clamped <= EDGE_TOLERANCE_PX
  const atEnd = maxScroll - clamped <= EDGE_TOLERANCE_PX

  // The step is the width one item occupies in the scroll space, so the active
  // index follows the strip rather than the viewport - which is what makes the
  // announcement agree with what the reader sees under the peek.
  const step = count > 0 ? scrollWidth / count : 0
  const rawIndex = step > 0 ? Math.round(clamped / step) : 0
  const activeIndex = count === 0 ? 0 : Math.min(Math.max(0, rawIndex), count - 1)

  return {
    activeIndex,
    itemCount: count,
    atStart,
    atEnd,
    canScrollPrevious: count > 0 && !atStart,
    canScrollNext: count > 0 && !atEnd && maxScroll > EDGE_TOLERANCE_PX,
  }
}

/**
 * How far one press of an arrow moves the rail.
 *
 * A little less than a full viewport, so the card that was peeking is fully in
 * view after the press and the one before it is still partly visible. Paging by
 * exactly `clientWidth` loses the reader's place: nothing on screen after the
 * press was on screen before it.
 */
export function railScrollStep(clientWidth: number): number {
  return Math.max(0, clientWidth * (1 - RAIL_PEEK_FRACTION))
}

export function railScrollTarget(direction: RailDirection, measurements: RailMeasurements): number {
  const maxScroll = Math.max(0, measurements.scrollWidth - measurements.clientWidth)
  const step = railScrollStep(measurements.clientWidth)
  const delta = direction === 'next' ? step : -step

  return Math.min(Math.max(0, measurements.scrollLeft + delta), maxScroll)
}

/* -------------------------------------------------------------------------- */
/* Keyboard                                                                   */
/* -------------------------------------------------------------------------- */

export type RailKeyAction = 'previous' | 'next' | 'first' | 'last'

/**
 * Arrow keys page, `Home` and `End` jump to the ends.
 *
 * Only these four, and only when no modifier is held: a rail that swallowed
 * `Shift+Home` would take a text-selection shortcut away from a reader who was
 * selecting a card title.
 */
export function railKeyboardAction(
  key: string,
  modifiers: {
    readonly altKey?: boolean
    readonly ctrlKey?: boolean
    readonly metaKey?: boolean
    readonly shiftKey?: boolean
  } = {},
): RailKeyAction | null {
  if (modifiers.altKey || modifiers.ctrlKey || modifiers.metaKey || modifiers.shiftKey) {
    return null
  }

  switch (key) {
    case 'ArrowLeft':
      return 'previous'
    case 'ArrowRight':
      return 'next'
    case 'Home':
      return 'first'
    case 'End':
      return 'last'
    default:
      return null
  }
}

/** Where a keyboard action lands, as a scroll offset. */
export function railKeyboardTarget(action: RailKeyAction, measurements: RailMeasurements): number {
  const maxScroll = Math.max(0, measurements.scrollWidth - measurements.clientWidth)

  switch (action) {
    case 'first':
      return 0
    case 'last':
      return maxScroll
    default:
      return railScrollTarget(action, measurements)
  }
}

/* -------------------------------------------------------------------------- */
/* Position, said out loud                                                    */
/* -------------------------------------------------------------------------- */

export interface RailRangeDisplay {
  /** Whether a "3 of 8" is painted on the rail. */
  readonly showVisibleRange: boolean
  /** Always produced. Lives in a polite live region, never in the layout. */
  readonly screenReaderText: string
}

/**
 * `dsv2.5.2` acceptance 1.
 *
 * When the overlay arrows are present they carry the position: one of them
 * disables at each end, and the movement itself is the feedback. Printing "3 of
 * 8" beside them repeats that in the one place the design has no room for it.
 *
 * Removing the text does not remove the information. A screen reader user has
 * no arrows to look at and no movement to see, so the position goes into a
 * polite live region instead - which is why this returns two fields and not a
 * boolean.
 */
export function railRangeDisplay(
  activeIndex: number,
  itemCount: number,
  hasOverlayControls: boolean,
  noun = 'Blog',
): RailRangeDisplay {
  const count = Math.max(0, Math.floor(itemCount))
  const position = count === 0 ? 0 : Math.min(Math.max(0, activeIndex), count - 1) + 1

  return {
    showVisibleRange: !hasOverlayControls,
    // The empty rail is not pluralised into "No Seriess". A rail with nothing in
    // it says so in one phrase that works for every noun the system uses.
    screenReaderText: count === 0 ? 'This rail is empty' : `${noun} ${position} of ${count}`,
  }
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Smooth scrolling is movement, so it stops under reduced motion - the rail
 * still moves the same distance, it just arrives immediately. Snapping stays on
 * in both cases: it is a resting position, not an animation.
 */
export function railScrollBehavior(policy: MotionPolicy): 'auto' | 'smooth' {
  return policy.reduced ? 'auto' : 'smooth'
}

export interface RailOverlayControlStyle {
  readonly borderRadius: string
  readonly bg: SemanticColorToken
  readonly hoverBg: SemanticColorToken
  readonly color: SemanticColorToken
  readonly borderColor: SemanticColorToken
  readonly size: string
  readonly isCircular: boolean
  readonly isTranslucent: boolean
}

/**
 * `dsv2.5.2` acceptance 2: overlay arrows are circular and translucent.
 *
 * Circular is the pill radius on a square box, which is the same shape at any
 * size. Translucent is `action.subtle`, the one paired role in the token source
 * whose light *and* dark values carry an alpha channel - so the control tints
 * what is behind it in both themes instead of being a solid disc in one and a
 * hole in the other. `isTranslucent` is derived from the token rather than
 * asserted, so retuning the role to an opaque value fails the test.
 *
 * There is no backdrop blur. The token source has no blur radius, inventing one
 * would be a raw design value, and `DESIGN.md` puts "excessive glass" under
 * Avoid. On hover the control goes solid, which is also the moment it needs to
 * read as a target rather than as a tint.
 */
export function railOverlayControlStyle(): RailOverlayControlStyle {
  const bg: SemanticColorToken = 'action.subtle'
  const pair = semanticColors[bg]

  return {
    borderRadius: radii.tag,
    bg,
    hoverBg: 'bg.surface',
    color: 'text.primary',
    borderColor: 'border.subtle',
    size: '44px',
    isCircular: true,
    isTranslucent: pair.light.includes('/') && pair.dark.includes('/'),
  }
}

/* -------------------------------------------------------------------------- */
/* Paging in more items                                                       */
/* -------------------------------------------------------------------------- */

export interface RailIdentified {
  readonly id: string
}

/**
 * Append a page without losing or duplicating anything.
 *
 * The API pages by cursor, and a cursor page that overlaps the previous one -
 * because a Series was published between two requests - would otherwise put the
 * same card in the rail twice and give React two children with the same key.
 * Existing entries win, so an item the reader has already scrolled past does
 * not jump to the end of the rail.
 */
export function appendRailItems<T extends RailIdentified>(
  existing: readonly T[],
  incoming: readonly T[],
): T[] {
  const seen = new Set(existing.map((item) => item.id))
  const appended = incoming.filter((item) => {
    if (seen.has(item.id)) {
      return false
    }

    seen.add(item.id)

    return true
  })

  return appended.length === 0 ? (existing as T[]) : [...existing, ...appended]
}

export type RailLoadStatus = 'idle' | 'loading' | 'error' | 'complete'

export interface RailLoadInput {
  readonly isLoading?: boolean
  readonly error?: string | null
  readonly hasMore?: boolean
}

/**
 * Loading beats error beats "nothing more to load".
 *
 * A retry that is in flight reports `loading`, so the failure message is
 * replaced by the attempt rather than sitting under it - a rail that shows an
 * error and a spinner at once tells the reader nothing about which is current.
 */
export function railLoadStatus({
  isLoading = false,
  error = null,
  hasMore = false,
}: RailLoadInput): RailLoadStatus {
  if (isLoading) {
    return 'loading'
  }

  if (error) {
    return 'error'
  }

  return hasMore ? 'idle' : 'complete'
}

/**
 * Whether more items should be requested. Never while a request is in flight,
 * and never after a failure - a rail that retries on its own turns one failed
 * request into a loop the reader cannot stop.
 */
export function shouldRequestMore(input: RailLoadInput): boolean {
  return railLoadStatus(input) === 'idle'
}
