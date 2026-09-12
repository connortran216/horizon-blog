/**
 * Horizon Design System v2 - authentication presentation decisions.
 *
 * This module is presentation only. It decides which of the account surfaces a
 * reader is looking at and what it says; it never decides whether someone is
 * signed in, never touches a token, and never models an authorisation scope.
 * `horizon-blog-dsv2.6.1` acceptance 1 is "no auth or OAuth contract changes",
 * and the way that is kept true here is structural: every function below takes
 * the outcome the feature already computed and returns copy and attributes.
 *
 * Two rules are worth naming, because both are easy to break by accident:
 *
 * - There is no code path that renders a consent or scope screen. `AuthMethod`
 *   hands the reader to the provider's own start URL and nothing else; the
 *   provider owns consent, and imitating it here would be a phishing surface.
 * - Failure copy is keyed on a small closed set of *presentation reasons*, not
 *   on backend error codes. The feature maps its codes onto a reason, so the
 *   design system never becomes a second, drifting copy of that mapping.
 */

import { liveRegionFor, type LiveRegionAttributes } from '../../components/feedback'

/* -------------------------------------------------------------------------- */
/* The credential panel                                                       */
/* -------------------------------------------------------------------------- */

export type AuthPanelStatus =
  /** The form is ready and nothing has been attempted yet. */
  | 'signedOut'
  /** A request is in flight. */
  | 'submitting'
  /** The submitted values were rejected. The form stays usable. */
  | 'invalid'
  /** This sign-in method is switched off. The form is shown but inert. */
  | 'unavailable'
  /** The account exists but may not do this. Not a validation failure. */
  | 'denied'

export interface AuthPanelStateInput {
  readonly isSubmitting?: boolean
  /** A validation message from the last attempt. Its presence means invalid. */
  readonly validationError?: string
  /** A verb phrase: "sign in with this account". Its presence means denied. */
  readonly deniedAction?: string
  /** The method is disabled - maintenance, or a provider that is switched off. */
  readonly isUnavailable?: boolean
}

export interface AuthPanelStateOutput {
  readonly status: AuthPanelStatus
  /** Whether the submit control may dispatch. */
  readonly canSubmit: boolean
  /** Whether the credential fields are rendered at all. */
  readonly showsForm: boolean
  /** Whether the fields accept input. */
  readonly fieldsEnabled: boolean
  readonly liveRegion: LiveRegionAttributes
  readonly 'aria-busy': true | undefined
}

/**
 * Which single state the panel is in.
 *
 * Precedence, strongest first: denied, unavailable, submitting, invalid,
 * signed out.
 *
 * Denied is first because it is the only state where trying again cannot help -
 * showing "check your password" to someone whose account is not permitted to
 * sign in sends them round a loop they cannot leave. Unavailable is next for
 * the same reason, minus the account: the method itself is off. Submitting
 * beats invalid because the message from the previous attempt is already stale
 * the moment a new one starts, and leaving it up under a spinner reads as if
 * the new attempt had already failed.
 */
export function authPanelState({
  isSubmitting = false,
  validationError,
  deniedAction,
  isUnavailable = false,
}: AuthPanelStateInput): AuthPanelStateOutput {
  const status: AuthPanelStatus =
    deniedAction !== undefined
      ? 'denied'
      : isUnavailable
        ? 'unavailable'
        : isSubmitting
          ? 'submitting'
          : validationError !== undefined
            ? 'invalid'
            : 'signedOut'

  return {
    status,
    canSubmit: status === 'signedOut' || status === 'invalid',
    // A denied account is not helped by a form. Every other state keeps it,
    // including `unavailable`, where the reader still needs to see what the
    // method would have asked for before choosing another one.
    showsForm: status !== 'denied',
    fieldsEnabled: status === 'signedOut' || status === 'invalid',
    liveRegion: liveRegionFor(status === 'submitting' ? 'loading' : 'empty'),
    'aria-busy': status === 'submitting' ? true : undefined,
  }
}

/* -------------------------------------------------------------------------- */
/* Provider methods                                                           */
/* -------------------------------------------------------------------------- */

export interface AuthMethodStateInput {
  readonly isDisabled?: boolean
  /** The browser is being handed to the provider. */
  readonly isRedirecting?: boolean
}

export interface AuthMethodStateOutput {
  readonly disabled: boolean
  readonly isLoading: boolean
  /** Announced while the handoff is in flight. Names the provider. */
  readonly announcement: string | undefined
  readonly canStart: boolean
}

/**
 * A provider button is a handoff, not a login.
 *
 * It stays focusable while redirecting - the reader pressed it a moment ago -
 * and it refuses to start a second handoff, because two navigations racing each
 * other is how a callback arrives with a state parameter from the wrong attempt.
 */
export function authMethodState(
  providerLabel: string,
  { isDisabled = false, isRedirecting = false }: AuthMethodStateInput = {},
): AuthMethodStateOutput {
  const canStart = !isDisabled && !isRedirecting

  return {
    disabled: isDisabled,
    isLoading: isRedirecting,
    announcement: isRedirecting ? `Opening ${providerLabel}` : undefined,
    canStart,
  }
}

/* -------------------------------------------------------------------------- */
/* The provider callback                                                      */
/* -------------------------------------------------------------------------- */

export type AuthCallbackStatus = 'pending' | 'succeeded' | 'failed'

