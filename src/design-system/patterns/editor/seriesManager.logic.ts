/**
 * Horizon Design System v2 - the Series management form's decisions.
 *
 * `ManageSeriesItem` and the reorder helpers in `patterns/series` cover one row
 * and the arithmetic of moving it. This module covers the surface around them:
 * the identity fields, adding a blog, saving, and deleting.
 *
 * It lives in the editor area rather than the Series area because it is a
 * workspace, not a reading surface. Everything here is about the same question
 * the rest of this area answers - does the author know, right now, whether what
 * they changed is on the server? - and the answers are shaped like
 * `workspace.logic`'s: one status at a time, with a label, an icon and a tone
 * that are decided together so no component can ship a coloured dot.
 *
 * Two claims are structural here rather than conventional:
 *
 * - `seriesFormState` has no branch that returns a blank label, and every
 *   status has its own icon, so a save that is in flight, one that failed and
 *   one that landed are three different words and three different shapes.
 * - `seriesDeleteState.reportsRemoved` is true in exactly one branch: the one
 *   where the server has confirmed the deletion. An in-flight delete never
 *   reports the Series as gone. `horizon-blog-dsv2.6.3` acceptance 3 -
 *   destructive actions retain backend authority - is that single branch.
 */

import { componentTokens } from '../../../theme/tokens'
import type { DestructiveCopyInput } from '../data/permission.logic'
import { orderIsDirty, type ManagedSeriesPart } from '../series/series.logic'

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

/** One blog the author owns, as the add control and the rows need it. */
export interface SeriesBlogOption {
  /** The post id, as a string. Stable key, and the `select` value. */
  readonly id: string
  readonly title: string
  readonly status: ManagedSeriesPart['status']
}

/** What the server last confirmed. The baseline every dirty check is against. */
export interface SeriesFormValues {
  readonly title: string
  readonly description: string
  /** The order the server holds, by post id. */
  readonly partIds: readonly string[]
}

/* -------------------------------------------------------------------------- */
/* Unsaved changes                                                            */
/* -------------------------------------------------------------------------- */

export interface SeriesFormDirty {
  readonly title: boolean
  readonly description: boolean
  readonly order: boolean
  /** Any of the three. What the save button and the status line ask for. */
  readonly any: boolean
}

/**
 * What has changed since the server last answered.
 *
 * Compared exactly, not trimmed: a trailing space is what the server will
 * store, so calling it "not a change" would leave the author looking at a form
 * that refuses to save something they can see is different.
 *
 * The order reuses `orderIsDirty` from `patterns/series` rather than comparing
 * again here. Two implementations of "is this the same order" drift, and the
 * one that drifts is the one that decides whether the author is warned.
 */
export function seriesFormDirty(saved: SeriesFormValues, draft: SeriesFormValues): SeriesFormDirty {
  const title = saved.title !== draft.title
  const description = saved.description !== draft.description
  const order = orderIsDirty(saved.partIds, draft.partIds)

  return { title, description, order, any: title || description || order }
}

export interface SeriesSaveRequest {
  /** The identity fields, or `null` when neither changed. */
  readonly identity: { readonly title: string; readonly description: string } | null
  /** The complete order, or `null` when it did not change. */
  readonly partIds: readonly string[] | null
}

/**
 * Which requests a save actually has to make.
 *
 * The API replaces identity and order separately, so a form that always sent
 * both would replace the whole order every time an author fixed a typo in the
 * description - and would turn one failed request into two.
 */
export function seriesSaveRequest(
  saved: SeriesFormValues,
  draft: SeriesFormValues,
): SeriesSaveRequest {
  const dirty = seriesFormDirty(saved, draft)

  return {
    identity:
      dirty.title || dirty.description
        ? { title: draft.title, description: draft.description }
        : null,
    partIds: dirty.order ? draft.partIds : null,
  }
}

/* -------------------------------------------------------------------------- */
/* Form state                                                                 */
/* -------------------------------------------------------------------------- */

