/**
 * Horizon Design System v2 - dragging a rail without opening a card.
 *
 * A rail full of links has one hard problem: a mouse user who grabs the strip
 * and throws it sideways releases the button over a card, and the browser fires
 * a click on that card's link. The rail moves and the reader is navigated away
 * from the page they were browsing.
 *
 * The fix is a threshold and a one-shot suppression flag. Below the threshold
 * the gesture was a click and it is left alone; above it the gesture was a drag
 * and exactly the next click is swallowed. Getting that wrong in either
 * direction is worse than not having drag at all - a rail that swallows real
 * clicks is broken, and one that navigates on every drag is hostile - so the
 * whole decision is here as a reducer with no DOM in it.
 *
 * Touch is deliberately not handled here. A finger already scrolls the rail
 * natively and the browser already suppresses the click that follows a scroll;
 * adding a second mechanism on top of that is how touch rails end up unable to
 * open anything.
 */

/** Pixels of movement before a press becomes a drag. */
export const DRAG_THRESHOLD_PX = 6

export interface DragSample {
  readonly x: number
  readonly y: number
  /** Scroll offset when the press began. Everything is measured against it. */
  readonly scrollLeft?: number
}

export interface DragState {
  readonly isPressed: boolean
  /** The press has travelled past the threshold. */
  readonly isDragging: boolean
  readonly originX: number
  readonly originY: number
  readonly originScrollLeft: number
  /** Greatest distance travelled during this press. Never decreases. */
  readonly distance: number
  /** Exactly one click is swallowed while this is true. */
  readonly suppressClick: boolean
}

export const idleDragState: DragState = {
  isPressed: false,
  isDragging: false,
  originX: 0,
  originY: 0,
  originScrollLeft: 0,
  distance: 0,
  suppressClick: false,
}

/**
 * A press begins.
 *
 * `suppressClick` resets here rather than after the click: a press that never
 * produces a click - the reader drags, then presses Escape, or the pointer
 * leaves the window - would otherwise leave the flag set and swallow the next
 * genuine click minutes later.
 */
export function dragBegin(sample: DragSample): DragState {
  return {
    isPressed: true,
    isDragging: false,
    originX: sample.x,
    originY: sample.y,
    originScrollLeft: sample.scrollLeft ?? 0,
    distance: 0,
    suppressClick: false,
  }
}

/**
 * The pointer moved.
 *
 * Horizontal distance only. A rail sits inside a vertically scrolling page, and
 * measuring the diagonal would turn a page scroll that happens to start on a
 * card into a rail drag - which is the gesture conflict that makes carousels
 * unusable on a trackpad.
 */
export function dragMove(state: DragState, sample: DragSample): DragState {
  if (!state.isPressed) {
    return state
  }

  const distance = Math.max(state.distance, Math.abs(sample.x - state.originX))
  const isDragging = state.isDragging || distance >= DRAG_THRESHOLD_PX

  if (distance === state.distance && isDragging === state.isDragging) {
    return state
  }

  return { ...state, distance, isDragging }
}

/**
 * The press ended. A gesture that passed the threshold arms the suppression;
 * one that did not leaves it alone, so a plain click still opens the card.
 */
export function dragEnd(state: DragState): DragState {
  return {
    ...idleDragState,
    suppressClick: state.isDragging,
  }
}

/** The press was cancelled - the pointer left, or the browser took over. */
export function dragCancel(): DragState {
  return idleDragState
}

/** Where the rail should be scrolled to for the current pointer position. */
export function dragScrollTarget(state: DragState, sample: DragSample): number {
  if (!state.isPressed) {
    return state.originScrollLeft
  }

  return Math.max(0, state.originScrollLeft - (sample.x - state.originX))
}

/** Whether the click that is about to fire should be swallowed. */
export function shouldSuppressClick(state: DragState): boolean {
  return state.suppressClick
}

/**
 * The click has been dealt with. One click, one suppression - a flag that stays
 * set is a rail whose cards never open again.
 */
export function dragClickConsumed(state: DragState): DragState {
  return state.suppressClick ? { ...state, suppressClick: false } : state
}
