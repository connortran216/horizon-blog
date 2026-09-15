/**
 * Horizon Design System v2 - motion tokens.
 *
 * Motion communicates cause and response. It is used for entry, selection,
 * navigation, reordering, progress, loading and success - never as decoration
 * competing with prose.
 *
 * Reduced motion is not a separate design. Under `prefers-reduced-motion` the
 * system removes translation, parallax, ambient float and pointer following, and
 * keeps immediate state feedback: colour, opacity and focus still change.
 */

export const duration = {
  /** Button and icon colour, focus feedback. */
  fast: '120ms',
  /** Hover, menus, ordinary state transitions. */
  normal: '200ms',
  /** Navigation and layout movement. */
  navigation: '260ms',
  /** The slower end of navigation and layout movement. */
  layout: '300ms',
  /** First appearance of prominent content. */
  enter: '320ms',
  /** Editorial reveal on discovery surfaces. Longest permitted. */
  reveal: '480ms',
} as const

export const easing = {
  /** Soft deceleration. The system's only easing curve. */
  standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const

export const transform = {
  /** Hover depth. Transform only - it must not change the document layout. */
  hoverLift: '-2px',
  /**
   * Entry translation distance.
   *
   * It was 8px, which on a card 200px tall is close to invisible - the entry
   * was reported as "no animation at all" on pages where it was working
   * correctly. 14px is far enough to read as arrival and short enough that a
   * grid of cards does not look like it is falling into place; the fade still
   * does most of the work, and reduced motion still takes the travel to zero.
   */
  revealDistance: '14px',
} as const

/** Media query the whole system honours. */
export const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export const motion = {
  duration,
  easing,
  transform,
  reducedMotionQuery,
} as const

export type DurationToken = keyof typeof duration
export type EasingToken = keyof typeof easing
export type TransformToken = keyof typeof transform

/** Build a transition string, e.g. `transitionFor('color', 'fast')`. */
export function transitionFor(property: string, token: DurationToken = 'normal'): string {
  return `${property} ${duration[token]} ${easing.standard}`
}
