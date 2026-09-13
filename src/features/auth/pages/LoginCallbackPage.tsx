/**
 * The Google callback landing - migrated onto Horizon Design System v2
 * (release M5).
 *
 * Presentation only. `resolveLoginCallbackOutcome` is byte-for-byte the
 * function it was, the fragment is still parsed by `parseOAuthCallbackFragment`
 * rather than by anything here, and the failure branch still leaves with the
 * provider's sanitised error code in location state so `/login` can turn it into
 * a sentence. Nothing on this screen reads or renders a token.
 *
 * What the reader sees is `AuthCallbackFeedback` in its `pending` state: the
 * page never renders any other one, because success and failure both navigate
 * away. Reporting "signed in" from here would be a claim this component is in no
 * position to make.
 */

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthCallbackFeedback, AuthPanel } from '../../../design-system'
import { useAuth } from '../../../context/AuthContext'
import { AuthStatus } from '../../../core/types/auth.types'
import { parseOAuthCallbackFragment } from '../utils/googleSso'

export type LoginCallbackOutcome =
  | { type: 'pending' }
  | { type: 'success'; redirectTo: string }
  | { type: 'failure'; error: string; redirectTo: string }

export const resolveLoginCallbackOutcome = (
  status: AuthStatus,
  hasUser: boolean,
  hash: string,
): LoginCallbackOutcome => {
  const { redirectTo, error } = parseOAuthCallbackFragment(hash)
  if (status === AuthStatus.LOADING) {
    return { type: 'pending' }
  }
  if (error) {
    return { type: 'failure', error, redirectTo }
  }
  if (status === AuthStatus.AUTHENTICATED && hasUser) {
    return { type: 'success', redirectTo }
  }
  return { type: 'failure', error: 'oauth_finalize_failed', redirectTo }
}

const LoginCallbackPage = () => {
  const navigate = useNavigate()
  const { status, user } = useAuth()
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) {
      return
    }

    const outcome = resolveLoginCallbackOutcome(status, Boolean(user), window.location.hash)
    if (outcome.type === 'pending') {
      return
    }

    handledRef.current = true
    if (outcome.type === 'success') {
      navigate(outcome.redirectTo, { replace: true })
      return
    }

    navigate('/login', {
      replace: true,
      state: {
        oauthError: outcome.error,
        ...(outcome.redirectTo !== '/' ? { from: outcome.redirectTo } : {}),
      },
    })
  }, [navigate, status, user])

  return (
    <AuthPanel
      title="Completing your sign in"
      description="We are finishing your Google sign in and restoring your account."
      isSubmitting
    >
      <AuthCallbackFeedback status="pending" provider="Google" />
    </AuthPanel>
  )
}

export default LoginCallbackPage
