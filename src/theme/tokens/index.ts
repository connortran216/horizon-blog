/**
 * Horizon Design System v2 - token entry point.
 *
 * Layering, outermost first:
 *
 *   1. primitives  raw palette, type, space, radius, elevation, breakpoints
 *   2. semantic    paired light/dark roles - the layer components consume
 *   3. motion      duration, easing, transform, reduced-motion contract
 *   4. components  per-family aliases pointing at layers 2 and 3
 *
 * Import from this file, not from the modules directly.
 */

export {
  blur,
  breakpoints,
  elevation,
  focusRing,
  fontFamilies,
  fontWeights,
  layout,
  palette,
  radii,
  reviewWidths,
  sectionSpace,
  space,
  typeScale,
} from './primitives'
export type {
  BlurToken,
  BreakpointToken,
  Palette,
  RadiusToken,
  SpaceToken,
  TypeScaleToken,
} from './primitives'

export {
  approvedColorTokens,
  colorOrigin,
  derivedColorTokens,
  semanticColor,
  semanticColors,
} from './semantic'
export type {
  ApprovedColorToken,
  DerivedColorToken,
  SemanticColorToken,
  SemanticOrigin,
  ThemePair,
} from './semantic'

export { contrastRatio, relativeLuminance, textContrastFloor } from './contrast'

export {
  duration,
  easing,
  motion,
  reducedMotionQuery,
  themeSweepAttribute,
  transform,
  transitionFor,
} from './motion'
export type { DurationToken, EasingToken, TransformToken } from './motion'

export { componentTokens } from './components'
export type { ComponentFamily } from './components'

import {
  blur,
  breakpoints,
  elevation,
  focusRing,
  fontFamilies,
  fontWeights,
  layout,
  palette,
  radii,
  reviewWidths,
  sectionSpace,
  space,
  typeScale,
} from './primitives'
import { semanticColors } from './semantic'
import { motion } from './motion'
import { componentTokens } from './components'

/** The whole system as one value, for the gallery and the coverage audit. */
export const tokens = {
  version: '2.0.0',
  primitives: {
    palette,
    space,
    sectionSpace,
    radii,
    blur,
    fontFamilies,
    fontWeights,
    typeScale,
    layout,
    breakpoints,
    reviewWidths,
    elevation,
    focusRing,
  },
  semantic: { colors: semanticColors },
  motion,
  components: componentTokens,
} as const

export type Tokens = typeof tokens