export type SeriesFormStatus =
  /** The backend refused this Series. Edits stay on screen, unsaved. */
  | 'permissionLost'
  /** The Series has not arrived yet. */
  | 'loading'
  /** A delete is in flight. Nothing is gone until the server says so. */
  | 'deleting'
  /** A save is in flight. */
  | 'saving'
  /** The last save was rejected. */
  | 'saveFailed'
  /** The server refused the delete. The Series is still here. */
  | 'deleteDenied'
  /** Edits exist that no save has covered. */
  | 'unsaved'
  /** Saved, and there is nothing in it. */
  | 'emptySeries'
  /** Everything on screen is on the server. */
  | 'saved'
  /** Nothing has been touched yet. */
  | 'idle'

/** Icon names, resolved to components by the component layer. */
export type SeriesFormIcon =
  | 'loading'
  | 'saving'
  | 'saved'
  | 'pending'
  | 'empty'
  | 'error'
  | 'warning'
  | 'denied'
  | 'deleting'
  | 'series'

export type SeriesFormTone = 'neutral' | 'progress' | 'success' | 'warning' | 'danger'

export interface SeriesFormStateInput {
  /** A verb phrase: "edit this Series". The server refused it. */
  readonly deniedAction?: string
  readonly isLoading?: boolean
  readonly isDeleting?: boolean
  readonly isSaving?: boolean
  /** Why the last save failed. Its presence means failed. */
  readonly saveError?: string
  /** A verb phrase the server refused for the delete: "delete this Series". */
  readonly deleteDeniedAction?: string
  readonly isDirty?: boolean
  /** The order differs from the saved one. Said out loud when it does. */
  readonly hasDirtyOrder?: boolean
  readonly partCount?: number
  /** When the last successful save landed. Only ever set by a server answer. */
  readonly lastSavedLabel?: string
}

export interface SeriesFormStateOutput {
  readonly status: SeriesFormStatus
  /** The state in words. Never blank, in any branch. */
  readonly label: string
  /** A second channel, so the state survives greyscale. */
  readonly icon: SeriesFormIcon
  readonly tone: SeriesFormTone
  /** The token the component paints with. Never a colour literal. */
  readonly color: string
  /** One sentence of context, when there is something worth adding. */
  readonly detail?: string
  /** Whether a screen reader should be interrupted. */
  readonly interrupts: boolean
  /** Whether changes the author can see are not on the server. */
  readonly isAtRisk: boolean
  /** Whether the fields should stop accepting edits. */
  readonly isReadOnly: boolean
}

/** Tone to token. The five tones this area already uses, and nothing else. */
function seriesToneColor(tone: SeriesFormTone): string {
  const workspace = componentTokens.workspace

  switch (tone) {
    case 'progress':
      return workspace.autosaveSaving
    case 'success':
      return workspace.autosaveSaved
    case 'warning':
      return componentTokens.feedback.warningFg
    case 'danger':
      return workspace.autosaveFailed
    default:
      return workspace.autosaveIdle
  }
}

/**
 * Which single state the form is in.
 *
 * Precedence, strongest first: permission lost, loading, deleting, saving, save
 * failed, delete denied, unsaved, empty, saved, idle.
 *
 * Permission loss is first for the same reason it is first in `autosaveState`:
 * it is the only state in which nothing the author does on this page can reach
 * the server. Loading is next because every state below it would be a claim
 * about data that has not arrived. A delete in flight outranks a save because
 * it is the one that can take the whole Series with it. A refused delete
 * outranks "unsaved changes" because it is news the author has not heard yet,
 * where unsaved changes are a consequence of what they just did.
 *
 * `emptySeries` sits below `unsaved`, so an author who has just removed the
 * last blog is told their change is unsaved rather than told the Series is
 * empty - the empty state is a fact about the server's copy, not about theirs.
 */
