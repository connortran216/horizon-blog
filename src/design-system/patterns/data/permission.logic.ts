/**
 * Horizon Design System v2 - permission and destructive-action decisions.
 *
 * `horizon-blog-dsv2.6.3` acceptance 3: permissions and destructive actions
 * retain backend authority.
 *
 * Two things follow from that, and both are structural here rather than
 * conventional:
 *
 * - `permissionRowState` returns `displayedRole`, and it is *always* the role
 *   the server last confirmed. There is no branch in which a requested role is
 *   displayed as if it had been applied. An optimistic role change is a lie
 *   with consequences: an administrator who sees "admin" in the table walks
 *   away believing someone has access they may not have been granted.
 * - Nothing in this module decides whether an action is allowed. `canConfirm`
 *   answers "has the human done what the dialogue asked for", not "may they do
 *   this" - the server answers that, and this layer reflects its answer.
 */

/* -------------------------------------------------------------------------- */
/* Role rows                                                                  */
/* -------------------------------------------------------------------------- */

export type PermissionRowStatus =
  /** Nothing pending. The row shows the confirmed role. */
  | 'settled'
  /** A change has been chosen and is waiting for confirmation. */
  | 'awaitingConfirmation'
  /** The request is in flight. */
  | 'saving'
  /** The request failed. The confirmed role is unchanged. */
  | 'failed'
  /** The server accepted the request and reported no change. */
  | 'unchanged'

export interface PermissionRowInput {
  /** The role the server last confirmed. The only thing ever displayed. */
  readonly serverRole: string
  /** What the administrator picked, before the server has answered. */
  readonly requestedRole?: string
  readonly isSaving?: boolean
  /** Why the last attempt failed. Its presence means failed. */
  readonly error?: string
  /** The server accepted the request and said the role was already that. */
  readonly reportedUnchanged?: boolean
  /** This row may not be changed - the last administrator, or self. */
  readonly isLocked?: boolean
  readonly lockReason?: string
}

export interface PermissionRowOutput {
  readonly status: PermissionRowStatus
  /**
   * What the row shows. Always `serverRole` - never the requested one, in any
   * state. This is the acceptance criterion, expressed as a value.
   */
  readonly displayedRole: string
  /** Whether a request differs from what the server holds. */
  readonly isDirty: boolean
  /** Whether the control accepts a new choice. */
  readonly canEdit: boolean
  /** What to say beside the row, or `null`. */
  readonly message: string | null
  readonly interrupts: boolean
}

export function permissionRowState({
  serverRole,
  requestedRole,
  isSaving = false,
  error,
  reportedUnchanged = false,
  isLocked = false,
  lockReason,
}: PermissionRowInput): PermissionRowOutput {
  const isDirty = requestedRole !== undefined && requestedRole !== serverRole

  const base = {
    // Not a ternary, not a fallback, not `requestedRole ?? serverRole`. The
    // server's answer, in every branch.
    displayedRole: serverRole,
    isDirty,
  }

  if (isLocked) {
    return {
      ...base,
      status: 'settled',
      canEdit: false,
      message: lockReason ?? 'This role cannot be changed here.',
      interrupts: false,
    }
  }

  if (isSaving) {
    return {
      ...base,
      status: 'saving',
      canEdit: false,
      message: 'Applying the change. The role below is still the current one.',
      interrupts: false,
    }
  }

  if (error !== undefined) {
    return {
      ...base,
      status: 'failed',
      canEdit: true,
      message: error,
      interrupts: true,
    }
  }

  if (reportedUnchanged) {
    return {
      ...base,
      status: 'unchanged',
      canEdit: true,
      message: 'This person already had that role. Nothing changed.',
      interrupts: false,
    }
  }

  if (isDirty) {
    return {
      ...base,
      status: 'awaitingConfirmation',
      canEdit: true,
      message: null,
      interrupts: false,
    }
  }

  return { ...base, status: 'settled', canEdit: true, message: null, interrupts: false }
}

export interface RoleChangeConfirmation {
  readonly title: string
  readonly body: string
  readonly confirmLabel: string
}

/**
 * The confirmation for a role change, or `null` when there is nothing to
 * confirm.
 *
 * `null` for a no-op is the point: a dialogue asking someone to confirm
 * changing a role from `author` to `author` trains them to press "Confirm"
 * without reading, which is exactly the habit a confirmation exists to prevent.
 */
