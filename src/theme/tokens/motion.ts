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
  /**
   * One typesetting beat: the gap between two neighbouring words arriving in a
   * `Typeset` headline. Shorter than `fast` on purpose - a ten-word display
   * line is fully set 360ms after the first word, well inside one `reveal`.
   */
  tick: '40ms',
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
  /**
   * How far a `Typeset` word rises through its own baseline, in em so it scales
   * with the display ramp. Half a line is enough to start fully hidden below the
   * line box's clip and read as arrival rather than as a jitter.
   */
  typesetRise: '0.5em',
  /**
   * Directional icon travel on hover: the arrow at the end of a call to action
   * moves this far towards where the link goes. Same magnitude as the hover
   * lift, on the other axis, and gone under reduced motion.
   */
  iconTravel: '2px',
} as const

/**
 * The attribute the root element carries while a theme change runs inside a
 * view transition. The theme's global stylesheet scopes the horizon sweep to
 * it, so the cover morph that navigation uses keeps the browser's default
 * root crossfade and the two never apply to one another.
 */
export const themeSweepAttribute = 'data-theme-sweep'

/** Media query the whole system honours. */
export const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export const motion = {
  duration,
  easing,
  transform,
  reducedMotionQuery,
  themeSweepAttribute,
} as const

export type DurationToken = keyof typeof duration
export type EasingToken = keyof typeof easing
export type TransformToken = keyof typeof transform

/** Build a transition string, e.g. `transitionFor('color', 'fast')`. */
export function transitionFor(property: string, token: DurationToken = 'normal'): string {
  return `${property} ${duration[token]} ${easing.standard}`
}
