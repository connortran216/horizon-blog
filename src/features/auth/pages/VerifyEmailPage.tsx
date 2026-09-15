/**
 * Email verification - migrated onto Horizon Design System v2 (release M5).
 *
 * Presentation only. The token is still read once from the query string, still
 * removed from the URL before the request goes out, and is still never rendered.
 * `authService.verifyEmail` and `authService.resendVerification` are called
 * exactly as before, and the resend response is shown as the service returns it:
 * that sentence is uniform whether or not an account exists for the address, and
 * replacing it with copy of our own would risk turning it into an oracle for
 * which addresses are registered.
 *
 * Composed from `AuthPanel`, `VerificationFeedback` (the four link states),
 * `Field` + `Input`, `AuthAlert` and `Button`.
 */

import { useEffect, useRef, useState } from 'react'
import { Box } from '@chakra-ui/react'

import {
  ActionLink,
  AuthAlert,
  AuthPanel,
  Button,
  Field,
  Input,
  Stack,
  Text,
  VerificationFeedback,
  verificationCopy,
  type VerificationStatus,
} from '../../../design-system'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../../core/services/auth.service'

type VerifyLocationState = {
  email?: string
  from?: string
}

const VerifyEmailPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const locationState = location.state as VerifyLocationState | null
  const tokenRef = useRef(searchParams.get('token') ?? '')
  const verificationStarted = useRef(false)
  const [email, setEmail] = useState(locationState?.email ?? '')
  /*
   * The same four states the page always had, named the way the design system
   * names them: `awaitingLink`, `checking`, `verified`, `linkUnusable`. The last
   * one covers invalid, expired and already-used links with one message, which
   * is the behaviour this page already had and the reason it had it.
   */
  const [status, setStatus] = useState<VerificationStatus>(
    tokenRef.current ? 'checking' : 'awaitingLink',
  )
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenRef.current || verificationStarted.current) {
      return
    }
    verificationStarted.current = true
    const token = tokenRef.current

    navigate('/verify-email', {
      replace: true,
      state: locationState ?? undefined,
    })

    void authService
      .verifyEmail(token)
      .then(() => setStatus('verified'))
      .catch(() => setStatus('linkUnusable'))
      .finally(() => {
        tokenRef.current = ''
      })
  }, [locationState, navigate])

  const handleResend = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isResending) {
      return
    }

    setResendError(null)
    setResendMessage(null)
    setIsResending(true)
    try {
      setResendMessage(await authService.resendVerification(email.trim()))
    } catch (error: unknown) {
      setResendError(error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const signInState = locationState?.from ? { from: locationState.from } : undefined
  const copy = verificationCopy(status)

  return (
    <AuthPanel
      title="Verify your email"
      description="Account access starts after the email address is verified."
      isSubmitting={isResending}
      footer={
        <>
          Already verified?{' '}
          <ActionLink to="/login" state={signInState}>
            Sign in
          </ActionLink>
        </>
      }
    >
      <VerificationFeedback status={status}>
        {status === 'verified' ? (
          <ActionLink to="/login" state={signInState} weight="primary" width="100%">
            Sign in
          </ActionLink>
        ) : copy.offersResend ? (
          <Box as="form" width="100%" onSubmit={handleResend}>
            <Stack gap={6} textAlign="start">
              <Text recipe="body">
                Enter your email to request a fresh link. The response stays the same whether or not
                an account exists.
              </Text>

              {resendMessage === null ? null : (
                <AuthAlert tone="success" title="Request received" detail={resendMessage} />
              )}
              {resendError === null ? null : (
                <AuthAlert tone="error" title="We could not send a new link" detail={resendError} />
              )}

              <Field label="Email" id="verification-email" isRequired>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>

              <Button
                type="submit"
                tone="primary"
                width="100%"
                isLoading={isResending}
                loadingLabel="Sending a new link"
              >
                Send a new link
              </Button>
            </Stack>
          </Box>
        ) : null}
      </VerificationFeedback>
    </AuthPanel>
  )
}

export default VerifyEmailPage