export function roleChangeConfirmation(
  subject: string,
  fromRole: string,
  toRole: string,
): RoleChangeConfirmation | null {
  if (fromRole === toRole) {
    return null
  }

  return {
    title: `Change ${subject} to ${toRole}?`,
    body: `${subject} is currently ${fromRole}. The change applies on their next request to the server, and it can be changed back.`,
    confirmLabel: `Change to ${toRole}`,
  }
}

/* -------------------------------------------------------------------------- */
/* Destructive actions                                                        */
/* -------------------------------------------------------------------------- */

export interface DestructiveGateInput {
  /** What the reader typed into the confirmation field. */
  readonly typedConfirmation?: string
  /**
   * What they have to type. Omit it for an action that only needs a press -
   * reserve the typed confirmation for genuinely unrecoverable operations.
   */
  readonly requiredConfirmation?: string
  readonly isSubmitting?: boolean
  /** A verb phrase: "delete this post". Its presence means denied. */
  readonly deniedAction?: string
  /** The reader has ticked "I understand", where one is asked for. */
  readonly hasAcknowledged?: boolean
  readonly requiresAcknowledgement?: boolean
}

export interface DestructiveGateOutput {
  readonly canConfirm: boolean
  /** Why the confirm button will not act, or `null`. */
  readonly blockedReason: string | null
  /** Whether the typed value matches. False when nothing is required. */
  readonly confirmationMatches: boolean
}

/**
 * Whether the destructive confirmation may fire.
 *
 * The typed confirmation is compared after trimming and case-folding. Requiring
 * exact case turns a safety mechanism into a spelling test, and someone who has
 * typed the title of the post they mean to delete has demonstrated the intent
 * the gate was checking for.
 *
 * This is not an authorisation check. `deniedAction` is the server's answer
 * being reflected, and its absence is not permission - a caller that does not
 * pass it has simply not been refused yet.
 */
export function destructiveGate({
  typedConfirmation,
  requiredConfirmation,
  isSubmitting = false,
  deniedAction,
  hasAcknowledged = false,
  requiresAcknowledgement = false,
}: DestructiveGateInput): DestructiveGateOutput {
  const normalize = (value: string) => value.trim().toLocaleLowerCase()
  const confirmationMatches =
    requiredConfirmation === undefined
      ? true
      : typedConfirmation !== undefined &&
        normalize(typedConfirmation) === normalize(requiredConfirmation)

  const blockedReason =
    deniedAction !== undefined
      ? `You do not have permission to ${deniedAction}.`
      : requiresAcknowledgement && !hasAcknowledged
        ? 'Confirm that you understand what this removes.'
        : !confirmationMatches
          ? `Type ${requiredConfirmation} to confirm.`
          : null

  return {
    canConfirm: blockedReason === null && !isSubmitting,
    blockedReason,
    confirmationMatches: requiredConfirmation === undefined ? false : confirmationMatches,
  }
}

export interface DestructiveCopyInput {
  /** A verb phrase: "Delete this post". */
  readonly action: string
  /** What is being acted on: "Sample draft: write-ahead logs". */
  readonly subject: string
  /** What will actually be lost. Required - a warning with no content is noise. */
  readonly consequence: string
  /** True when the action can be undone. Most of these cannot. */
  readonly isReversible?: boolean
}

export interface DestructiveCopy {
  readonly title: string
  readonly body: string
  readonly confirmLabel: string
  readonly cancelLabel: string
  /** The sentence about permanence, or `null` for a reversible action. */
  readonly permanence: string | null
}

/**
 * The words on a destructive confirmation.
 *
 * The confirm button repeats the verb - "Delete this post", not "Confirm" -
 * because a dialogue that has been read and a dialogue that has been dismissed
 * look identical from a button labelled "OK", and because the button is what a
 * screen-reader user hears when they arrive at it out of context.
 *
 * `cancelLabel` says what keeping means. "Cancel" is ambiguous next to a
 * destructive verb: it can be read as cancelling the thing itself.
 */
export function destructiveCopy({
  action,
  subject,
  consequence,
  isReversible = false,
}: DestructiveCopyInput): DestructiveCopy {
  return {
    title: `${action}?`,
    body: `${subject}. ${consequence}`,
    confirmLabel: action,
    cancelLabel: 'Keep it',
    permanence: isReversible ? null : 'This cannot be undone.',
  }
}
