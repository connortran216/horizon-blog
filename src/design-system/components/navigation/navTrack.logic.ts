/**
 * Navigation track decisions.
 *
 * A set of nav items shares one indicator that travels to the current item
 * when the route changes - `DESIGN.md`'s "sliding nav indication". The bar is
 * the full width of the set, placed with a translate and sized with a scale,
 * so the travel is transform-only and the items beside it never move. While it
 * travels, a signal rides its leading end: the end that points where the
 * reader is going.
 */

export interface TrackSpan {
  /** Pixels from the start of the set. */
  readonly left: number
  readonly width: number
}

export interface TrackIndicator {
  /** Translate from the start of the set, px. */
  readonly x: number
  /** Scale of the full-width bar, 0..1. */
  readonly scale: number
  /** False when there is no current item in the set - no bar is shown. */
  readonly visible: boolean
}

/**
 * Where the bar sits for the current item. The bar is inset by the item's own
 * horizontal padding so it underlines the label, as each item's own bar did.
 */
export function trackIndicator(
  setWidth: number,
  current: TrackSpan | null,
  inset: number,
): TrackIndicator {
  if (current === null || setWidth <= 0) {
    return { x: 0, scale: 0, visible: false }
  }

  const width = Math.max(0, current.width - inset * 2)

  return {
    x: current.left + inset,
    scale: Math.min(1, width / setWidth),
    visible: width > 0,
  }
}

export interface TrackLead {
  /** Where the signal starts and ends, px from the start of the set. */
  readonly from: number
  readonly to: number
  /** Whether there is a journey at all - no signal on the first placement. */
  readonly travels: boolean
}

/**
 * The leading end of the journey from one placement to the next: the right
 * end when moving right, the left end when moving left.
 */
export function trackLead(
  previous: TrackIndicator | null,
  next: TrackIndicator,
  setWidth: number,
): TrackLead {
  const nextRight = next.x + next.scale * setWidth

  if (previous === null || !previous.visible || !next.visible || previous.x === next.x) {
    return { from: nextRight, to: nextRight, travels: false }
  }

  if (next.x > previous.x) {
    return { from: previous.x + previous.scale * setWidth, to: nextRight, travels: true }
  }

  return { from: previous.x, to: next.x, travels: true }
}

/** The current item's span inside the set, from two client rects. */
export function spanWithin(
  set: { readonly left: number },
  item: { readonly left: number; readonly width: number },
): TrackSpan {
  return { left: item.left - set.left, width: item.width }
}
