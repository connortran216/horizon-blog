/**
 * Horizon Design System v2 - feedback decisions.
 *
 * Everything a feedback surface decides lives here: which live region it is,
 * which tone tokens it wears, what its copy says, and whether a retry is still
 * available. The components below are then arrangement only.
 *
 * Two rules from the design contract are enforced rather than documented:
 *
 * - Live regions are polite. Nothing in this system interrupts a reader, so
 *   `liveRegionFor` has no branch that can return `assertive`.
 * - Copy names the task or the failed action. The builders take the task as a
 *   required argument and reject a blank one, which is why "Something went
 *   wrong" cannot be produced by this module at all.
 */

import { componentTokens, space } from '../../../theme/tokens'
import type { SemanticColorToken } from '../../../theme/tokens'

export type FeedbackTone =
  | 'loading'
  | 'empty'
  | 'error'
  | 'permission'
  | 'missing'
  | 'offline'
  | 'success'

export const feedbackTones: readonly FeedbackTone[] = [
  'loading',
  'empty',
  'error',
  'permission',
  'missing',
  'offline',
  'success',
]

/* -------------------------------------------------------------------------- */
/* Live regions                                                               */
/* -------------------------------------------------------------------------- */

export interface LiveRegionAttributes {
  readonly role: 'status'
  readonly 'aria-live': 'polite'
  readonly 'aria-atomic': true
  readonly 'aria-busy'?: true
}

/**
 * A feedback surface always replaces something that was, or was about to be,
 * loading - so it is always a status region, and it is always polite. `aria-busy`
 * marks the one tone where the outcome has not arrived yet, so assistive
 * technology can say "busy" instead of reading a placeholder as the answer.
 */
export function liveRegionFor(tone: FeedbackTone): LiveRegionAttributes {
  const base = {
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': true,
  } as const

  return tone === 'loading' ? { ...base, 'aria-busy': true } : base
}

/* -------------------------------------------------------------------------- */
/* Tone tokens                                                                */
/* -------------------------------------------------------------------------- */

export interface FeedbackToneTokens {
  readonly bg: SemanticColorToken
  readonly fg: SemanticColorToken
}

const { feedback } = componentTokens

/**
 * Danger for a failure, warning for a state the reader can act on but did not
 * cause, neutral for absence. Absence is not an error and must not be dressed
 * as one - an empty archive in red reads as a bug report.
 */
const toneTokens: Record<FeedbackTone, FeedbackToneTokens> = {
  loading: { bg: feedback.neutralBg, fg: feedback.neutralFg },
  empty: { bg: feedback.neutralBg, fg: feedback.neutralFg },
  missing: { bg: feedback.neutralBg, fg: feedback.neutralFg },
  error: { bg: feedback.dangerBg, fg: feedback.dangerFg },
  permission: { bg: feedback.warningBg, fg: feedback.warningFg },
  offline: { bg: feedback.warningBg, fg: feedback.warningFg },
  success: { bg: feedback.successBg, fg: feedback.successFg },
}

export function feedbackToneTokens(tone: FeedbackTone): FeedbackToneTokens {
  return toneTokens[tone]
}

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Phrases this system refuses to ship. They are checked in the test rather than
 * at runtime, because the real guarantee is structural: the builders below have
 * no code path that produces a message without the caller's own words in it.
 */
export const vagueFailurePhrases: readonly string[] = [
  'something went wrong',
  'an error occurred',
  'unexpected error',
  'unknown error',
  'oops',
  'try again later',
]

/**
 * A feedback surface with no subject is a blank surface with padding. Rejecting
 * the blank argument is how "no async surface may render blank" is enforced at
 * the one place every surface passes through.
 */
export function namedSubject(value: string, field: string): string {
  const trimmed = value?.trim() ?? ''

  if (trimmed.length === 0) {
    throw new TypeError(`Feedback needs a ${field}: it names what the reader is waiting for.`)
  }

  return trimmed
}

/** `task` reads as a noun phrase: "the article", "your drafts". */
export function loadingMessage(task: string): string {
  return `Loading ${namedSubject(task, 'task')}`
}

/** `failedAction` reads as a verb phrase: "load the article", "save your draft". */
export function failureMessage(failedAction: string): string {
  return `We could not ${namedSubject(failedAction, 'failed action')}.`
}

export function retryLabel(failedAction: string): string {
  return `Try to ${namedSubject(failedAction, 'failed action')} again`
}

export function retryingMessage(failedAction: string): string {
  return `Trying to ${namedSubject(failedAction, 'failed action')} again`
}

export function emptyMessage(subject: string): string {
  return `No ${namedSubject(subject, 'subject')} yet.`
}

export function permissionMessage(deniedAction: string): string {
  return `You do not have permission to ${namedSubject(deniedAction, 'denied action')}.`
}

export function missingMessage(subject: string): string {
  return `We could not find ${namedSubject(subject, 'subject')}.`
}

export function offlineMessage(task: string): string {
  return `You are offline, so we cannot ${namedSubject(task, 'task')} right now.`
}

export function successMessage(completedAction: string): string {
  return `Done: ${namedSubject(completedAction, 'completed action')}.`
}

/* -------------------------------------------------------------------------- */
/* Retry                                                                      */
/* -------------------------------------------------------------------------- */

export interface RetryStatus {
  /** Retries already spent. Zero before the first retry. */
  readonly attempt: number
  /** Zero means unlimited manual retries. */
  readonly maxAttempts: number
}

export function retryAvailable({ attempt, maxAttempts }: RetryStatus): boolean {
  return maxAttempts <= 0 || attempt < maxAttempts
}

/**
 * Progress text, or `null` when there is nothing worth saying. The first
 * attempt gets no counter: "Attempt 0 of 3" is noise on a button nobody has
 * pressed yet.
 */
export function retryHint({ attempt, maxAttempts }: RetryStatus): string | null {
  if (maxAttempts <= 0 || attempt <= 0) {
    return null
  }

  return `Attempt ${Math.min(attempt, maxAttempts)} of ${maxAttempts}`
}

/* -------------------------------------------------------------------------- */
/* Loading scope                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Route loading is not content loading. A blocked route reserves the viewport
 * because there is no layout yet to preserve; a blocked panel reserves its own
 * region; inline feedback reserves nothing and must not push text around.
 * Skeletons are the fourth case and live in `Skeleton.logic.ts`, because they
 * are the only one that knows the shape of the content it is standing in for.
 */
export type LoadingScope = 'route' | 'panel' | 'inline'

export interface LoadingLayout {
  readonly minHeight: string
  readonly gap: string
  readonly spinnerSize: 'sm' | 'md' | 'lg'
  readonly textStyle: 'body' | 'meta'
  /** Whether the surface occupies its region until the data lands. */
  readonly blocking: boolean
}

const loadingLayouts: Record<LoadingScope, LoadingLayout> = {
  route: {
    minHeight: '60vh',
    gap: space[4],
    spinnerSize: 'lg',
    textStyle: 'body',
    blocking: true,
  },
  panel: {
    minHeight: space[24],
    gap: space[3],
    spinnerSize: 'md',
    textStyle: 'body',
    blocking: true,
  },
  inline: {
    minHeight: 'auto',
    gap: space[2],
    spinnerSize: 'sm',
    textStyle: 'meta',
    blocking: false,
  },
}

export function loadingLayoutFor(scope: LoadingScope): LoadingLayout {
  return loadingLayouts[scope]
}
