/**
 * Horizon Design System v2 - the reduced-motion hook.
 *
 * The one place React reads the media query. Everything else takes a
 * `MotionPolicy` value, which is why the policy is testable without a DOM.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`: the preference
 * can change while the page is open (a system setting, or a browser devtools
 * emulation), and the store form gets the subscription teardown for free and
 * gives the server snapshot explicitly.
 */

import { useCallback, useSyncExternalStore } from 'react'

import {
  motionPolicyFor,
  readReducedMotion,
  subscribeReducedMotion,
  type Disposer,
  type MotionPolicy,
} from './policy.logic'

const browserMatchMedia = () =>
  typeof window === 'undefined' ? null : window.matchMedia?.bind(window)

export function useReducedMotionPreference(): boolean {
  const subscribe = useCallback((notify: () => void): Disposer => {
    return subscribeReducedMotion(browserMatchMedia(), notify)
  }, [])

  const getSnapshot = useCallback(() => readReducedMotion(browserMatchMedia()), [])

  // Server render assumes full motion, matching `readReducedMotion`'s own
  // fallback. Hydration then corrects it on the first client snapshot.
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export function useMotionPolicy(): MotionPolicy {
  return motionPolicyFor(useReducedMotionPreference())
}
