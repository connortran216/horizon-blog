/**
 * Horizon Design System v2 - authoring workspace decisions.
 *
 * The editor is the densest surface in the product and the only one where the
 * reader's own work can be lost. Every decision on this page is therefore about
 * one question: does the author know, right now, whether what they typed is
 * safe?
 *
 * `horizon-blog-dsv2.6.2` acceptance 3 - critical state is never communicated
 * by motion or colour alone - is enforced structurally here rather than
 * remembered by each component. `autosaveState` returns a `label`, an `icon`
 * and a `tone` together, and there is no shape it can return with a blank
 * label. A component that renders only the colour is then visibly ignoring two
 * thirds of what it was handed.
 *
 * Nothing here replaces the editor. Milkdown, Crepe and CodeMirror keep the
 * writing surface; these functions decide the chrome around it.
 */

import { componentTokens, space } from '../../../theme/tokens'
import type { ResponsiveValue } from '../../components/layout'

/* -------------------------------------------------------------------------- */
/* Autosave                                                                   */
/* -------------------------------------------------------------------------- */

export type AutosaveStatus =
  /** The backend refused the save. The draft is kept locally. */
  | 'permissionLost'
  /** No connection. A retry now would fail the same way. */
  | 'offline'
  /** A save is in flight. */
  | 'saving'
  /** The last save was rejected for a reason the author can act on. */
  | 'failed'
  /** Edits exist that no save has covered yet. */
  | 'unsaved'
  /** Everything typed is on the server. */
  | 'saved'
  /** Nothing has been typed yet. */
  | 'idle'

/** Icon names, resolved to components by the component layer. */
export type AutosaveIcon = 'saving' | 'saved' | 'warning' | 'error' | 'offline' | 'pending'

export interface AutosaveStateInput {
  /** The backend answered 403. The strongest state there is. */
  readonly permissionLost?: boolean
  readonly isOffline?: boolean
  readonly isSaving?: boolean
  /** Why the last save failed. Its presence means failed. */
  readonly error?: string
  /** Edits since the last successful save. */
  readonly hasUnsavedChanges?: boolean
  /** When the last successful save landed. */
  readonly lastSavedLabel?: string
}

export interface AutosaveStateOutput {
  readonly status: AutosaveStatus
  /**
   * The state in words. Never blank - which is what makes it impossible to
   * ship a workspace whose save state is a coloured dot.
   */
  readonly label: string
  /** A second channel, so the state survives greyscale. */
  readonly icon: AutosaveIcon
  readonly tone: 'neutral' | 'progress' | 'success' | 'warning' | 'danger'
  /** The token the component paints with. Never a colour literal. */
  readonly color: string
  /** One sentence of context, when there is something worth adding. */
  readonly detail?: string
  /** Whether a screen reader should be interrupted. Only for lost work. */
  readonly interrupts: boolean
  /** Whether the author's own work is at risk right now. */
  readonly isAtRisk: boolean
}

/**
 * Which single state the autosave indicator is in.
 *
 * Precedence, strongest first: permission lost, offline, saving, failed,
 * unsaved, saved, idle.
 *
 * Permission loss is first because it is the only state where the author's work
 * will never reach the server without them doing something outside this page,
 * and where continuing to type produces more unsaved work every second. Offline
 * comes next for the same reason with a different remedy. Saving beats failed
 * because a save already in flight may well succeed and leaving the previous
 * failure up reads as if this attempt had failed too. `unsaved` beats `saved`
 * because the moment a key is pressed the "saved" claim is no longer true.
 */
export function autosaveState({
  permissionLost = false,
  isOffline = false,
  isSaving = false,
  error,
  hasUnsavedChanges = false,
  lastSavedLabel,
}: AutosaveStateInput): AutosaveStateOutput {
  const workspace = componentTokens.workspace

  if (permissionLost) {
    return {
      status: 'permissionLost',
      label: 'Not saved - your access changed',
      icon: 'warning',
      tone: 'danger',
      color: workspace.autosaveFailed,
      detail:
        'Your draft is kept in this browser. Copy it somewhere safe before you close the tab.',
      interrupts: true,
      isAtRisk: true,
    }
  }

  if (isOffline) {
    return {
      status: 'offline',
      label: 'Not saved - you are offline',
      icon: 'offline',
      tone: 'warning',
      color: workspace.autosaveFailed,
      detail: 'Saving will resume on its own when the connection comes back.',
      interrupts: true,
      isAtRisk: true,
    }
  }

  if (isSaving) {
    return {
      status: 'saving',
      label: 'Saving your draft',
      icon: 'saving',
      tone: 'progress',
      color: workspace.autosaveSaving,
      interrupts: false,
      isAtRisk: false,
    }
  }

  if (error !== undefined) {
    return {
      status: 'failed',
      label: 'We could not save your draft',
      icon: 'error',
      tone: 'danger',
      color: workspace.autosaveFailed,
      detail: error,
      interrupts: true,
      isAtRisk: true,
    }
  }

  if (hasUnsavedChanges) {
    return {
      status: 'unsaved',
      label: 'Unsaved changes',
      icon: 'pending',
      tone: 'neutral',
      color: workspace.autosaveIdle,
      interrupts: false,
      isAtRisk: false,
    }
  }

  if (lastSavedLabel !== undefined) {
    return {
      status: 'saved',
      label: `Draft saved ${lastSavedLabel}`,
      icon: 'saved',
      tone: 'success',
      color: workspace.autosaveSaved,
      interrupts: false,
      isAtRisk: false,
    }
  }

  return {
    status: 'idle',
    label: 'Draft',
    icon: 'pending',
    tone: 'neutral',
    color: workspace.autosaveIdle,
    interrupts: false,
    isAtRisk: false,
  }
}