export function seriesFormState({
  deniedAction,
  isLoading = false,
  isDeleting = false,
  isSaving = false,
  saveError,
  deleteDeniedAction,
  isDirty = false,
  hasDirtyOrder = false,
  partCount = 0,
  lastSavedLabel,
}: SeriesFormStateInput): SeriesFormStateOutput {
  // Colour is derived from the tone rather than written per branch, so there is
  // no way to add a state that paints itself something the tone does not mean.
  const state = (output: Omit<SeriesFormStateOutput, 'color'>): SeriesFormStateOutput => ({
    ...output,
    color: seriesToneColor(output.tone),
  })

  if (deniedAction !== undefined) {
    return state({
      status: 'permissionLost',
      label: 'Not saved - your access to this Series changed',
      icon: 'warning',
      tone: 'danger',
      detail: `You do not have permission to ${deniedAction}. Your changes are still on screen; copy anything you need before you leave the page.`,
      interrupts: true,
      isAtRisk: true,
      isReadOnly: true,
    })
  }

  if (isLoading) {
    return state({
      status: 'loading',
      label: 'Loading this Series',
      icon: 'loading',
      tone: 'progress',
      interrupts: false,
      isAtRisk: false,
      isReadOnly: true,
    })
  }

  if (isDeleting) {
    return state({
      status: 'deleting',
      label: 'Deleting this Series',
      icon: 'deleting',
      tone: 'progress',
      detail: 'Nothing is removed until the server confirms it.',
      interrupts: false,
      isAtRisk: false,
      isReadOnly: true,
    })
  }

  if (isSaving) {
    return state({
      status: 'saving',
      label: 'Saving this Series',
      icon: 'saving',
      tone: 'progress',
      detail: 'Your changes are not saved until the server answers.',
      interrupts: false,
      // The author's edits are still only on screen while this is in flight.
      isAtRisk: true,
      isReadOnly: false,
    })
  }

  if (saveError !== undefined) {
    return state({
      status: 'saveFailed',
      label: 'We could not save this Series',
      icon: 'error',
      tone: 'danger',
      detail: saveError,
      interrupts: true,
      isAtRisk: true,
      isReadOnly: false,
    })
  }

  if (deleteDeniedAction !== undefined) {
    return state({
      status: 'deleteDenied',
      label: 'This Series was not deleted',
      icon: 'denied',
      tone: 'warning',
      detail: `You do not have permission to ${deleteDeniedAction}.`,
      interrupts: true,
      isAtRisk: false,
      isReadOnly: false,
    })
  }

  if (isDirty) {
    return state({
      status: 'unsaved',
      // The order is called out by name. A reorder is the change on this form
      // that leaves no trace in a text field, so an author who moves two rows
      // and navigates away has nothing on screen telling them what they lost.
      label: hasDirtyOrder ? 'Unsaved changes, including the order' : 'Unsaved changes',
      icon: 'pending',
      tone: 'warning',
      detail: hasDirtyOrder ? 'Saving replaces the whole order with the one on screen.' : undefined,
      interrupts: false,
      isAtRisk: true,
      isReadOnly: false,
    })
  }

  if (partCount <= 0) {
    return state({
      status: 'emptySeries',
      label: 'This Series has no blogs yet',
      icon: 'empty',
      tone: 'neutral',
      detail: 'Add one of your own blogs below.',
      interrupts: false,
      isAtRisk: false,
      isReadOnly: false,
    })
  }

  if (lastSavedLabel !== undefined) {
    return state({
      status: 'saved',
      label: `Series saved ${lastSavedLabel}`,
      icon: 'saved',
      tone: 'success',
      interrupts: false,
      isAtRisk: false,
      isReadOnly: false,
    })
  }

  return state({
    status: 'idle',
    label: 'No changes yet',
    icon: 'series',
    tone: 'neutral',
    interrupts: false,
    isAtRisk: false,
    isReadOnly: false,
  })
}

/* -------------------------------------------------------------------------- */
/* Saving                                                                     */
/* -------------------------------------------------------------------------- */

