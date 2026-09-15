/**
 * The `blog_draft_backup` local-storage backup: parsing, ownership, and the
 * recovery decision.
 *
 * `useAutoSave` writes a full copy of the draft to this one key a second after
 * the last keystroke (`localSaveDelay`), and until now nothing ever read it
 * back - the recovery half of "draft recovery" did not exist. What a fresh
 * editor session finds under this key can be:
 *
 *   - this same post's own unsynced work, left behind by a tab that closed
 *     before its next autosave reached the server;
 *   - a *different* post's leftover work - the key is shared by every post the
 *     author has ever opened in this browser, so switching drafts without the
 *     earlier one finishing its save leaves its backup sitting here; or
 *   - garbage: JSON from a build that predates the `postId` field below,
 *     content truncated by a tab that closed mid-write, or nothing at all.
 *
 * Every function here treats all three defensively. `parseDraftBackup` turns
 * anything that fails validation into `null` - exactly like no backup at all,
 * with no distinction between "corrupt" and "wrong shape" because the caller
 * cannot act on either. `backupBelongsToPost` is a strict equality check, not
 * a best guess: offering post A's words while the author is writing post B
 * would be a data-loss bug wearing a recovery feature's clothes.
 *
 * `resolveDraftRecovery` is the one entry point the feature layer calls. It
 * delegates the actual "is this worth offering back" question to the design
 * system's `draftRecovery()` (`design-system/patterns/editor/workspace.logic.ts`)
 * rather than re-deciding it here - that function already carries the tested
 * tolerance window and the copy the owner approved.
 */

import { draftRecovery } from '../../design-system'

/** The one key every post's local backup is written to and read from. */
export const DRAFT_BACKUP_STORAGE_KEY = 'blog_draft_backup'

export interface DraftBackupPayload {
  /**
   * The post this backup was written while editing. `null` means the draft
   * had never reached the server at the moment of writing - there is no id to
   * key on yet, so every never-saved draft shares this one bucket. That is a
   * known, accepted gap: two different new drafts are indistinguishable by
   * this check alone until one of them is saved.
   */
  readonly postId: number | null
  readonly title: string
  readonly contentMarkdown: string
  readonly contentJSON: string
  readonly tags: readonly string[]
  /** ISO timestamp, written by `Date.prototype.toISOString`. */
  readonly timestamp: string
}

function isDraftBackupPayload(value: unknown): value is DraftBackupPayload {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    (candidate.postId === null || typeof candidate.postId === 'number') &&
    typeof candidate.title === 'string' &&
    typeof candidate.contentMarkdown === 'string' &&
    typeof candidate.contentJSON === 'string' &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === 'string') &&
    typeof candidate.timestamp === 'string'
  )
}

/**
 * Parse a raw `localStorage` value into a backup payload, or `null`.
 *
 * `null` covers every way this can be unusable: the key was empty, the value
 * was not JSON, the JSON was not an object, or the object is missing a field
 * this shape needs - including `postId`, which a backup written before
 * ownership tagging existed will not have. A backup this function cannot
 * validate must never be offered back, so there is no partial-trust path here.
 */
export function parseDraftBackup(raw: string | null): DraftBackupPayload | null {
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isDraftBackupPayload(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Epoch milliseconds from the backup's timestamp, or `undefined` if unreadable. */
export function draftBackupSavedAt(backup: DraftBackupPayload): number | undefined {
  const parsed = Date.parse(backup.timestamp)
  return Number.isFinite(parsed) ? parsed : undefined
}

/**
 * Whether a backup was written while editing this exact post.
 *
 * See the `postId` field's doc comment for the `null` case: it is a shared
 * bucket for every draft that had never reached the server, not a wildcard
 * match against a real post id.
 */
export function backupBelongsToPost(backup: DraftBackupPayload, postId: number | null): boolean {
  return backup.postId === postId
}

/** Epoch milliseconds from an ISO timestamp, or `undefined` if missing or unreadable. */
function toEpochMs(iso: string | undefined): number | undefined {
  if (iso === undefined) {
    return undefined
  }

  const parsed = Date.parse(iso)
  return Number.isFinite(parsed) ? parsed : undefined
}

export interface ResolvedDraftRecovery {
  /** The backup to restore, present only while it is worth offering. */
  readonly backup: DraftBackupPayload | null
  readonly offersRecovery: boolean
  readonly headline: string | null
  readonly detail: string | null
}

const notOffered: ResolvedDraftRecovery = {
  backup: null,
  offersRecovery: false,
  headline: null,
  detail: null,
}

/**
 * Decide whether the local backup under `blog_draft_backup` is worth offering
 * back for the post currently open, and parse it if so.
 *
 * Ownership is checked before recency: a backup that belongs to a different
 * post is never offered, however new it is. Only once ownership is confirmed
 * does the decision fall through to `draftRecovery()`'s timestamp comparison.
 */
export function resolveDraftRecovery(
  rawBackup: string | null,
  postId: number | null,
  serverSavedAt: string | undefined,
): ResolvedDraftRecovery {
  const backup = parseDraftBackup(rawBackup)

  if (!backup || !backupBelongsToPost(backup, postId)) {
    return notOffered
  }

  const recovery = draftRecovery({
    localSavedAt: draftBackupSavedAt(backup),
    serverSavedAt: toEpochMs(serverSavedAt),
  })

  if (!recovery.offersRecovery) {
    return notOffered
  }

  return {
    backup,
    offersRecovery: true,
    headline: recovery.headline,
    detail: recovery.detail,
  }
}
