/**
 * Horizon Design System v2 - semantic colour roles.
 *
 * A semantic role names what a colour is for, never where it is used. Roles are
 * always paired: a role that cannot answer for both themes does not exist.
 *
 * Two origins are tracked, and the difference matters at review time:
 *
 * - `approved` roles carry the exact values signed off in the Signal baseline
 *   v0.2. Their contrast was verified arithmetically (minimum 4.77:1 for text,
 *   3.03:1 for control borders). Changing one of these values needs a new design
 *   decision, not a code review.
 * - `derived` roles cover states the baseline did not enumerate - overlays,
 *   disabled, selection, code, loading and media feedback. Each one composites an
 *   approved primitive over an approved surface rather than introducing a new
 *   pigment. `DESIGN.md` carries an open question against this set: rendered
 *   contrast still needs validation before the values stabilise.
 */

import { palette } from './primitives'

export interface ThemePair {
  readonly light: string
  readonly dark: string
}

export type SemanticOrigin = 'approved' | 'derived'

/** Exact Signal v0.2 baseline. These 19 roles are authoritative. */
const approvedColors = {
  'bg.page': { light: palette.mist[50], dark: palette.night[900] },
  'bg.surface': { light: palette.white, dark: palette.night[800] },
  'bg.subtle': { light: palette.mist[100], dark: palette.night[700] },
  'bg.elevated': { light: palette.white, dark: palette.night[600] },

  'text.primary': { light: palette.mist[900], dark: palette.night[50] },
  'text.secondary': { light: palette.mist[700], dark: palette.night[200] },
  'text.muted': { light: palette.mist[600], dark: palette.night[300] },
  'text.onAction': { light: palette.white, dark: palette.night[950] },
  'text.onAccent': { light: palette.lime[800], dark: palette.lime[900] },

  'action.primary': { light: palette.cobalt[600], dark: palette.cobalt[400] },
  'action.hover': { light: palette.cobalt[800], dark: palette.cobalt[300] },

  'link.default': { light: palette.cobalt[700], dark: palette.cobalt[200] },

  'accent.lime': { light: palette.lime[200], dark: palette.lime[300] },

  'border.subtle': { light: palette.mist[200], dark: palette.night[500] },
  'border.control': { light: palette.mist[500], dark: palette.night[400] },

  'focus.ring': { light: palette.cobalt[600], dark: palette.cobalt[100] },

  'status.success': { light: palette.success[600], dark: palette.success[300] },
  'status.warning': { light: palette.warning[600], dark: palette.warning[300] },
  'status.danger': { light: palette.danger[600], dark: palette.danger[300] },
} as const satisfies Record<string, ThemePair>

/**
 * States the baseline did not enumerate. Every value is an approved colour at an
 * alpha, or an approved colour reused in a second role - no new pigments.
 */
const derivedColors = {
  /** Scrim behind modals and the mobile navigation panel. */
  'bg.overlay': { light: 'rgb(23 33 58 / 45%)', dark: 'rgb(0 0 0 / 60%)' },
  /** Text selection highlight. */
  'bg.selection': { light: 'rgb(49 88 212 / 18%)', dark: 'rgb(138 164 255 / 24%)' },
  /** Code blocks sit below the surface they are embedded in. */
  'bg.code': { light: palette.mist[100], dark: palette.night[900] },
  'bg.disabled': { light: 'rgb(23 33 58 / 6%)', dark: 'rgb(233 238 250 / 8%)' },
  /** Inverted surface for tooltips and high-emphasis confirmation. */
  'bg.inverse': { light: palette.mist[900], dark: palette.night[50] },

  'text.onInverse': { light: palette.mist[50], dark: palette.mist[900] },
  'text.disabled': { light: 'rgb(23 33 58 / 40%)', dark: 'rgb(233 238 250 / 38%)' },

  'border.disabled': { light: 'rgb(126 139 165 / 45%)', dark: 'rgb(105 123 157 / 45%)' },

  'action.disabled': { light: 'rgb(49 88 212 / 35%)', dark: 'rgb(138 164 255 / 30%)' },
  /** Quiet tint behind ghost and outline actions on hover. */
  'action.subtle': { light: 'rgb(49 88 212 / 10%)', dark: 'rgb(138 164 255 / 16%)' },

  /*
   * Atmosphere behind editorial feature artwork. `DESIGN.md`'s Motion section
   * sanctions ambient movement on suitable Home and About artwork, and these
   * three roles are the whole palette it is allowed to be made of: two glow
   * pools and the light that passes across them. Every value is an approved
   * action or accent colour at alpha, so atmosphere cannot become a pigment the
   * baseline never signed off - which is the difference between this and the
   * "random glow" the Avoid list rules out.
   */
  /** The primary glow pool. `action.primary` at alpha. */
  'ambient.glow': { light: 'rgb(49 88 212 / 16%)', dark: 'rgb(138 164 255 / 20%)' },
  /** The second, warmer pool. `accent.lime` at alpha. */
  'ambient.accentGlow': { light: 'rgb(221 248 154 / 60%)', dark: 'rgb(197 236 131 / 20%)' },
  /** The pass of light that crosses the scene. `action.primary`, fainter. */
  'ambient.sweep': { light: 'rgb(49 88 212 / 8%)', dark: 'rgb(138 164 255 / 10%)' },

  /** Skeleton body and its sweep. */
  'loading.base': { light: 'rgb(23 33 58 / 8%)', dark: 'rgb(233 238 250 / 8%)' },
  'loading.highlight': { light: 'rgb(255 255 255 / 85%)', dark: 'rgb(233 238 250 / 12%)' },
  /** Determinate track and its indicator, shared by progress and spinners. */
  'loading.track': { light: 'rgb(49 88 212 / 12%)', dark: 'rgb(138 164 255 / 16%)' },
  'loading.indicator': { light: palette.cobalt[600], dark: palette.cobalt[400] },

  /** Media state machine: reserved box, its pattern, and the failure tint. */
  'media.placeholder': { light: palette.mist[100], dark: palette.night[700] },
  'media.placeholderAccent': { light: palette.mist[200], dark: palette.night[500] },
  'media.error': { light: 'rgb(180 35 54 / 10%)', dark: 'rgb(255 146 159 / 12%)' },

  /** Status tints. The matching `status.*` role supplies text and iconography. */
  'status.successSurface': { light: 'rgb(32 107 67 / 10%)', dark: 'rgb(128 215 161 / 14%)' },
  'status.warningSurface': { light: 'rgb(138 83 0 / 10%)', dark: 'rgb(241 195 108 / 14%)' },
  'status.dangerSurface': { light: 'rgb(180 35 54 / 10%)', dark: 'rgb(255 146 159 / 14%)' },
} as const satisfies Record<string, ThemePair>

export const semanticColors = {
  ...approvedColors,
  ...derivedColors,
} as const

export type SemanticColorToken = keyof typeof semanticColors
export type ApprovedColorToken = keyof typeof approvedColors
export type DerivedColorToken = keyof typeof derivedColors

export const approvedColorTokens = Object.keys(approvedColors) as ApprovedColorToken[]
export const derivedColorTokens = Object.keys(derivedColors) as DerivedColorToken[]

export function colorOrigin(token: SemanticColorToken): SemanticOrigin {
  return token in approvedColors ? 'approved' : 'derived'
}

/** Resolve a role for one theme. Unknown names are a TypeScript error. */
export function semanticColor(token: SemanticColorToken, mode: 'light' | 'dark'): string {
  return semanticColors[token][mode]
}