export interface SeriesSaveGateInput {
  readonly title: string
  readonly isDirty?: boolean
  readonly isSaving?: boolean
  readonly isDeleting?: boolean
  readonly isLoading?: boolean
  /** A verb phrase the server refused: "edit this Series". */
  readonly deniedAction?: string
}

export interface SeriesSaveGateOutput {
  readonly canSave: boolean
  /** Why the button will not act, or `null`. */
  readonly blockedReason: string | null
  readonly submitLabel: string
  /** Announced while the request is in flight. */
  readonly submittingLabel: string
}

/**
 * Whether the save may fire.
 *
 * `canSave` is false while a save is in flight, and the caller renders the
 * button as loading rather than as disabled - so the control keeps focus, says
 * "Saving this Series", and cannot be pressed a second time. A save that looks
 * finished while the request is still open is the failure this pair prevents.
 *
 * Refusing to save an unchanged form is not tidiness. Saving replaces the whole
 * order, so an accidental press on an untouched form is a write the author did
 * not ask for.
 */
export function seriesSaveGate({
  title,
  isDirty = false,
  isSaving = false,
  isDeleting = false,
  isLoading = false,
  deniedAction,
}: SeriesSaveGateInput): SeriesSaveGateOutput {
  const blockedReason =
    deniedAction !== undefined
      ? `You do not have permission to ${deniedAction}.`
      : isLoading
        ? 'This Series is still loading.'
        : isDeleting
          ? 'This Series is being deleted.'
          : title.trim().length === 0
            ? 'A Series needs a title before it can be saved.'
            : !isDirty
              ? 'Nothing has changed yet.'
              : null

  return {
    canSave: blockedReason === null && !isSaving,
    blockedReason,
    submitLabel: 'Save this Series',
    submittingLabel: 'Saving this Series',
  }
}

/* -------------------------------------------------------------------------- */
/* Deleting                                                                   */
/* -------------------------------------------------------------------------- */

export type SeriesDeleteStatus =
  | 'idle'
  | 'confirming'
  | 'deleting'
  | 'denied'
  | 'failed'
  | 'deleted'

export interface SeriesDeleteStateInput {
  /** The author asked to delete and the confirmation is open. */
  readonly isConfirming?: boolean
  readonly isDeleting?: boolean
  /** A verb phrase the server refused: "delete this Series". */
  readonly deniedAction?: string
  /** Why the delete failed. Its presence means failed. */
  readonly error?: string
  /**
   * The server answered and the Series is gone. The only input that can make
   * `reportsRemoved` true.
   */
  readonly deletedByServer?: boolean
}

export interface SeriesDeleteStateOutput {
  readonly status: SeriesDeleteStatus
  /** Whether the confirmation is on screen. */
  readonly showsConfirmation: boolean
  /** Whether the "Delete this Series" button may open the confirmation. */
  readonly canRequestDelete: boolean
  /** Whether the confirmation's own button may fire. */
  readonly canConfirmDelete: boolean
  /**
   * Whether the caller may stop showing this Series.
   *
   * True in exactly one branch - the server confirmed it. Not while the request
   * is in flight, not after the author confirmed, not when the delete failed.
   */
  readonly reportsRemoved: boolean
  readonly message: string | null
}

