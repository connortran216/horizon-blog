/**
 * Horizon Design System v2 - the motion policy.
 *
 * This is the single place the system decides what motion is allowed. Every
 * primitive under `src/design-system/motion` and every animated component asks
 * this module; nothing re-reads `prefers-reduced-motion` for itself. One policy
 * means one thing to review and one thing to change.
 *
 * The policy the design contract asks for:
 *
 * - Under reduced motion, translation, parallax, ambient movement, pointer
 *   following and layout projection stop.
 * - Colour, opacity and focus feedback never stop. A reduced-motion user still
 *   sees that a button was pressed and that a value was saved.
 * - Continuous animation is reserved for loading, and never runs on a reading
 *   surface. `ambientAllowed` is where that rule lives.
 *
 * Everything here is a pure function of a boolean, so the whole policy is
 * testable without a browser.
 */

import { duration, easing, transform, reducedMotionQuery } from '../../theme/tokens'
import type { DurationToken } from '../../theme/tokens'

/** A function that undoes whatever registered it. Idempotent by contract. */
export type Disposer = () => void

/**
 * What the current environment permits. `opacity`, `colour` and `focus` are
 * literal `true` on purpose: they are not preferences, and a future edit that
 * tries to switch one off is a compile error.
 */
export interface MotionPolicy {
  /** The user asked for reduced motion. */
  readonly reduced: boolean
  /** Reveal travel, hover lift, directional icon movement. */
  readonly translation: boolean
  /** Looping decorative movement on discovery artwork. */
  readonly ambient: boolean
  /** Desktop Signature pointer light and anything else that tracks a cursor. */
  readonly pointerFollowing: boolean
  /** Framer layout projection: filter reordering, Series connector movement. */
  readonly layoutProjection: boolean
  /** The loading pulse and spinner rhythm. */
  readonly loadingRhythm: boolean
  readonly opacity: true
  readonly colour: true
  readonly focus: true
}

export const fullMotionPolicy: MotionPolicy = {
  reduced: false,
  translation: true,
  ambient: true,
  pointerFollowing: true,
  layoutProjection: true,
  loadingRhythm: true,
  opacity: true,
  colour: true,
  focus: true,
}

export const reducedMotionPolicy: MotionPolicy = {
  reduced: true,
  translation: false,
  ambient: false,
  pointerFollowing: false,
  layoutProjection: false,
  loadingRhythm: false,
  opacity: true,
  colour: true,
  focus: true,
}

export function motionPolicyFor(reduced: boolean): MotionPolicy {
  return reduced ? reducedMotionPolicy : fullMotionPolicy
}

/**
 * Surfaces are split because the rule differs. Prose stays still; discovery may
 * be expressive. A reading surface never gets ambient movement even when the
 * user has expressed no motion preference at all.
 */
export type MotionSurface = 'reading' | 'discovery'

export function ambientAllowed(policy: MotionPolicy, surface: MotionSurface): boolean {
  return surface === 'discovery' && policy.ambient
}

/* -------------------------------------------------------------------------- */
/* Token parsing                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Framer Motion works in seconds and unitless offsets, the tokens are CSS
 * strings. These two parsers are the only bridge, so a component never has to
 * write a number that a token already owns.
 */
export function parseDurationMs(value: string): number {
  const match = /^(-?[\d.]+)(ms|s)$/.exec(value.trim())

  if (!match) {
    throw new TypeError(`Not a duration token value: "${value}"`)
  }

  const amount = Number.parseFloat(match[1])

  return match[2] === 's' ? amount * 1000 : amount
}

export function parseLengthPx(value: string): number {
  const match = /^(-?[\d.]+)px$/.exec(value.trim())

  if (!match) {
    throw new TypeError(`Not a pixel token value: "${value}"`)
  }

  return Number.parseFloat(match[1])
}

export type CubicBezierPoints = [number, number, number, number]

export function cubicBezierPoints(value: string): CubicBezierPoints {
  const match = /^cubic-bezier\(([^)]+)\)$/.exec(value.trim())

  if (!match) {
    throw new TypeError(`Not a cubic-bezier token value: "${value}"`)
  }

  const points = match[1].split(',').map((part) => Number.parseFloat(part.trim()))

  if (points.length !== 4 || points.some((point) => Number.isNaN(point))) {
    throw new TypeError(`Not a cubic-bezier token value: "${value}"`)
  }

  return [points[0], points[1], points[2], points[3]]
}

/** The system's only easing curve, in the shape Framer Motion wants. */
export const standardEase: CubicBezierPoints = cubicBezierPoints(easing.standard)

/* -------------------------------------------------------------------------- */
/* Derived motion values                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Seconds for Framer. Under reduced motion this collapses to zero rather than
 * to a short duration: the theme's global CSS rule does the same for CSS
 * transitions, and a JS-driven animation that ignored it would be the one
 * moving thing left on the page.
 */
export function durationSeconds(token: DurationToken, policy: MotionPolicy): number {
  return policy.reduced ? 0 : parseDurationMs(duration[token]) / 1000
}

export interface MotionTransition {
  readonly duration: number
  readonly delay: number
  readonly ease: CubicBezierPoints
}

export function transitionFor(
  token: DurationToken,
  policy: MotionPolicy,
  delay = 0,
): MotionTransition {
  return {
    duration: durationSeconds(token, policy),
    delay: policy.reduced ? 0 : delay,
    ease: standardEase,
  }
}

