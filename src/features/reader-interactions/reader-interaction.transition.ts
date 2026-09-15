/**
 * What the heart control shows after a press.
 *
 * A reaction changes something outside the page, so what the reader sees has
 * to be what the backend actually recorded - never a locally guessed count
 * shown before the request has even settled. `useReaderInteractions` calls
 * `resolveHeartToggle` exactly once the request finishes, with the confirmed
 * state on success or nothing on failure, and this function is the entire
 * decision: the confirmed state replaces what was there, or the previous
 * state is kept unchanged. There is no third path that fabricates a state
 * the API never returned.
 */

import { ReaderInteractionState } from './reader-interactions.types'

export type HeartToggleOutcome =
  | { readonly type: 'confirmed'; readonly state: ReaderInteractionState }
  | { readonly type: 'failed' }

/**
 * The state to show once a heart toggle request settles.
 *
 * `confirmed` carries exactly the state the API returned - not the previous
 * state adjusted by one, which is how an optimistic count and the server's
 * real count drift apart the moment two tabs or two requests race. `failed`
 * returns `previous` untouched: the reader presses, waits, and - if the
 * request did not succeed - sees the same heart and the same count they
 * started with, with the error surfaced elsewhere rather than a state change
 * that has to be quietly reverted.
 */
export function resolveHeartToggle(
  previous: ReaderInteractionState,
  outcome: HeartToggleOutcome,
): ReaderInteractionState {
  return outcome.type === 'confirmed' ? outcome.state : previous
}
