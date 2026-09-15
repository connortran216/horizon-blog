export type CopyStatus = 'idle' | 'copying' | 'copied' | 'failed'

export interface CopyState {
  readonly status: CopyStatus
}

export type CopyEvent =
  | { readonly type: 'copy' }
  | { readonly type: 'succeeded' }
  | { readonly type: 'failed' }
  | { readonly type: 'reset' }

export const idleCopyState: CopyState = { status: 'idle' }

/** Shared state machine for copy actions in reader, sharing and contact surfaces. */
export function copyReducer(state: CopyState, event: CopyEvent): CopyState {
  switch (event.type) {
    case 'copy':
      return state.status === 'copying' ? state : { status: 'copying' }

    case 'succeeded':
      return state.status === 'copying' ? { status: 'copied' } : state

    case 'failed':
      return state.status === 'copying' ? { status: 'failed' } : state

    case 'reset':
      return state.status === 'idle' || state.status === 'copying' ? state : idleCopyState
  }
}

export function copyLabel(status: CopyStatus, subject = 'code'): string {
  switch (status) {
    case 'copying':
      return `Copying the ${subject}`
    case 'copied':
      return 'Copied'
    case 'failed':
      return 'Copy failed'
    default:
      return `Copy the ${subject}`
  }
}

export function copyAnnouncement(status: CopyStatus, subject = 'code'): string | null {
  switch (status) {
    case 'copied':
      return `The ${subject} is on your clipboard`
    case 'failed':
      return `We could not copy the ${subject}. Select it to copy it by hand.`
    default:
      return null
  }
}

export function copyLiveRegion(status: CopyStatus): {
  readonly role: 'status' | 'alert'
  readonly 'aria-live': 'polite' | 'assertive'
} {
  return status === 'failed'
    ? { role: 'alert', 'aria-live': 'assertive' }
    : { role: 'status', 'aria-live': 'polite' }
}

export function copyIsBusy(status: CopyStatus): boolean {
  return status === 'copying'
}