export function seriesDeleteState({
  isConfirming = false,
  isDeleting = false,
  deniedAction,
  error,
  deletedByServer = false,
}: SeriesDeleteStateInput): SeriesDeleteStateOutput {
  if (deletedByServer) {
    return {
      status: 'deleted',
      showsConfirmation: false,
      canRequestDelete: false,
      canConfirmDelete: false,
      reportsRemoved: true,
      message: 'This Series was deleted. The blogs that were in it were not.',
    }
  }

  if (deniedAction !== undefined) {
    return {
      status: 'denied',
      showsConfirmation: isConfirming,
      canRequestDelete: false,
      canConfirmDelete: false,
      reportsRemoved: false,
      message: `You do not have permission to ${deniedAction}.`,
    }
  }

  if (isDeleting) {
    return {
      status: 'deleting',
      // The confirmation stays up while the request is open, so the author is
      // looking at the thing they are waiting on rather than at a form that
      // already behaves as though the Series had gone.
      showsConfirmation: true,
      canRequestDelete: false,
      canConfirmDelete: false,
      reportsRemoved: false,
      message: 'Deleting. Nothing is removed until the server confirms it.',
    }
  }

  if (error !== undefined) {
    return {
      status: 'failed',
      // Still open: the author's decision has not changed, only the outcome.
      showsConfirmation: true,
      canRequestDelete: true,
      canConfirmDelete: true,
      reportsRemoved: false,
      message: error,
    }
  }

  if (isConfirming) {
    return {
      status: 'confirming',
      showsConfirmation: true,
      canRequestDelete: true,
      canConfirmDelete: true,
      reportsRemoved: false,
      message: null,
    }
  }

  return {
    status: 'idle',
    showsConfirmation: false,
    canRequestDelete: true,
    canConfirmDelete: false,
    reportsRemoved: false,
    message: null,
  }
}

/**
 * The words on the Series delete confirmation.
 *
 * No typed confirmation and no acknowledgement tick. Deleting a Series removes
 * the Series and its order and leaves every blog where it is, so the work that
 * is lost is one grouping the author can rebuild - and a confirmation everybody
 * has to fight is one they learn to click through.
 */
export function seriesDeleteCopy(title: string): DestructiveCopyInput {
  const named = title.trim().length > 0 ? title.trim() : 'This Series'

  return {
    action: 'Delete this Series',
    subject: named,
    consequence:
      'The blogs in it stay exactly where they are. Only the Series and its order are removed.',
    isReversible: false,
  }
}

/* -------------------------------------------------------------------------- */
/* Adding a blog                                                              */
/* -------------------------------------------------------------------------- */

export interface AddableBlogsInput {
  readonly options: readonly SeriesBlogOption[]
  /** The order on screen, by post id. */
  readonly partIds: readonly string[]
  /** Post id to the id of the Series that already holds it. */
  readonly assignedSeriesByPartId?: ReadonlyMap<string, string>
  readonly seriesId: string
}

/**
 * The blogs this Series can still take.
 *
 * A blog belongs to one Series, so anything held by another one is not offered
 * - offering it would produce a choice that always fails. A blog this Series
 * already holds is not offered either, which is what makes the duplicate
 * rejection below a guard against a stale list rather than the everyday path.
 */
export function addableBlogOptions({
  options,
  partIds,
  assignedSeriesByPartId,
  seriesId,
}: AddableBlogsInput): SeriesBlogOption[] {
  const inSeries = new Set(partIds)

  return options.filter((option) => {
    if (inSeries.has(option.id)) {
      return false
    }

    const owner = assignedSeriesByPartId?.get(option.id)

    return owner === undefined || owner === seriesId
  })
}

export interface AddBlogInput extends AddableBlogsInput {
  /** The `select` value. Empty when nothing is chosen. */
  readonly candidateId: string
}

export interface AddBlogOutput {
  readonly partIds: readonly string[]
  /** Why the blog was refused, or `null` when it was accepted. */
  readonly rejection: string | null
  /** Whether the select should return to "Choose a blog". */
  readonly clearsSelection: boolean
}

/**
 * Add one blog to the end of the order, or say why not.
 *
 * A duplicate clears the selection and says so. The tag field's rule - a
 * duplicate is silently satisfied - does not transfer: there the author can see
 * the tag they asked for sitting in the list beside the input, and here the
 * blog they picked may be twenty rows up and out of sight, so silence would
 * read as a control that did nothing.
 *
 * A blog held by another Series does not clear the selection: the name stays in
 * the control that the message is about.
 */
