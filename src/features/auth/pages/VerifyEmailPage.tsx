import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatedPrimaryButton } from '../../../components/core/animations/AnimatedButton'
import { authService } from '../../../core/services/auth.service'
import AuthShell, { AuthInlineLink } from '../components/AuthShell'

type VerifyLocationState = {
  email?: string
  from?: string
}

type VerificationStatus = 'pending' | 'verifying' | 'verified' | 'error'

const VerifyEmailPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const locationState = location.state as VerifyLocationState | null
  const tokenRef = useRef(searchParams.get('token') ?? '')
  const verificationStarted = useRef(false)
  const [email, setEmail] = useState(locationState?.email ?? '')
  const [status, setStatus] = useState<VerificationStatus>(
    tokenRef.current ? 'verifying' : 'pending',
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
      .catch(() => setStatus('error'))
      .finally(() => {
        tokenRef.current = ''
      })
  }, [locationState, navigate])

  const handleResend = async (event: React.FormEvent) => {
    event.preventDefault()
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

  if (status === 'verified') {
    return (
      <AuthShell title="Email verified" description="Your account is ready. Sign in to continue.">
        <Stack spacing="6">
          <Alert status="success" borderRadius="xl" alignItems="flex-start">
            <AlertIcon mt="1" />
            <Box>
              <AlertTitle>Verification complete</AlertTitle>
              <AlertDescription>You can now use your email and password.</AlertDescription>
            </Box>
          </Alert>
          <AnimatedPrimaryButton as={RouterLink} to="/login" state={signInState} size="lg">
            Sign in
          </AnimatedPrimaryButton>
        </Stack>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={status === 'verifying' ? 'Verifying your email' : 'Check your email'}
      description="Account access starts after the email address is verified."
    >
      <Stack spacing="6">
        {status === 'verifying' ? (
          <Alert status="info" borderRadius="xl" alignItems="flex-start">
            <AlertIcon mt="1" />
            <Box>
              <AlertTitle>Checking your link</AlertTitle>
              <AlertDescription>This should only take a moment.</AlertDescription>
            </Box>
          </Alert>
        ) : null}

        {status === 'error' ? (
          <Alert status="error" borderRadius="xl" alignItems="flex-start">
            <AlertIcon mt="1" />
            <Box>
              <AlertTitle>Link unavailable</AlertTitle>
              <AlertDescription>
                The verification link is invalid, expired, or has already been used.
              </AlertDescription>
            </Box>
          </Alert>
        ) : null}

        {status !== 'verifying' ? (
          <form onSubmit={handleResend}>
            <Stack spacing="5">
              <Text color="text.secondary">
                Enter your email to request a fresh link. The response stays the same whether or not
                an account exists.
              </Text>
              {resendMessage ? (
                <Alert status="success" borderRadius="xl">
                  <AlertIcon />
                  <AlertDescription>{resendMessage}</AlertDescription>
                </Alert>
              ) : null}
              {resendError ? (
                <Alert status="error" borderRadius="xl">
                  <AlertIcon />
                  <AlertDescription>{resendError}</AlertDescription>
                </Alert>
              ) : null}
              <FormControl isRequired>
                <FormLabel htmlFor="verification-email">Email</FormLabel>
                <Input
                  id="verification-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </FormControl>
              <AnimatedPrimaryButton type="submit" size="lg" isLoading={isResending} w="full">
                Send a new link
              </AnimatedPrimaryButton>
            </Stack>
          </form>
        ) : null}

        <Text color="text.secondary" textAlign="center">
          Already verified?{' '}
          <AuthInlineLink to="/login" state={signInState}>
            Sign in
          </AuthInlineLink>
        </Text>
      </Stack>
    </AuthShell>
  )
}

export default VerifyEmailPage
