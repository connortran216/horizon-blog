/**
 * Horizon Design System v2 - reader feedback.
 *
 * A reaction and a share, both of which change something outside the page, and
 * both of which therefore have a permission state, a pending state and a
 * failure state that the reader has to be able to tell apart.
 *
 * The reaction is a toggle, so it is a real `button` carrying `aria-pressed`.
 * The count beside it is not the label: "24" tells a screen reader nothing
 * about what it is counting, so the accessible name says both the action and
 * the number, and the visible digits are hidden from the accessibility tree.
 */

import { pluralise } from '../posts/content.logic'
import { copyReducer, type CopyEvent, type CopyState, type CopyStatus } from './code.logic'

/* -------------------------------------------------------------------------- */
/* Reactions                                                                  */
/* -------------------------------------------------------------------------- */

export interface ReactionInput {
  readonly count: number
  readonly viewerHasReacted: boolean
  /** False for a signed-out reader, or where the API refuses reactions. */
  readonly canReact: boolean
  readonly isLoading?: boolean
}

export interface ReactionButtonState {
  readonly 'aria-label': string
  readonly 'aria-pressed': boolean
  readonly isDisabled: boolean
  readonly isLoading: boolean
  /** The digits on the button. Hidden from the accessibility tree. */
  readonly countLabel: string
  /** The same number in words, inside the accessible name. */
  readonly countAnnouncement: string
  readonly isFilled: boolean
}

/**
 * A reaction toggle that a reader may not be able to use.
 *
 * Disabled rather than hidden: a signed-out reader should be able to see that
 * an article has 24 hearts, and removing the control removes the count with it.
 */
export function reactionButtonState({
  count,
  viewerHasReacted,
  canReact,
  isLoading = false,
}: ReactionInput): ReactionButtonState {
  const safeCount = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0))
  const action = viewerHasReacted ? 'Remove your reaction from' : 'React to'

  return {
    'aria-label': `${action} this blog, ${pluralise(safeCount, 'reaction')} so far`,
    'aria-pressed': viewerHasReacted,
    isDisabled: !canReact,
    isLoading,
    countLabel: String(safeCount),
    countAnnouncement: pluralise(safeCount, 'reaction'),
    isFilled: viewerHasReacted,
  }
}

/** Why the control is dead, for a reader who can see it but not press it. */
export function reactionUnavailableNotice(isAuthenticated: boolean): string {
  return isAuthenticated
    ? 'Reactions are unavailable for this blog.'
    : 'Sign in to react to this blog.'
}

/* -------------------------------------------------------------------------- */
/* Sharing                                                                    */
/* -------------------------------------------------------------------------- */

export type ShareMethod = 'facebook' | 'x' | 'linkedin' | 'copy_link'

export interface ShareTarget {
  readonly method: ShareMethod
  readonly label: string
  /** True for the one target that acts on this page rather than leaving it. */
  readonly isLocal: boolean
}

/**
 * The share targets, in the order the production API already accepts. Copy link
 * is last and is the only local one - the other three hand the reader to
 * another site, and grouping them apart is what makes that predictable.
 */
export function shareTargets(): ShareTarget[] {
  return [
    { method: 'facebook', label: 'Share on Facebook', isLocal: false },
    { method: 'x', label: 'Share on X', isLocal: false },
    { method: 'linkedin', label: 'Share on LinkedIn', isLocal: false },
    { method: 'copy_link', label: 'Copy the link', isLocal: true },
  ]
}

export type ShareState = CopyState
export type ShareEvent = CopyEvent
export type ShareStatus = CopyStatus

export const idleShareState: ShareState = { status: 'idle' }

/**
 * Copying a share link is the same three-state problem as copying a code block
 * - in flight, done, refused - so it is the same reducer rather than a second
 * one that will drift from it.
 */
export function shareReducer(state: ShareState, event: ShareEvent): ShareState {
  return copyReducer(state, event)
}

export function shareAnnouncement(status: ShareStatus): string | null {
  switch (status) {
    case 'copied':
      return 'The link to this blog is on your clipboard'
    case 'failed':
      return 'We could not copy the link. Select the address bar to copy it by hand.'
    default:
      return null
  }
}

/** A failure interrupts; a success does not. */
export function shareLiveRegion(status: ShareStatus): {
  readonly role: 'status' | 'alert'
  readonly 'aria-live': 'polite' | 'assertive'
} {
  return status === 'failed'
    ? { role: 'alert', 'aria-live': 'assertive' }
    : { role: 'status', 'aria-live': 'polite' }
}

/**
 * The href for a target that leaves the site, or `null` for the local one.
 *
 * The URL is encoded once, here, so a title containing an ampersand cannot
 * truncate the share text on one network and not another.
 */
export function shareHref(method: ShareMethod, url: string, title: string): string | null {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  switch (method) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    case 'x':
      return `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    default:
      return null
  }
}
