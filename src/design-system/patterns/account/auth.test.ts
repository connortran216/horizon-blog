import { describe, expect, it } from 'vitest'

import {
  authCallbackCopy,
  authFailureCopy,
  authFailureReasons,
  authMethodState,
  authPanelState,
  resendConfirmation,
  verificationCopy,
} from './auth.logic'

/**
 * `horizon-blog-dsv2.6.1` acceptance 1: no auth or OAuth contract changes.
 *
 * What that means for a presentation module, and what these tests can actually
 * hold: every function is a pure map from an outcome to copy and attributes, so
 * there is no branch in which the design system decides an authentication
 * result. Whether the production route still calls the same service is a
 * property of the route, which this bundle does not touch.
 */
describe('auth panel state', () => {
  it('is signed out when nothing has been attempted', () => {
    expect(authPanelState({}).status).toBe('signedOut')
  })

  it('keeps the form usable while a validation message is showing', () => {
    const state = authPanelState({ validationError: 'That password is too short.' })

    expect(state.status).toBe('invalid')
    expect(state.canSubmit).toBe(true)
    expect(state.fieldsEnabled).toBe(true)
  })

  it('refuses a second submission while one is in flight', () => {
    expect(authPanelState({ isSubmitting: true }).canSubmit).toBe(false)
  })

  it('marks a submitting panel busy so the wait is announced', () => {
    expect(authPanelState({ isSubmitting: true })['aria-busy']).toBe(true)
    expect(authPanelState({})['aria-busy']).toBeUndefined()
  })

  it('drops a stale validation message when a new attempt starts', () => {
    const state = authPanelState({ isSubmitting: true, validationError: 'Wrong password.' })

    expect(state.status).toBe('submitting')
  })

  it('puts denial above every other state, because retrying cannot help', () => {
    const state = authPanelState({
      deniedAction: 'sign in with this account',
      isSubmitting: true,
      validationError: 'Wrong password.',
      isUnavailable: true,
    })

    expect(state.status).toBe('denied')
    expect(state.showsForm).toBe(false)
    expect(state.canSubmit).toBe(false)
  })

  it('keeps the form visible but inert when the method is switched off', () => {
    const state = authPanelState({ isUnavailable: true })

    expect(state.status).toBe('unavailable')
    expect(state.showsForm).toBe(true)
    expect(state.fieldsEnabled).toBe(false)
    expect(state.canSubmit).toBe(false)
  })
})

describe('provider method', () => {
  it('is startable at rest', () => {
    expect(authMethodState('Google').canStart).toBe(true)
  })

  it('refuses a second handoff while the first one is redirecting', () => {
    const state = authMethodState('Google', { isRedirecting: true })

    expect(state.canStart).toBe(false)
    expect(state.isLoading).toBe(true)
  })

  it('keeps a redirecting button focusable rather than natively disabled', () => {
    // `disabled` would take focus off the button the reader just pressed.
    expect(authMethodState('Google', { isRedirecting: true }).disabled).toBe(false)
  })

  it('names the provider in the announcement, so the wait has a subject', () => {
    expect(authMethodState('Google', { isRedirecting: true }).announcement).toBe('Opening Google')
  })

  it('says nothing at rest', () => {
    expect(authMethodState('Google').announcement).toBeUndefined()
  })

  it('is not startable when disabled', () => {
    expect(authMethodState('Google', { isDisabled: true }).canStart).toBe(false)
  })
})

describe('provider callback copy', () => {
  it('describes the handoff and never claims a session while pending', () => {
    const copy = authCallbackCopy('pending', 'Google')

    expect(copy.tone).toBe('loading')
    expect(copy.headline).toContain('Google')
    expect(copy.liveRegion['aria-busy']).toBe(true)
  })

  it('states that nothing changed when the callback failed', () => {
    const copy = authCallbackCopy('failed', 'Google')

    expect(copy.tone).toBe('error')
    expect(copy.detail).toContain('Nothing was changed')
  })

  it('never interrupts: every callback state is a polite region', () => {
    for (const status of ['pending', 'succeeded', 'failed'] as const) {
      expect(authCallbackCopy(status, 'Google').liveRegion['aria-live']).toBe('polite')
    }
  })
})

describe('verification copy', () => {
  it('offers a resend exactly when a fresh link would help', () => {
    expect(verificationCopy('awaitingLink').offersResend).toBe(true)
    expect(verificationCopy('linkUnusable').offersResend).toBe(true)
    expect(verificationCopy('checking').offersResend).toBe(false)
    expect(verificationCopy('verified').offersResend).toBe(false)
  })

  it('gives every state its own tone, so none of them look alike', () => {
    const tones = (['awaitingLink', 'checking', 'verified', 'linkUnusable'] as const).map(
      (status) => verificationCopy(status).tone,
    )

    expect(new Set(tones).size).toBe(tones.length)
  })

  it('does not say why the link failed, because that would leak the account list', () => {
    const copy = verificationCopy('linkUnusable')

    expect(copy.headline.toLowerCase()).not.toContain('no account')
    expect(copy.detail).toContain('expired or already been used')
  })

  it('keeps the resend confirmation identical for known and unknown addresses', () => {
    expect(resendConfirmation()).toContain('If that address has an account')
  })
})

describe('failure copy', () => {
  it('covers every reason without falling through to a generic sentence', () => {
    const messages = authFailureReasons.map((reason) => authFailureCopy(reason, 'Google'))

    expect(new Set(messages).size).toBe(authFailureReasons.length)
  })

  it('never ships a vague failure', () => {
    for (const reason of authFailureReasons) {
      const message = authFailureCopy(reason, 'Google').toLowerCase()

      expect(message).not.toContain('something went wrong')
      expect(message).not.toContain('unexpected error')
    }
  })

  it('names the provider for the reasons that are about the provider', () => {
    expect(authFailureCopy('cancelled', 'Google')).toContain('Google')
    expect(authFailureCopy('expired', 'Google')).toContain('Google')
  })

  it('does not blame the provider for an account collision', () => {
    expect(authFailureCopy('accountConflict', 'Google')).not.toContain('Google')
  })
})
