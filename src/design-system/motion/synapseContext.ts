/**
 * Horizon Design System v2 - the synapse field's anchors.
 *
 * Copy laid on a `SynapseField` can register itself as an anchor: a point the
 * network sends a signal to. The field calls `onHit` when the signal lands,
 * and the anchor decides what that means - a word appearing, a rule drawing.
 * Outside a field the context is null and anchors simply behave as if they
 * had already been hit, so `Typeset` and `SignalTarget` work anywhere.
 *
 * Internal to the motion folder on purpose: it is plumbing between the field
 * and its copy, not a public surface.
 */

import { createContext, useContext } from 'react'

import type { Disposer } from './policy.logic'

export interface SynapseAnchorHandle {
  /** The element whose box the signal travels to. */
  readonly element: HTMLElement
  /** Called when a signal lands. `first` is true the first time. */
  readonly onHit: (first: boolean) => void
}

export interface SynapseSignals {
  /** Registration order is writing order. Returns the disposer. */
  register(handle: SynapseAnchorHandle): Disposer
  /**
   * Milliseconds after which an anchor that has not been hit appears anyway.
   * The copy is content; the field is decoration, and decoration is never
   * allowed to keep content off the page - a starved frame loop, a canvas the
   * browser refused, a tab that stayed in the background.
   */
  readonly fallbackMs: number
}

export const SynapseContext = createContext<SynapseSignals | null>(null)

export function useSynapseSignals(): SynapseSignals | null {
  return useContext(SynapseContext)
}