export function addBlogToSeries({
  options,
  partIds,
  assignedSeriesByPartId,
  seriesId,
  candidateId,
}: AddBlogInput): AddBlogOutput {
  const id = candidateId.trim()

  if (id.length === 0) {
    return { partIds, rejection: null, clearsSelection: false }
  }

  const option = options.find((candidate) => candidate.id === id)
  const named = option?.title ?? 'That blog'

  if (partIds.includes(id)) {
    return {
      partIds,
      rejection: `${named} is already in this Series.`,
      clearsSelection: true,
    }
  }

  if (option === undefined) {
    return {
      partIds,
      rejection: 'Choose one of your own blogs.',
      clearsSelection: false,
    }
  }

  const owner = assignedSeriesByPartId?.get(id)

  if (owner !== undefined && owner !== seriesId) {
    return {
      partIds,
      rejection: `${named} already belongs to another Series. Remove it there first.`,
      clearsSelection: false,
    }
  }

  return { partIds: [...partIds, id], rejection: null, clearsSelection: true }
}

export type AddBlogFieldStatus = 'denied' | 'loading' | 'failed' | 'empty' | 'ready'

export interface AddBlogFieldInput {
  readonly isLoading?: boolean
  /** Why the list of blogs could not be loaded. Its presence means failed. */
  readonly error?: string
  /** A verb phrase the server refused: "change this Series". */
  readonly deniedAction?: string
  readonly addableCount?: number
}

export interface AddBlogFieldOutput {
  readonly status: AddBlogFieldStatus
  /** What to say under the control. Never blank. */
  readonly label: string
  readonly canChoose: boolean
  /** Whether a second attempt at loading the list could succeed. */
  readonly canRetry: boolean
}

/**
 * Which single state the add control is in.
 *
 * Precedence: denied, loading, failed, nothing left to add, ready. Every branch
 * carries a sentence, because a disabled select with no explanation is a dead
 * end - and three of these four disabled branches have entirely different
 * remedies.
 */
export function addBlogFieldState({
  isLoading = false,
  error,
  deniedAction,
  addableCount = 0,
}: AddBlogFieldInput): AddBlogFieldOutput {
  if (deniedAction !== undefined) {
    return {
      status: 'denied',
      label: `You do not have permission to ${deniedAction}.`,
      canChoose: false,
      canRetry: false,
    }
  }

  if (isLoading) {
    return {
      status: 'loading',
      label: 'Loading the blogs you own',
      canChoose: false,
      canRetry: false,
    }
  }

  if (error !== undefined) {
    return { status: 'failed', label: error, canChoose: false, canRetry: true }
  }

  if (addableCount <= 0) {
    return {
      status: 'empty',
      label: 'Every blog you own already belongs to a Series.',
      canChoose: false,
      canRetry: false,
    }
  }

  return {
    status: 'ready',
    label: 'Each blog belongs to one Series. Saving replaces the whole order.',
    canChoose: true,
    canRetry: false,
  }
}

/* -------------------------------------------------------------------------- */
/* Rows                                                                       */
/* -------------------------------------------------------------------------- */

export interface ResolvePartsInput {
  readonly partIds: readonly string[]
  readonly options: readonly SeriesBlogOption[]
  /** What the Series itself reported, for ids the options list does not cover. */
  readonly fallbacks?: readonly ManagedSeriesPart[]
}

/**
 * The rows, in the order on screen.
 *
 * An id with no matching option is still rendered. The list of owned blogs is
 * paged and can be incomplete, and dropping a row because its title has not
 * arrived would silently change the order the author is about to save.
 */
export function resolveSeriesParts({
  partIds,
  options,
  fallbacks = [],
}: ResolvePartsInput): ManagedSeriesPart[] {
  const byId = new Map(options.map((option) => [option.id, option]))
  const fallbackById = new Map(fallbacks.map((part) => [part.id, part]))

  return partIds.map((id) => {
    const option = byId.get(id)

    if (option !== undefined) {
      return { id, title: option.title, status: option.status }
    }

    const fallback = fallbackById.get(id)

    return fallback ?? { id, title: `Blog ${id}`, status: 'draft' }
  })
}
