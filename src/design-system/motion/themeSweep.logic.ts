/**
 * Horizon Design System v2 - the theme sweep.
 *
 * Switching theme is the one moment the whole page changes at once, and it is
 * the moment the brand is literally about: day becoming night. So the new
 * theme opens from a horizon line across the middle of the viewport, upward
 * into the sky and downward into the ground, instead of the circle-from-the-
 * button that every theme toggle animates.
 *
 * The sweep is a view transition. The stylesheet scopes its root animation to
 * `html[data-theme-sweep]`, and this helper is the only thing that sets and
 * clears that attribute - so the cover morph that navigation runs, which is
 * also a view transition, keeps the browser's default crossfade. Whatever the
 * browser supports, and whether or not the transition is skipped, the theme
 * change itself lands exactly once - that is `startViewTransition`'s promise,
 * and this only adds the attribute around it.
 */

import { themeSweepAttribute } from '../../theme/tokens'
import type { ViewTransitionResult } from './viewTransition.logic'

export interface SweepRootLike {
  setAttribute: (name: string, value: string) => void
  removeAttribute: (name: string) => void
}

export interface SweepDocumentLike {
  readonly documentElement: SweepRootLike
}

export interface RunThemeSweepInput {
  readonly document: SweepDocumentLike | null | undefined
  /** `useViewTransition()`'s callback, or `startViewTransition` bound to a policy. */
  readonly runTransition: (update: () => void) => ViewTransitionResult
  /** The theme change. Must apply to the DOM synchronously when called. */
  readonly update: () => void
}

export function runThemeSweep({
  document,
  runTransition,
  update,
}: RunThemeSweepInput): ViewTransitionResult {
  const root = document?.documentElement

  root?.setAttribute(themeSweepAttribute, '')

  const result = runTransition(update)

  if (!result.animated) {
    root?.removeAttribute(themeSweepAttribute)

    return result
  }

  void result.finished.then(() => root?.removeAttribute(themeSweepAttribute))

  return result
}

/**
 * The new theme's clip, from a closed line at the middle to the full viewport.
 * A `clip-path` on the view transition's own pseudo-element, so nothing in the
 * document is laid out or painted twice.
 */
export const themeSweepKeyframes = {
  from: { clipPath: 'inset(50% 0 50% 0)' },
  to: { clipPath: 'inset(0 0 0 0)' },
} as const
