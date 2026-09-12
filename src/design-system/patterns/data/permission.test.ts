import { describe, expect, it } from 'vitest'

import {
  destructiveCopy,
  destructiveGate,
  permissionRowState,
  roleChangeConfirmation,
} from './permission.logic'

/**
 * `horizon-blog-dsv2.6.3` acceptance 3: permissions and destructive actions
 * retain backend authority.
 *
 * The load-bearing assertion is the first block: `displayedRole` is the server's
 * role in every state, including while a different role is being requested. It
 * is the property an optimistic implementation would break first and the one a
 * screenshot review would never catch.
 */
describe('permission row state', () => {
  it('shows the server role at rest', () => {
    expect(permissionRowState({ serverRole: 'member' }).displayedRole).toBe('member')
  })

  it('still shows the server role while a change is in flight', () => {
    const state = permissionRowState({
      serverRole: 'member',
      requestedRole: 'admin',
      isSaving: true,
    })

    expect(state.displayedRole).toBe('member')
    expect(state.status).toBe('saving')
  })

  it('still shows the server role after the change was refused', () => {
    const state = permissionRowState({
      serverRole: 'member',
      requestedRole: 'admin',
      error: 'Your account can no longer assign roles.',
    })

    expect(state.displayedRole).toBe('member')
    expect(state.status).toBe('failed')
  })

  it('never displays a requested role, in any state', () => {
    const inputs = [
      { serverRole: 'member', requestedRole: 'admin' },
      { serverRole: 'member', requestedRole: 'admin', isSaving: true },
      { serverRole: 'member', requestedRole: 'admin', error: 'refused' },
      { serverRole: 'member', requestedRole: 'admin', isLocked: true },
      { serverRole: 'member', requestedRole: 'admin', reportedUnchanged: true },
    ]

    for (const input of inputs) {
      expect(permissionRowState(input).displayedRole).toBe('member')
    }
  })

  it('says out loud that the role shown during a save is still the current one', () => {
    expect(permissionRowState({ serverRole: 'member', isSaving: true }).message).toContain(
      'still the current one',
    )
  })

  it('reports a dirty row without applying it', () => {
    const state = permissionRowState({ serverRole: 'member', requestedRole: 'author' })

    expect(state.isDirty).toBe(true)
    expect(state.status).toBe('awaitingConfirmation')
    expect(state.displayedRole).toBe('member')
  })

  it('is not dirty when the requested role is the one already held', () => {
    expect(permissionRowState({ serverRole: 'author', requestedRole: 'author' }).isDirty).toBe(
      false,
    )
  })

  it('locks a row the server will not let anyone change, and says why', () => {
    const state = permissionRowState({
      serverRole: 'admin',
      isLocked: true,
      lockReason: 'At least one administrator must remain.',
    })

    expect(state.canEdit).toBe(false)
    expect(state.message).toBe('At least one administrator must remain.')
  })

  it('reflects a server no-op instead of pretending something happened', () => {
    const state = permissionRowState({ serverRole: 'author', reportedUnchanged: true })

    expect(state.status).toBe('unchanged')
    expect(state.message).toContain('Nothing changed')
  })

  it('interrupts only for a failure', () => {
    expect(permissionRowState({ serverRole: 'member', error: 'refused' }).interrupts).toBe(true)
    expect(permissionRowState({ serverRole: 'member', isSaving: true }).interrupts).toBe(false)
  })

  it('locks the control while a request is in flight', () => {
    expect(permissionRowState({ serverRole: 'member', isSaving: true }).canEdit).toBe(false)
  })
})

