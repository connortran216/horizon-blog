/**
 * Horizon Design System v2 - subscription lifecycle.
 *
 * Every timer, observer and animation frame in the system is registered here so
 * that unmount is one call and so that a test can prove the call happened. The
 * repository does not render components in tests, so "it cleans up" cannot be
 * demonstrated by unmounting a tree - it has to be demonstrated by disposing a
 * bag and checking that every registered disposer ran.
 *
 * The rule that follows from that: no component may call `setTimeout`,
 * `requestAnimationFrame` or `new IntersectionObserver` inline. It registers the
 * subscription through one of the factories below, and the effect disposes the
 * bag.
 */

import type { Disposer } from './policy.logic'

export interface DisposerBag {
  /**
   * Register a disposer. Returns a function that disposes just that entry, for
   * a subscription with a lifetime shorter than the bag's.
   *
   * Registering into an already-disposed bag runs the disposer immediately,
   * because the thing it was meant to clean up has already outlived its owner.
   */
  add(disposer: Disposer): Disposer
  /** Run every outstanding disposer, once, in reverse registration order. */
  dispose(): void
  /** Outstanding disposers. Zero after `dispose`. */
  readonly size: number
  readonly disposed: boolean
}

export function createDisposerBag(): DisposerBag {
  const entries = new Set<Disposer>()
  let disposed = false

  const remove = (disposer: Disposer) => {
    if (entries.delete(disposer)) {
      disposer()
    }
  }

  return {
    add(disposer: Disposer): Disposer {
      if (disposed) {
        disposer()

        return () => {}
      }

      entries.add(disposer)

      return () => remove(disposer)
    },

    dispose(): void {
      disposed = true

      // Reverse order so a subscription set up on top of another is torn down
      // before the thing it depends on.
      const pending = [...entries].reverse()
      entries.clear()
      pending.forEach((disposer) => disposer())
    },

    get size() {
      return entries.size
    },

    get disposed() {
      return disposed
    },
  }
}

/* -------------------------------------------------------------------------- */
/* Intersection                                                               */
/* -------------------------------------------------------------------------- */

export interface IntersectionEntryLike {
  readonly isIntersecting: boolean
}

export interface IntersectionObserverLike {
  observe(element: unknown): void
  unobserve(element: unknown): void
  disconnect(): void
}

export type IntersectionObserverFactory = (
  callback: (entries: IntersectionEntryLike[]) => void,
  options?: { rootMargin?: string; threshold?: number },
) => IntersectionObserverLike

export interface ObserveOnceInput {
  /** Injected so a test can supply a fake. `null` means the API is missing. */
  readonly createObserver: IntersectionObserverFactory | null | undefined
  readonly element: unknown
  readonly onReveal: () => void
  readonly rootMargin?: string
  readonly threshold?: number
}

/**
 * Watch an element until it first intersects, then reveal and disconnect.
 *
 * Two disposal paths, and both matter: the observer disconnects when the
 * element appears (nothing is left running on a page the reader has scrolled
 * past) and when the returned disposer is called (nothing is left running after
 * unmount). Calling the disposer after a reveal is safe and does nothing.
 *
 * With no `IntersectionObserver` available the content reveals immediately,
 * because a missing browser API must never leave a surface blank.
 */
export function observeOnce({
  createObserver,
  element,
  onReveal,
  rootMargin,
  threshold,
}: ObserveOnceInput): Disposer {
  if (typeof createObserver !== 'function' || element == null) {
    onReveal()

    return () => {}
  }

  let finished = false

  const observer = createObserver(
    (entries) => {
      if (finished || !entries.some((entry) => entry.isIntersecting)) {
        return
      }

      finished = true
      observer.disconnect()
      onReveal()
    },
    { rootMargin, threshold },
  )

  observer.observe(element)

  return () => {
    if (finished) {
      return
    }

    finished = true
    observer.disconnect()
  }
}

/* -------------------------------------------------------------------------- */
/* Frames and timers                                                          */
/* -------------------------------------------------------------------------- */

export interface FrameScheduler {
  readonly request: (callback: () => void) => number
  readonly cancel: (handle: number) => void
}

/** One animation frame, cancellable. The callback never runs after disposal. */
export function scheduleFrame(scheduler: FrameScheduler, callback: () => void): Disposer {
  let cancelled = false

  const handle = scheduler.request(() => {
    if (!cancelled) {
      callback()
    }
  })

  return () => {
    if (cancelled) {
      return
    }

    cancelled = true
    scheduler.cancel(handle)
  }
}

export interface TimerScheduler {
  readonly set: (callback: () => void, delayMs: number) => number
  readonly clear: (handle: number) => void
}

/** One timer, cancellable. The callback never runs after disposal. */
export function scheduleTimer(
  scheduler: TimerScheduler,
  callback: () => void,
  delayMs: number,
): Disposer {
  let cancelled = false

  const handle = scheduler.set(() => {
    if (!cancelled) {
      callback()
    }
  }, delayMs)

  return () => {
    if (cancelled) {
      return
    }

    cancelled = true
    scheduler.clear(handle)
  }
}

/**
 * Wrap an in-flight promise so its settlement is ignored after disposal. This is
 * the async equivalent of clearing a timer: the request cannot be un-sent, but
 * the component that asked for it must not be told about the answer.
 */
export function guardAsync<T>(
  promise: Promise<T>,
  handlers: { onResolved: (value: T) => void; onRejected: (reason: unknown) => void },
): Disposer {
  let cancelled = false

  promise.then(
    (value) => {
      if (!cancelled) {
        handlers.onResolved(value)
      }
    },
    (reason: unknown) => {
      if (!cancelled) {
        handlers.onRejected(reason)
      }
    },
  )

  return () => {
    cancelled = true
  }
}
