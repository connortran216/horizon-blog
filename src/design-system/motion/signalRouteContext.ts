/**
 * Horizon Design System v2 - the plumbing between a route and its line.
 *
 * A `SignalRoute` owns the travel - one progress value from 0 to 1 - and a
 * `SignalLine` inside it draws that progress: the rail as far as the tip has
 * gone, the tip where it is. The line registers its element so the route can
 * measure where its anchors fall along it.
 *
 * Internal to the motion folder, like the field's anchor context.
 */

import { createContext, useContext } from 'react'
import type { MotionValue } from 'framer-motion'

import type { Disposer } from './policy.logic'
import type { SignalOrientation } from './signalRoute.logic'

export interface SignalRouteRail {
  /** Travel progress, 0..1. */
  readonly progress: MotionValue<number>
  readonly orientation: SignalOrientation
  /** The line's element, for measuring. Returns the disposer. */
  registerRail(element: HTMLElement): Disposer
}

export const SignalRouteContext = createContext<SignalRouteRail | null>(null)

export function useSignalRouteRail(): SignalRouteRail | null {
  return useContext(SignalRouteContext)
}