describe('role change confirmation', () => {
  it('asks about a real change', () => {
    const confirmation = roleChangeConfirmation('Sample Author', 'member', 'admin')

    expect(confirmation?.title).toBe('Change Sample Author to admin?')
    expect(confirmation?.body).toContain('currently member')
    expect(confirmation?.confirmLabel).toBe('Change to admin')
  })

  it('asks nothing about a no-op', () => {
    // Confirming member -> member trains people to press Confirm unread.
    expect(roleChangeConfirmation('Sample Author', 'author', 'author')).toBeNull()
  })

  it('says when the change takes effect rather than implying it is instant', () => {
    expect(roleChangeConfirmation('Sample Author', 'member', 'author')?.body).toContain(
      'next request to the server',
    )
  })

  it('says the change is reversible, because it is', () => {
    expect(roleChangeConfirmation('Sample Author', 'member', 'author')?.body).toContain(
      'changed back',
    )
  })
})

describe('destructive gate', () => {
  it('allows a plain confirmation with no typed value required', () => {
    const gate = destructiveGate({})

    expect(gate.canConfirm).toBe(true)
    expect(gate.blockedReason).toBeNull()
  })

  it('blocks until the required text is typed', () => {
    const gate = destructiveGate({ requiredConfirmation: 'delete', typedConfirmation: 'del' })

    expect(gate.canConfirm).toBe(false)
    expect(gate.blockedReason).toContain('Type delete')
  })

  it('accepts the required text once it matches', () => {
    expect(
      destructiveGate({ requiredConfirmation: 'delete', typedConfirmation: 'delete' }).canConfirm,
    ).toBe(true)
  })

  it('ignores case and surrounding space, because this is not a spelling test', () => {
    expect(
      destructiveGate({ requiredConfirmation: 'Delete', typedConfirmation: '  delete ' })
        .confirmationMatches,
    ).toBe(true)
  })

  it('blocks on a missing acknowledgement', () => {
    const gate = destructiveGate({ requiresAcknowledgement: true })

    expect(gate.canConfirm).toBe(false)
    expect(gate.blockedReason).toContain('understand')
  })

  it('allows once the acknowledgement is given', () => {
    expect(
      destructiveGate({ requiresAcknowledgement: true, hasAcknowledged: true }).canConfirm,
    ).toBe(true)
  })

  it('reports the server refusal above anything the reader could type', () => {
    const gate = destructiveGate({
      deniedAction: 'delete this post',
      requiredConfirmation: 'delete',
      typedConfirmation: 'delete',
      hasAcknowledged: true,
    })

    expect(gate.canConfirm).toBe(false)
    expect(gate.blockedReason).toContain('permission')
  })

  it('refuses a second confirmation while one is in flight', () => {
    const gate = destructiveGate({ isSubmitting: true })

    expect(gate.canConfirm).toBe(false)
    expect(gate.blockedReason).toBeNull()
  })
})

describe('destructive copy', () => {
  it('repeats the verb on the confirm button rather than saying "Confirm"', () => {
    const copy = destructiveCopy({
      action: 'Delete this post',
      subject: 'Sample post: write-ahead logs',
      consequence: 'Its comments and reactions go with it.',
    })

    expect(copy.confirmLabel).toBe('Delete this post')
    expect(copy.confirmLabel).not.toBe('Confirm')
  })

  it('says what keeping means, because "Cancel" is ambiguous here', () => {
    expect(
      destructiveCopy({ action: 'Delete', subject: 'A post', consequence: 'It goes.' }).cancelLabel,
    ).toBe('Keep it')
  })

  it('warns about permanence by default', () => {
    expect(
      destructiveCopy({ action: 'Delete', subject: 'A post', consequence: 'It goes.' }).permanence,
    ).toBe('This cannot be undone.')
  })

  it('does not warn about permanence for something reversible', () => {
    expect(
      destructiveCopy({
        action: 'Cancel the schedule',
        subject: 'A draft',
        consequence: 'It stays a draft.',
        isReversible: true,
      }).permanence,
    ).toBeNull()
  })

  it('states the consequence rather than only the subject', () => {
    const copy = destructiveCopy({
      action: 'Delete this Series',
      subject: 'Sample Series',
      consequence: 'Its posts stay in your writing.',
    })

    expect(copy.body).toContain('Sample Series')
    expect(copy.body).toContain('stay in your writing')
  })
})
