/**
 * Sign in - migrated onto Horizon Design System v2 (release M5).
 *
 * Presentation only. `useAuth().login` is called with the same argument object,
 * the Google handoff still goes through `buildGoogleSsoStartUrl`, the redirect
 * target is still `location.state.from`, and every message below is the string
 * this page already shipped. Login failure copy in particular is deliberately
 * vague about which half of the credential pair was wrong; that is a security
 * property and it is reproduced verbatim.
 *
 * Composed from `AuthPanel` (shell and live region), `AuthMethod` /
 * `AuthMethodSeparator` (provider handoff), `Field` + `Input` (credentials),
 * `AuthAlert` (outcome) and `Button`.
 */

import { useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { FcGoogle } from 'react-icons/fc'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  ActionLink,
  AuthAlert,
  AuthMethod,
  AuthMethodSeparator,
  AuthPanel,
  Button,
  Field,
  Input,
  Stack,
  Text,
  useMotionPolicy,
} from '../../../design-system'
import { useAuth } from '../../../context/AuthContext'
import { AuthError } from '../../../core/types/auth.types'
import { playSuccessBurst } from '../successBurst'
import { buildGoogleSsoStartUrl, getOAuthErrorMessage } from '../utils/googleSso'

type LoginLocationState = {
  from?: string
  resetPasswordSuccess?: boolean
  oauthError?: string
}

type AuthFeedback = {
  tone: 'success' | 'error'
  title: string
  detail: string
}

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRedirectingToProvider, setIsRedirectingToProvider] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()
  const policy = useMotionPolicy()
  const locationState = location.state as LoginLocationState | null
  const [arrivalFeedback] = useState<AuthFeedback | null>(() => {
    if (locationState?.resetPasswordSuccess) {
      return {
        tone: 'success',
        title: 'Password updated',
        detail: 'Sign in with your new password to continue.',
      }
    }

    if (locationState?.oauthError) {
      return {
        tone: 'error',
        title: 'Google sign in failed',
        detail: getOAuthErrorMessage(locationState.oauthError),
      }
    }

    return null
  })
  /*
   * The failure of the last attempt, kept on the page rather than in a toast
   * that disappears after three seconds. The reader has to act on it - retype a
   * password - so it stays until the next attempt replaces it. The sentence
   * itself is unchanged.
   */
  const [submitFeedback, setSubmitFeedback] = useState<AuthFeedback | null>(null)

  useEffect(() => {
    if (!locationState?.resetPasswordSuccess && !locationState?.oauthError) {
      return
    }
    const nextState = locationState.from ? { from: locationState.from } : undefined
    navigate(location.pathname, { replace: true, state: nextState })
  }, [location.pathname, locationState, navigate])

  const redirectTo = locationState?.from || '/'
  const siblingState = locationState?.from ? { from: locationState.from } : undefined
  const providerDescription =
    redirectTo !== '/'
      ? 'Faster sign in. You will return to the page you opened.'
      : 'Faster sign in without entering your password first.'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // A second submission while the first is in flight would race two sessions
    // against each other. The button swallows its own clicks; this covers the
    // Enter key, which never reaches the button at all.
    if (isLoading) {
      return
    }

    setSubmitFeedback(null)

    try {
      await login({ email, password })

      /*
       * The celebration, and the only motion on this screen. `playSuccessBurst`
       * is a no-op under reduced motion - it does not even fetch the animation
       * - so the toast below carries the outcome on its own there.
       */
      await playSuccessBurst(policy)

      toast({
        title: 'Login successful',
        description: 'Welcome back.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      const destination = locationState?.from || '/'
      navigate(destination, { replace: true })
    } catch (error: unknown) {
      if (error instanceof AuthError && error.code === 'EMAIL_VERIFICATION_REQUIRED') {
        navigate('/verify-email', {
          state: {
            email: email.trim(),
            ...(locationState?.from ? { from: locationState.from } : {}),
          },
        })
        toast({
          title: 'Verify your email',
          description: error.message,
          status: 'info',
          duration: 4000,
          isClosable: true,
        })
        return
      }

      setSubmitFeedback({
        tone: 'error',
        title: 'Login failed',
        detail: 'Please check your credentials and try again.',
      })
    }
  }

  const feedback = submitFeedback ?? arrivalFeedback

  return (
    <AuthPanel
      title="Log in to your account"
      description={
        <>
          Don&apos;t have an account?{' '}
          <ActionLink to="/register" state={siblingState}>
            Sign up
          </ActionLink>
        </>
      }
      isSubmitting={isLoading}
      feedback={
        feedback === null ? undefined : (
          <AuthAlert tone={feedback.tone} title={feedback.title} detail={feedback.detail} />
        )
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap={6}>
          <Stack gap={3}>
            <AuthMethod
              provider="Google"
              startUrl={buildGoogleSsoStartUrl(redirectTo)}
              onStart={() => setIsRedirectingToProvider(true)}
              icon={<FcGoogle aria-hidden="true" />}
              isDisabled={isLoading}
              isRedirecting={isRedirectingToProvider}
            />
            <Text recipe="metadata" textAlign="center">
              {providerDescription}
            </Text>
          </Stack>

          <AuthMethodSeparator label="Or continue with email" />

          <Field label="Email" id="email" isRequired>
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Field label="Password" id="password" isRequired>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>

          <Stack direction="row" collapseAt={undefined} justifyContent="flex-end">
            <ActionLink to="/forgot-password" state={siblingState} underline="hover" standalone>
              Forgot password?
            </ActionLink>
          </Stack>

          <Button
            type="submit"
            tone="primary"
            width="100%"
            isLoading={isLoading}
            loadingLabel="Signing in"
          >
            Sign in
          </Button>
        </Stack>
      </form>
    </AuthPanel>
  )
}

export default LoginPage