export interface AuthCallbackCopy {
  readonly headline: string
  readonly detail: string
  /** `loading` while the feature is still resolving the callback. */
  readonly tone: 'loading' | 'success' | 'error'
  readonly liveRegion: LiveRegionAttributes
}

/**
 * What the callback screen says while the feature finishes the exchange.
 *
 * The copy deliberately describes the handoff and never the session: this
 * surface does not know whether a session exists, and saying "you are signed
 * in" before the feature has said so would be an invention.
 */
export function authCallbackCopy(
  status: AuthCallbackStatus,
  providerLabel: string,
): AuthCallbackCopy {
  if (status === 'succeeded') {
    return {
      headline: `Finished signing in with ${providerLabel}`,
      detail: 'Taking you back to what you were reading.',
      tone: 'success',
      liveRegion: liveRegionFor('success'),
    }
  }

  if (status === 'failed') {
    return {
      headline: `We could not finish signing in with ${providerLabel}`,
      detail: 'Nothing was changed on your account. You can try another way in.',
      tone: 'error',
      liveRegion: liveRegionFor('error'),
    }
  }

  return {
    headline: `Finishing your ${providerLabel} sign in`,
    detail: 'This takes a moment. Do not close the tab.',
    tone: 'loading',
    liveRegion: liveRegionFor('loading'),
  }
}

/* -------------------------------------------------------------------------- */
/* Email verification                                                         */
/* -------------------------------------------------------------------------- */

export type VerificationStatus =
  /** Waiting for the reader to open the link in their inbox. */
  | 'awaitingLink'
  /** A link was opened and is being checked. */
  | 'checking'
  | 'verified'
  /** Invalid, expired, or already used. All three look the same to the reader. */
  | 'linkUnusable'

export interface VerificationCopy {
  readonly headline: string
  readonly detail: string
  readonly tone: 'loading' | 'success' | 'error' | 'empty'
  /** Whether the "send me a new link" form is offered. */
  readonly offersResend: boolean
  readonly liveRegion: LiveRegionAttributes
}

/**
 * Verification copy.
 *
 * `linkUnusable` covers invalid, expired and already-used links with one
 * message on purpose. Telling an anonymous visitor which of the three it was
 * confirms whether an address is registered, and the production flow already
 * keeps that response uniform - see the resend copy below.
 */
export function verificationCopy(status: VerificationStatus): VerificationCopy {
  switch (status) {
    case 'verified':
      return {
        headline: 'Your email address is verified',
        detail: 'You can sign in with it now.',
        tone: 'success',
        offersResend: false,
        liveRegion: liveRegionFor('success'),
      }

    case 'checking':
      return {
        headline: 'Checking your verification link',
        detail: 'This only takes a moment.',
        tone: 'loading',
        offersResend: false,
        liveRegion: liveRegionFor('loading'),
      }

    case 'linkUnusable':
      return {
        headline: 'That verification link no longer works',
        detail: 'It may have expired or already been used. Ask for a fresh one below.',
        tone: 'error',
        offersResend: true,
        liveRegion: liveRegionFor('error'),
      }

    case 'awaitingLink':
    default:
      return {
        headline: 'Check your email for the verification link',
        detail: 'Look in the spam folder if it has not arrived after a few minutes.',
        tone: 'empty',
        offersResend: true,
        liveRegion: liveRegionFor('empty'),
      }
  }
}

/**
 * The resend confirmation.
 *
 * It is the same sentence whether or not an account exists for the address,
 * which is the behaviour the production endpoint already has. Producing a
 * different message for a known address would leak the account list through the
 * UI even though the API refuses to.
 */
export function resendConfirmation(): string {
  return 'If that address has an account, a new verification link is on its way.'
}

/* -------------------------------------------------------------------------- */
/* Failure reasons                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Presentation reasons, not backend codes. The feature owns the mapping from
 * its own error codes onto one of these, so the design system holds copy and
 * the feature holds the contract.
 */
export type AuthFailureReason =
  /** The reader backed out at the provider. */
  | 'cancelled'
  /** The attempt took too long and has to start again. */
  | 'expired'
  /** The handoff could not be verified. */
  | 'unverifiable'
  /** The address is already used by a different sign-in method. */
  | 'accountConflict'
  /** Anything else. Still names the step that failed. */
  | 'unfinished'

export const authFailureReasons: readonly AuthFailureReason[] = [
  'cancelled',
  'expired',
  'unverifiable',
  'accountConflict',
  'unfinished',
]

/**
 * One sentence naming what happened and what to do next.
 *
 * Every one of these ends with an action the reader can take. A failure message
 * that only reports is a dead end, and this is the surface where a dead end
 * means the reader cannot get into their account at all.
 */
export function authFailureCopy(reason: AuthFailureReason, providerLabel: string): string {
  switch (reason) {
    case 'cancelled':
      return `The ${providerLabel} sign in was cancelled. You can start it again or use your email.`
    case 'expired':
      return `The ${providerLabel} sign in took too long. Start it again.`
    case 'unverifiable':
      return `We could not verify the ${providerLabel} sign in. Start it again from this page.`
    case 'accountConflict':
      return 'An account already uses that email address. Sign in with the method you set up first.'
    case 'unfinished':
    default:
      return `We could not finish the ${providerLabel} sign in. Nothing changed on your account.`
  }
}
