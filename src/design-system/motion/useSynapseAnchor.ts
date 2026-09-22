/**
 * Horizon Design System v2 - being written by the field.
 *
 * An element inside a `SynapseField` registers as an anchor and learns when a
 * signal lands on it. Outside a field - or under reduced motion, where the
 * field hits every anchor as it registers - the element counts as hit from
 * the start, so a `Typeset` or a `SignalTarget` behaves normally anywhere.
 *
 * Internal to the motion folder: it is how the two copy primitives talk to the
 * field, not a public hook.
 */

import { useEffect, useState, type RefObject } from 'react'

import { createDisposerBag, scheduleTimer } from './lifecycle.logic'
import { useSynapseSignals } from './synapseContext'

const timerScheduler = {
  set: (callback: () => void, delayMs: number) => window.setTimeout(callback, delayMs),
  clear: (handle: number) => window.clearTimeout(handle),
}

export interface SynapseAnchorState {
  /** A signal has landed at least once - the element may appear. */
  readonly hit: boolean
  /** A signal landed within the last pulse - the element is lit. */
  readonly lit: boolean
}

export function useSynapseAnchor(ref: RefObject<HTMLElement>, pulseMs: number): SynapseAnchorState {
  const signals = useSynapseSignals()
  const [hit, setHit] = useState(signals === null)
  const [lit, setLit] = useState(false)

  useEffect(() => {
    const element = ref.current

    if (signals === null || element === null) {
      return
    }

    /*
     * A fresh bag per subscription. A bag kept in a ref would be disposed by
     * the first cleanup - which React runs immediately in development - and a
     * disposed bag runs every later timer's disposer at once, so the glow
     * would never go out.
     */
    const bag = createDisposerBag()
    const dispose = signals.register({
      element,
      onHit: () => {
        setHit(true)
        setLit(true)
        bag.add(scheduleTimer(timerScheduler, () => setLit(false), pulseMs))
      },
    })

    // The safety net: content never waits on decoration for longer than this.
    bag.add(scheduleTimer(timerScheduler, () => setHit(true), signals.fallbackMs))

    return () => {
      dispose()
      bag.dispose()
    }
  }, [signals, ref, pulseMs])

  return { hit, lit }
}
