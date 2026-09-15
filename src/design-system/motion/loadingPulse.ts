/**
 * Horizon Design System v2 - the loading pulse.
 *
 * The one continuous animation the system allows, and it exists once so that a
 * skeleton and a media placeholder breathe at the same rate instead of at two
 * rates someone chose separately.
 *
 * Opacity only, taken from the approved prototype. The cycle comes from the
 * duration tokens, and under reduced motion `loadingPulseAnimation` returns
 * `undefined` so the surface is simply still.
 */

// Emotion is what Chakra styles with, and it is already a direct dependency.
// Chakra v2.8 re-exports `keyframes` at runtime but not in its types.
import { keyframes } from '@emotion/react'

import { loadingCycle } from './policy.logic'
import type { MotionPolicy } from './policy.logic'

export const loadingPulse = keyframes({ '50%': { opacity: 0.45 } })

export function loadingPulseAnimation(policy: MotionPolicy): string | undefined {
  return policy.loadingRhythm ? `${loadingPulse} ${loadingCycle()} ease-in-out infinite` : undefined
}