/** Entry travel distance in px. Zero under reduced motion; the fade remains. */
export function revealOffset(policy: MotionPolicy): number {
  return policy.translation ? parseLengthPx(transform.revealDistance) : 0
}

/** Hover depth in px. Negative, at most 2px, and never a layout change. */
export function hoverLiftOffset(policy: MotionPolicy): number {
  return policy.translation ? parseLengthPx(transform.hoverLift) : 0
}

export interface RevealTarget {
  readonly opacity: number
  readonly y: number
}

/**
 * The index signature is there so the value satisfies Framer's `Variants`
 * without a cast at the call site.
 */
export interface RevealVariants {
  [state: string]: RevealTarget
  hidden: RevealTarget
  visible: RevealTarget
}

export function revealVariants(policy: MotionPolicy): RevealVariants {
  return {
    hidden: { opacity: 0, y: revealOffset(policy) },
    visible: { opacity: 1, y: 0 },
  }
}

export interface StaggerInput {
  readonly count: number
  readonly policy: MotionPolicy
  /** Gap between two neighbours. Defaults to the `fast` token. */
  readonly step?: DurationToken
  /** Delay before the first child. */
  readonly initialDelay?: number
  /**
   * Longest delay any child may wait, in seconds. A 40-item grid must not put
   * its last card four seconds into the future.
   */
  readonly maxDelay?: number
}

/**
 * Per-child entry delays in seconds. Under reduced motion every child is zero,
 * so the group fades in together instead of marching.
 */
export function staggerDelays({
  count,
  policy,
  step = 'fast',
  initialDelay = 0,
  maxDelay = 0.6,
}: StaggerInput): number[] {
  if (count <= 0) {
    return []
  }

  if (policy.reduced) {
    return new Array<number>(count).fill(0)
  }

  const gap = parseDurationMs(duration[step]) / 1000

  return Array.from({ length: count }, (_unused, index) =>
    Math.min(initialDelay + index * gap, maxDelay),
  )
}

export interface HoverLiftProps {
  readonly whileHover: { readonly y: number }
  readonly whileTap: { readonly y: number }
  readonly transition: MotionTransition
}

export function hoverLiftProps(policy: MotionPolicy): HoverLiftProps {
  return {
    whileHover: { y: hoverLiftOffset(policy) },
    whileTap: { y: 0 },
    transition: transitionFor('normal', policy),
  }
}

export interface PressFeedbackProps {
  readonly whileTap: { readonly scale: number; readonly opacity: number }
  readonly transition: MotionTransition
}

/**
 * Press is the one place where a scale is acceptable, because it reads as
 * physical response rather than decoration. Under reduced motion the scale goes
 * away and the opacity dip carries the whole signal - which is why press
 * feedback still exists there at all.
 */
export function pressFeedbackProps(policy: MotionPolicy): PressFeedbackProps {
  return {
    whileTap: { scale: policy.translation ? 0.98 : 1, opacity: 0.9 },
    transition: transitionFor('fast', policy),
  }
}

/**
 * The loading rhythm, derived from the longest approved duration rather than
 * invented. `reveal` is 480ms, so the default three-beat cycle is 1440ms - the
 * pace the approved prototype's skeleton pulse runs at.
 */
export function loadingCycleMs(beats = 3): number {
  return parseDurationMs(duration.reveal) * beats
}

export function loadingCycle(beats = 3): string {
  return `${loadingCycleMs(beats)}ms`
}

/** Chakra's `Spinner` takes a CSS duration. One beat is a comfortable turn. */
export function spinnerSpeed(): string {
  return loadingCycle(1)
}

/* -------------------------------------------------------------------------- */
/* Reading the preference                                                     */
/* -------------------------------------------------------------------------- */

export interface MediaQueryChangeEvent {
  readonly matches: boolean
}

/**
 * The subset of `MediaQueryList` this system uses, including the pre-2021
 * `addListener` pair that Safari needed. Typed structurally so a test can hand
 * in a plain object.
 */
export interface MediaQueryLike {
  readonly matches: boolean
  addEventListener?: (type: 'change', listener: (event: MediaQueryChangeEvent) => void) => void
  removeEventListener?: (type: 'change', listener: (event: MediaQueryChangeEvent) => void) => void
  addListener?: (listener: (event: MediaQueryChangeEvent) => void) => void
  removeListener?: (listener: (event: MediaQueryChangeEvent) => void) => void
}

export type MatchMediaLike = (query: string) => MediaQueryLike

/** No `matchMedia` means a server render or an ancient browser: assume motion. */
export function readReducedMotion(matchMedia: MatchMediaLike | null | undefined): boolean {
  if (typeof matchMedia !== 'function') {
    return false
  }

  return matchMedia(reducedMotionQuery).matches === true
}

/**
 * Subscribe to preference changes. Always returns a disposer, including when
 * there is nothing to subscribe to, so a caller never has to branch on it.
 */
export function subscribeReducedMotion(
  matchMedia: MatchMediaLike | null | undefined,
  listener: (reduced: boolean) => void,
): Disposer {
  if (typeof matchMedia !== 'function') {
    return () => {}
  }

  const query = matchMedia(reducedMotionQuery)
  const handle = (event: MediaQueryChangeEvent) => listener(event.matches === true)

  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handle)

    return () => query.removeEventListener?.('change', handle)
  }

  if (typeof query.addListener === 'function') {
    query.addListener(handle)

    return () => query.removeListener?.(handle)
  }

  return () => {}
}