/* -------------------------------------------------------------------------- */
/* Draft recovery                                                             */
/* -------------------------------------------------------------------------- */

export interface DraftRecoveryInput {
  /** When the browser-local backup was written. Epoch milliseconds. */
  readonly localSavedAt?: number
  /** When the server copy was last saved. Epoch milliseconds. */
  readonly serverSavedAt?: number
  /** Ignore a local copy that is this much older than the server's. */
  readonly toleranceMs?: number
}

export interface DraftRecoveryOutput {
  /** Whether to offer the choice at all. */
  readonly offersRecovery: boolean
  readonly headline: string | null
  readonly detail: string | null
}

/**
 * Whether a locally kept draft is worth offering back.
 *
 * Only when it is genuinely newer than the server copy. Offering an older
 * backup invites the author to overwrite good work with stale work, and a
 * prompt that appears every time the page loads gets dismissed reflexively -
 * including the one time it mattered.
 *
 * The tolerance exists because the two clocks are different: the local
 * timestamp comes from the browser and the server one from the API, so a few
 * seconds of skew must not look like a newer draft.
 */
export function draftRecovery({
  localSavedAt,
  serverSavedAt,
  toleranceMs = 2000,
}: DraftRecoveryInput): DraftRecoveryOutput {
  const none: DraftRecoveryOutput = { offersRecovery: false, headline: null, detail: null }

  if (localSavedAt === undefined) {
    return none
  }

  if (serverSavedAt !== undefined && localSavedAt <= serverSavedAt + toleranceMs) {
    return none
  }

  return {
    offersRecovery: true,
    headline: 'We found a newer draft kept in this browser',
    detail:
      serverSavedAt === undefined
        ? 'It was never saved to your account. Restore it, or discard it and start from what is here.'
        : 'It is newer than the copy on your account. Restore it, or keep the saved version.',
  }
}

/* -------------------------------------------------------------------------- */
/* Workspace layout                                                           */
/* -------------------------------------------------------------------------- */

export type WorkspaceMode = 'write' | 'preview' | 'split'

export const workspaceModes: readonly WorkspaceMode[] = ['write', 'preview', 'split']

export interface WorkspaceLayout {
  readonly templateColumns: ResponsiveValue<string>
  /** Whether the writing surface is mounted. */
  readonly showsEditor: boolean
  /** Whether the rendered preview is mounted. */
  readonly showsPreview: boolean
  /**
   * True when `split` has been folded into a single column because the viewport
   * is too narrow for two. Both panes are still shown, stacked.
   */
  readonly stacksBelowColumns: boolean
}

/**
 * How the two panes are arranged.
 *
 * `split` is two columns above the `columns` breakpoint (801px) and one column
 * below it. It stacks rather than dropping a pane: a 375px screen that silently
 * hid the preview would leave the author looking at a mode selector whose
 * chosen mode is not what they can see.
 *
 * Neither pane is unmounted when the other is showing in `write` or `preview` -
 * that is the caller's decision, and for the real editor it must not be, because
 * unmounting Crepe destroys its undo history. `showsEditor` and `showsPreview`
 * say which pane is *visible*; the shell keeps both mounted and hides one.
 */
