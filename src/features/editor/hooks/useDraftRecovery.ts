/**
 * useDraftRecovery Hook - offers back a local draft backup, once.
 *
 * All of the actual decision - whether a backup exists, whether it belongs to
 * this post, and whether it is worth offering over what the server has - is
 * `resolveDraftRecovery` in `../draft-backup.logic`, a pure function tested
 * directly (this repo has no DOM in its test environment, so a hook that held
 * that logic itself could not be unit tested). This hook is the thin wiring
 * around it: it waits for the post to finish loading, then remembers that the
 * author has acted so the offer does not reappear after a `Restore` or
 * `Discard` click causes the surrounding page to re-render.
 */

import { useCallback, useMemo, useState } from 'react'
import { resolveDraftRecovery, type DraftBackupPayload } from '../draft-backup.logic'

interface UseDraftRecoveryOptions {
  /** `localBackupSnapshot` from `useAutoSave` - read once, before mount. */
  rawBackup: string | null
  /** The post this editor session has open. `null` for one never saved. */
  postId: number | null
  /** The server's last confirmed save time for this post, if any. */
  serverSavedAt?: string
  /** Recovery waits for this to settle before deciding anything. */
  isLoading: boolean
}

export interface UseDraftRecoveryResult {
  readonly offersRecovery: boolean
  readonly headline: string | null
  readonly detail: string | null
  /** The parsed backup to restore. Present only while `offersRecovery` is true. */
  readonly backup: DraftBackupPayload | null
  /** Call once the author has restored or discarded the offer. */
  readonly resolve: () => void
}

const nothingOffered = {
  offersRecovery: false,
  headline: null,
  detail: null,
  backup: null,
} as const

export function useDraftRecovery({
  rawBackup,
  postId,
  serverSavedAt,
  isLoading,
}: UseDraftRecoveryOptions): UseDraftRecoveryResult {
  // Once the author acts, the offer stays gone for the rest of this mount -
  // it must not reappear just because some unrelated prop caused a re-render.
  const [resolved, setResolved] = useState(false)
  const resolve = useCallback(() => setResolved(true), [])

  const decision = useMemo(() => {
    if (isLoading || resolved) {
      return nothingOffered
    }

    return resolveDraftRecovery(rawBackup, postId, serverSavedAt)
  }, [isLoading, resolved, rawBackup, postId, serverSavedAt])

  return { ...decision, resolve }
}
