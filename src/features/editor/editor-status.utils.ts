/**
 * Editor status decisions.
 *
 * `useAutoSave` reports what it did - saving, saved, failed, permission lost -
 * and `AutosaveState` renders a label, an icon and a colour for one of seven
 * named states. These functions are the join between the two, and they are pure
 * so the join is testable without a DOM: the state an author sees after a 403,
 * after going offline, or while a save is in flight is decided here rather than
 * inside a component nobody can render in this repo.
 *
 * Nothing here saves anything or decides when a save happens. Autosave timing,
 * the local backup and the request sequence all stay in `useAutoSave`.
 */

import type { AutosaveStateInput } from '../../design-system'

/** What `useAutoSave` knows, plus the connection, at one moment. */
export interface EditorSaveSnapshot {
  readonly isSaving: boolean
  readonly saveStatus: 'saved' | 'saving' | 'error'
  readonly permissionLost: boolean
  readonly isOffline: boolean
  /** The 400 the backend returned, when it returned one. */
  readonly validationMessage?: string
  /** When the last successful save landed. */
  readonly lastSaved?: Date
  /** Whether this draft has ever reached the server. */
  readonly hasSavedDraft: boolean
  readonly locale?: string
}

/**
 * The sentence shown when a save fails for a reason the backend did not name.
 *
 * `useAutoSave` only carries a message for a 400. Every other failure - a
 * timeout, a 500, a dropped connection - arrives as a bare error status, and
 * "Save failed" on its own tells the author nothing about whether their work
 * still exists. It does: the local backup is written a second after every
 * keystroke.
 */
export const GENERIC_SAVE_FAILURE =
  'We could not reach the server. Your draft is still kept in this browser.'

/** "at 14:32". The clock, not a relative phrase - it is checkable. */
export function lastSavedLabel(savedAt: Date, locale?: string): string {
  if (!Number.isFinite(savedAt.getTime())) {
    return 'a moment ago'
  }

  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(savedAt)

  return `at ${time}`
}

/**
 * Translate one autosave snapshot into the indicator's input.
 *
 * Precedence is `autosaveState`'s, not this function's: it is handed every
 * signal it has and the design system decides which one wins. The only decision
 * made here is which sentence a failure carries, because only the feature knows
 * that a 400 arrives with a message and nothing else does.
 */
export function autosaveIndicator(snapshot: EditorSaveSnapshot): AutosaveStateInput {
  const isSaving = snapshot.isSaving || snapshot.saveStatus === 'saving'
  const hasFailed = snapshot.saveStatus === 'error'

  return {
    permissionLost: snapshot.permissionLost,
    isOffline: snapshot.isOffline,
    isSaving,
    error: hasFailed ? (snapshot.validationMessage ?? GENERIC_SAVE_FAILURE) : undefined,
    lastSavedLabel:
      snapshot.lastSaved && snapshot.hasSavedDraft
        ? lastSavedLabel(snapshot.lastSaved, snapshot.locale)
        : undefined,
  }
}

/**
 * Words in the draft.
 *
 * Runs of non-whitespace, which counts Vietnamese the same way it counts
 * English because both are space-delimited. Markdown syntax is counted as
 * written; a "words excluding markup" number would need a parser and would
 * disagree with what the author can see on the screen.
 */
export function wordCount(markdown: string): number {
  return markdown.trim().match(/\S+/g)?.length ?? 0
}

/** The workspace footer: how much is written, and in what. */
export function workspaceFooter(markdown: string): string {
  const words = wordCount(markdown)

  return `${words} ${words === 1 ? 'word' : 'words'} · Markdown`
}
