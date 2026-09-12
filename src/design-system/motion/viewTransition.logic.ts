/**
 * Horizon Design System v2 - View Transitions helper.
 *
 * The View Transitions API is progressive enhancement and nothing more. Three
 * things can be true - the browser has no API, the user asked for reduced
 * motion, or the transition throws - and in all three the DOM update still has
 * to happen, immediately and exactly once. That invariant is the whole reason
 * this is a helper rather than an inline `document.startViewTransition?.(...)`
 * at each call site.
 */

import type { MotionPolicy } from './policy.logic'

export interface ViewTransitionLike {
  readonly finished: Promise<unknown>
}

export interface ViewTransitionDocumentLike {
  startViewTransition?: (update: () => void) => ViewTransitionLike
}

export interface ViewTransitionResult {
  /** The browser ran the update inside a view transition. */
  readonly animated: boolean
  /** Resolves when the transition finishes, or immediately when there is none. */
  readonly finished: Promise<void>
}

export interface StartViewTransitionInput {
  readonly document: ViewTransitionDocumentLike | null | undefined
  readonly policy: MotionPolicy
  /** The DOM mutation. Runs exactly once, whatever the browser supports. */
  readonly update: () => void
}

export function startViewTransition({
  document,
  policy,
  update,
}: StartViewTransitionInput): ViewTransitionResult {
  const immediate = (): ViewTransitionResult => {
    update()

    return { animated: false, finished: Promise.resolve() }
  }

  if (policy.reduced || typeof document?.startViewTransition !== 'function') {
    return immediate()
  }

  let ran = false
  const runOnce = () => {
    if (!ran) {
      ran = true
      update()
    }
  }

  try {
    const transition = document.startViewTransition(runOnce)

    return {
      animated: true,
      // A rejected `finished` means the transition was skipped or interrupted.
      // The DOM update already happened, so this resolves rather than rejects.
      finished: Promise.resolve(transition.finished).then(
        () => undefined,
        () => undefined,
      ),
    }
  } catch {
    // The API exists but refused. The update must still land.
    runOnce()

    return { animated: false, finished: Promise.resolve() }
  }
}
