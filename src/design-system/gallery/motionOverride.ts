/**
 * Horizon Design System v2 - gallery reduced-motion override.
 *
 * The motion control has to work on a reviewer's machine without them changing
 * an operating-system setting, so the gallery owns the one input the system
 * reads: `window.matchMedia(reducedMotionQuery)`.
 *
 * `useReducedMotionPreference` subscribes to that query through
 * `subscribeReducedMotion`, so a query object that reports `matches` from a
 * module-level flag and notifies its listeners when the flag changes is enough
 * to drive every animated component. Every other query is handed straight to the
 * browser, which is what keeps Chakra's own breakpoint queries honest.
 *
 * This module exists only in the gallery entry. No design-system component
 * imports it, and nothing here is reachable from `index.html`.
 */

import { reducedMotionQuery } from '../../theme/tokens'

type QueryListener = (event: MediaQueryListEvent) => void

let reduced = false
let installed = false

const listeners = new Set<QueryListener>()

export function reducedMotionOverride(): boolean {
  return reduced
}

/** Flip the simulated preference and tell every subscriber about it. */
export function setReducedMotionOverride(next: boolean): void {
  if (next === reduced) {
    return
  }

  reduced = next

  const event = { matches: reduced, media: reducedMotionQuery } as MediaQueryListEvent

  for (const listener of [...listeners]) {
    listener(event)
  }
}

function createOverriddenQuery(): MediaQueryList {
  const query = {
    get matches() {
      return reduced
    },
    media: reducedMotionQuery,
    onchange: null,
    addEventListener: (_type: 'change', listener: QueryListener) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: 'change', listener: QueryListener) => {
      listeners.delete(listener)
    },
    addListener: (listener: QueryListener) => {
      listeners.add(listener)
    },
    removeListener: (listener: QueryListener) => {
      listeners.delete(listener)
    },
    dispatchEvent: () => false,
  }

  return query as unknown as MediaQueryList
}

/**
 * Wrap `window.matchMedia`. Call once, before the first render, so the value
 * `useSyncExternalStore` reads on its very first snapshot already comes from
 * the override rather than from the operating system.
 */
export function installMotionOverride(): void {
  if (installed || typeof window === 'undefined') {
    return
  }

  installed = true

  const native = typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : null
  const overridden = createOverriddenQuery()

  window.matchMedia = ((query: string): MediaQueryList => {
    if (query.trim() === reducedMotionQuery) {
      return overridden
    }

    return native ? native(query) : overridden
  }) as typeof window.matchMedia
}
