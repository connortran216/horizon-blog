/**
 * Horizon Design System v2 - a signal carried along a line.
 *
 * Home's field writes its copy with signals that leave the network and land on
 * words. Away from Home there is no network, only the page's own hairlines -
 * a divider, a rule over a row of figures, the seam under a card's cover. A
 * route turns one of those lines into a conduit: the line draws itself, its
 * leading tip is a signal, and anything the route owns is written when the tip
 * passes it. Same language as the field - light arriving along a line - at the
 * volume an inner page can carry.
 *
 * Everything here is pure: where along the line each anchor sits, when the
 * tip reaches it, and what the tip and the rail look like at a given moment of
 * travel. `SignalRoute` and `SignalLine` only measure, animate and clean up.
 */

import { durationSeconds, type MotionPolicy } from './policy.logic'

export type SignalOrientation = 'horizontal' | 'vertical'

/**
 * How a route spaces its anchors along the travel.
 *
 * - `position`: an anchor is reached when the tip passes its own place on the
 *   line - the physical reading, right for a divider with rows beside it.
 * - `order`: anchors are reached one after another at even intervals, in the
 *   order they were written - right for the words of a headline, whose places
 *   on a line beneath them fold back at every line break.
 */
export type SignalPace = 'position' | 'order'

export interface AxisBox {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** The line's length along its own axis. Zero when it is not laid out. */
export function railLength(rail: AxisBox, orientation: SignalOrientation): number {
  return orientation === 'horizontal' ? rail.width : rail.height
}

/**
 * Where an element's centre falls along the line, 0 at its start and 1 at its
 * end, clamped - an anchor past either end is reached at that end.
 */
export function projectOnRail(
  anchor: AxisBox,
  rail: AxisBox,
  orientation: SignalOrientation,
): number {
  const length = railLength(rail, orientation)

  if (length <= 0) {
    return 0
  }

  const centre =
    orientation === 'horizontal'
      ? anchor.left + anchor.width / 2 - rail.left
      : anchor.top + anchor.height / 2 - rail.top

  return Math.min(1, Math.max(0, centre / length))
}

/**
 * The travel progress, 0..1, at which each anchor is written - in the anchors'
 * own writing order. Never decreasing: whatever the geometry says, a later
 * word is not written before an earlier one.
 */
export function routeStops(projections: readonly number[], pace: SignalPace): number[] {
  const count = projections.length

  if (pace === 'order') {
    return projections.map((_unused, index) => (index + 1) / (count + 1))
  }

  let floor = 0

  return projections.map((value) => {
    floor = Math.max(floor, Math.min(1, Math.max(0, value)))

    return floor
  })
}

/** Which anchors the tip has reached at `progress` that were not reached before. */
export function reachedAt(
  stops: readonly number[],
  progress: number,
  alreadyHit: ReadonlySet<number>,
): number[] {
  const reached: number[] = []

  stops.forEach((stop, index) => {
    if (!alreadyHit.has(index) && progress >= stop) {
      reached.push(index)
    }
  })

  return reached
}

export interface SignalRouteTiming {
  /** Seconds between the route being asked to run and the tip leaving. */
  readonly delay: number
  /** Seconds the tip takes from one end of the line to the other. */
  readonly travel: number
  /** How long a written anchor stays lit, seconds. */
  readonly pulse: number
}

/**
 * Every beat is a duration token or a multiple of one: the tip travels in two
 * editorial reveals, leaves after one `normal`, and an anchor it writes glows
 * for one reveal - the same pulse the field gives a word. Under reduced motion
 * all three are zero and the line is simply drawn, its anchors simply there.
 */
export function signalRouteTiming(policy: MotionPolicy, extraDelay = 0): SignalRouteTiming {
  const reveal = durationSeconds('reveal', policy)

  return {
    delay: policy.reduced ? 0 : durationSeconds('normal', policy) + Math.max(0, extraDelay),
    travel: reveal * 2,
    pulse: reveal,
  }
}

/**
 * Whether a route travels at all. Under reduced motion there is no travel, and
 * a line that is not laid out - a divider hidden at this width - has nowhere
 * to carry a signal, so its anchors are written at once rather than waiting
 * out the fallback behind a line nobody can see.
 */
export function routeTravels(policy: MotionPolicy, length: number): boolean {
  return !policy.reduced && length > 0
}

export interface SignalLineFrame {
  /** The rail's scale along its axis, 0..1 - it draws from its start. */
  readonly draw: number
  /** The tip's opacity: in as it leaves, out as it arrives. */
  readonly tip: number
}

/**
 * The line at one moment of travel. The rail is drawn exactly as far as the
 * tip has gone - the tip is what draws it - and the tip itself fades in over
 * the first stretch and out over the last, so it arrives rather than blinks.
 */
export function signalLineFrame(progress: number): SignalLineFrame {
  const p = Math.min(1, Math.max(0, progress))
  const tip = p <= 0 || p >= 1 ? 0 : Math.min(1, p / 0.08, (1 - p) / 0.12)

  return { draw: p, tip }
}

/**
 * The transform of the carrier - a box the rail's full length whose far end is
 * the tip - for a progress, as a CSS translate. Percentages refer to the
 * carrier's own size, which is the rail's, so this is transform-only travel
 * that knows nothing about pixels.
 */
export function carrierTransform(progress: number, orientation: SignalOrientation): string {
  const offset = (Math.min(1, Math.max(0, progress)) - 1) * 100

  return orientation === 'horizontal' ? `translateX(${offset}%)` : `translateY(${offset}%)`
}

/** The rail's own transform for a draw amount. */
export function railTransform(draw: number, orientation: SignalOrientation): string {
  const scale = Math.min(1, Math.max(0, draw))

  return orientation === 'horizontal' ? `scaleX(${scale})` : `scaleY(${scale})`
}
