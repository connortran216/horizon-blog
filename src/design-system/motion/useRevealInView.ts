/**
 * Horizon Design System v2 - "has this scrolled into view yet" hook.
 *
 * Framer Motion has `whileInView`, and it is deliberately not used here. The
 * observer it creates belongs to the library, so this system cannot prove it is
 * disconnected. `observeOnce` is ours, is disposed by the effect below, and is
 * covered in `lifecycle.test.ts`.
 */

import { useEffect, useState, type RefObject } from 'react'

import { createDisposerBag, observeOnce, type IntersectionObserverFactory } from './lifecycle.logic'

export interface RevealInViewOptions {
  /** Skip observation and start revealed - used for above-the-fold content. */
  readonly enabled?: boolean
  readonly rootMargin?: string
  readonly threshold?: number
}

const browserObserverFactory = (): IntersectionObserverFactory | null => {
  if (typeof IntersectionObserver === 'undefined') {
    return null
  }

  return (callback, options) =>
    new IntersectionObserver((entries) => callback(entries), {
      rootMargin: options?.rootMargin,
      threshold: options?.threshold,
    })
}

export function useRevealInView(
  ref: RefObject<Element>,
  { enabled = true, rootMargin = '-10%', threshold = 0 }: RevealInViewOptions = {},
): boolean {
  const [revealed, setRevealed] = useState(!enabled)

  useEffect(() => {
    if (!enabled) {
      setRevealed(true)

      return
    }

    const bag = createDisposerBag()

    bag.add(
      observeOnce({
        createObserver: browserObserverFactory(),
        element: ref.current,
        onReveal: () => setRevealed(true),
        rootMargin,
        threshold,
      }),
    )

    return () => bag.dispose()
  }, [enabled, ref, rootMargin, threshold])

  return revealed
}
