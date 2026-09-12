/**
 * Horizon Design System v2 - View Transitions binding.
 *
 * A stable callback that runs a DOM update inside a view transition when the
 * browser has one and the user has not asked for less motion. The decision
 * itself is in `viewTransition.logic.ts`; this only supplies the document and
 * the current policy.
 */

import { useCallback } from 'react'

import { useMotionPolicy } from './useMotionPolicy'
import {
  startViewTransition,
  type ViewTransitionDocumentLike,
  type ViewTransitionResult,
} from './viewTransition.logic'

export function useViewTransition(): (update: () => void) => ViewTransitionResult {
  const policy = useMotionPolicy()

  return useCallback(
    (update: () => void) =>
      startViewTransition({
        document: typeof document === 'undefined' ? null : (document as ViewTransitionDocumentLike),
        policy,
        update,
      }),
    [policy],
  )
}
