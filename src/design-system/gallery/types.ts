/**
 * Horizon Design System v2 - gallery types.
 *
 * The shapes the registry, the controls and the entry renderers agree on. Kept
 * in their own module so `registry.ts` stays a plain, statically analysable data
 * file: the coverage audit reads it without following an import into JSX.
 */

import type { reviewWidths } from '../../theme/tokens'

/** The barrel each entry comes from, using the barrel's own folder name. */
export type GalleryArea =
  | 'layout'
  | 'surface'
  | 'typography'
  | 'actions'
  | 'navigation'
  | 'forms'
  | 'status'
  | 'motion'
  | 'feedback'
  | 'media'
  | 'posts'
  | 'series'
  | 'reader'
  | 'account'
  | 'editor'
  | 'data'

/**
 * The four states the global state control filters by. A demonstrated state
 * that is none of these - a tone, a size, a variant - simply has no kind, and
 * is hidden when the reviewer is focused on one of the four.
 */
export type GalleryStateKind = 'ready' | 'loading' | 'empty' | 'error'

export interface GalleryStateSpec {
  /** How the state reads in the index and above its panel. */
  readonly name: string
  readonly kind?: GalleryStateKind
}

export interface GalleryEntry {
  /** The exported symbol, spelled exactly as `src/design-system/index.ts` spells it. */
  readonly name: string
  readonly area: GalleryArea
  readonly states: readonly GalleryStateSpec[]
  /**
   * Why this entry is not a bare mount of the export - the parent it sits
   * inside, or the harness that drives it. Absent for a component that stands
   * on its own.
   */
  readonly note?: string
}

export type ThemeChoice = 'light' | 'dark'

/** The four review widths, taken from the tokens rather than restated here. */
export type ViewportChoice = (typeof reviewWidths)[number]

export type MotionChoice = 'normal' | 'reduced'
export type ContentChoice = 'normal' | 'long'
export type MediaChoice = 'present' | 'missing' | 'broken'
export type StateChoice = 'all' | GalleryStateKind

export interface GalleryControls {
  readonly theme: ThemeChoice
  readonly viewport: ViewportChoice
  readonly motion: MotionChoice
  readonly content: ContentChoice
  readonly media: MediaChoice
  readonly state: StateChoice
}