export function workspaceLayout(mode: WorkspaceMode): WorkspaceLayout {
  const single = { base: 'minmax(0, 1fr)' }

  if (mode === 'split') {
    return {
      templateColumns: { base: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
      showsEditor: true,
      showsPreview: true,
      stacksBelowColumns: true,
    }
  }

  return {
    templateColumns: single,
    showsEditor: mode === 'write',
    showsPreview: mode === 'preview',
    stacksBelowColumns: false,
  }
}

/** The vertical rhythm between toolbar, surface and footer. */
export function workspaceGap(): string {
  return space[4]
}

/* -------------------------------------------------------------------------- */
/* Tags                                                                       */
/* -------------------------------------------------------------------------- */

export interface TagAddInput {
  readonly tags: readonly string[]
  readonly candidate: string
  readonly maxTags?: number
  readonly maxLength?: number
}

export interface TagAddOutput {
  readonly tags: readonly string[]
  /** Why the candidate was refused, or `null` when it was accepted. */
  readonly rejection: string | null
  /** Whether the input should be cleared. True on success and on a duplicate. */
  readonly clearsInput: boolean
}

/** Collapse whitespace and trim. Case is the author's, not ours. */
export function normalizeTag(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

/**
 * Add one tag, or say why not.
 *
 * A duplicate clears the input without an error: the author asked for a tag
 * that is already there, they got it, and an error message for a request that
 * was already satisfied is noise. A tag over the limit does not clear, so the
 * text they typed is still there to shorten.
 */
export function addTag({
  tags,
  candidate,
  maxTags = 0,
  maxLength = 32,
}: TagAddInput): TagAddOutput {
  const normalized = normalizeTag(candidate)

  if (normalized.length === 0) {
    return { tags, rejection: null, clearsInput: false }
  }

  if (tags.some((tag) => tag.toLowerCase() === normalized.toLowerCase())) {
    return { tags, rejection: null, clearsInput: true }
  }

  if (normalized.length > maxLength) {
    return {
      tags,
      rejection: `Tags are at most ${maxLength} characters. Shorten this one.`,
      clearsInput: false,
    }
  }

  if (maxTags > 0 && tags.length >= maxTags) {
    return {
      tags,
      rejection: `You can use up to ${maxTags} tags. Remove one before adding another.`,
      clearsInput: false,
    }
  }

  return { tags: [...tags, normalized], rejection: null, clearsInput: true }
}

export function removeTag(tags: readonly string[], tag: string): readonly string[] {
  return tags.filter((existing) => existing !== tag)
}

/* -------------------------------------------------------------------------- */
/* Media uploads                                                              */
/* -------------------------------------------------------------------------- */

export type UploadStatus = 'idle' | 'uploading' | 'ready' | 'failed' | 'denied' | 'blocked'

export interface UploadStateInput {
  readonly isUploading?: boolean
  /** Why the upload failed. Its presence means failed. */
  readonly error?: string
  /** A verb phrase: "add images to this post". Its presence means denied. */
  readonly deniedAction?: string
  /** A file exists on the post. */
  readonly hasMedia?: boolean
  /**
   * The upload needs a post id and there is not one yet - the editor's real
   * constraint, since media is attached to a saved draft.
   */
  readonly requiresSavedDraft?: boolean
}

export interface UploadStateOutput {
  readonly status: UploadStatus
  readonly label: string
  readonly canChoose: boolean
  readonly canRemove: boolean
  /** Whether a second attempt against the same file could succeed. */
  readonly canRetry: boolean
}

/**
 * Which single state a media control is in.
 *
 * Precedence, strongest first: denied, blocked on an unsaved draft, uploading,
 * failed, has media, idle.
 *
 * `blocked` is the state the legacy editor reports as an exception ("Save draft
 * first before uploading images"). It is a real, recoverable precondition, so
 * it is a state with copy rather than an error thrown at the moment of upload.
 */
export function uploadState({
  isUploading = false,
  error,
  deniedAction,
  hasMedia = false,
  requiresSavedDraft = false,
}: UploadStateInput): UploadStateOutput {
  if (deniedAction !== undefined) {
    return {
      status: 'denied',
      label: `You do not have permission to ${deniedAction}.`,
      canChoose: false,
      canRemove: false,
      canRetry: false,
    }
  }

  if (requiresSavedDraft) {
    return {
      status: 'blocked',
      label: 'Save the draft once before adding an image.',
      canChoose: false,
      canRemove: false,
      canRetry: false,
    }
  }

  if (isUploading) {
    return {
      status: 'uploading',
      label: 'Uploading your image',
      canChoose: false,
      canRemove: false,
      canRetry: false,
    }
  }

  if (error !== undefined) {
    return { status: 'failed', label: error, canChoose: true, canRemove: hasMedia, canRetry: true }
  }

  if (hasMedia) {
    return {
      status: 'ready',
      label: 'Image added',
      canChoose: true,
      canRemove: true,
      canRetry: false,
    }
  }

  return {
    status: 'idle',
    label: 'No image yet',
    canChoose: true,
    canRemove: false,
    canRetry: false,
  }
}
