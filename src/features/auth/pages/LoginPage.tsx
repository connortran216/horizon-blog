import { useEffect, useState } from 'react'
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
  useToast,
} from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatedPrimaryButton } from '../../../components/core/animations/AnimatedButton'
import { useAuth } from '../../../context/AuthContext'
import AuthMethodDivider from '../components/AuthMethodDivider'
import AuthShell, { AuthInlineLink } from '../components/AuthShell'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { getOAuthErrorMessage } from '../utils/googleSso'

type LoginLocationState = {
  from?: string
  resetPasswordSuccess?: boolean
  oauthError?: string
}

type AuthFeedback = {
  status: 'success' | 'error'
  title: string
  description: string
}

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()
  const locationState = location.state as LoginLocationState | null
  const [inlineFeedback] = useState<AuthFeedback | null>(() => {
    if (locationState?.resetPasswordSuccess) {
      return {
        status: 'success',
        title: 'Password updated',
        description: 'Sign in with your new password to continue.',
      }
    }

    if (locationState?.oauthError) {
      return {
        status: 'error',
        title: 'Google sign in failed',
        description: getOAuthErrorMessage(locationState.oauthError),
      }
    }

    return null
  })

  useEffect(() => {
    if (!locationState?.resetPasswordSuccess && !locationState?.oauthError) {
      return
    }
    const nextState = locationState.from ? { from: locationState.from } : undefined
    navigate(location.pathname, { replace: true, state: nextState })
  }, [location.pathname, locationState, navigate])

  const redirectTo = locationState?.from || '/'
  const providerDescription =
    redirectTo !== '/'
      ? 'Faster sign in. You will return to the page you opened.'
      : 'Faster sign in without entering your password first.'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      await login({ email, password })

      const { particleSystem } = await import('../../../components/core/animations/ParticleSystem')
      particleSystem.showSuccessParticles()

      toast({
        title: 'Login successful',
        description: 'Welcome back.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      const destination = locationState?.from || '/'
      navigate(destination, { replace: true })
    } catch {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <AuthShell
      title="Log in to your account"
      description={
        <>
          Don&apos;t have an account?{' '}
          <AuthInlineLink
            to="/register"
            state={locationState?.from ? { from: locationState.from } : undefined}
          >
            Sign up
          </AuthInlineLink>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing="6">
          {inlineFeedback ? (
            <Alert status={inlineFeedback.status} borderRadius="xl" alignItems="flex-start">
              <AlertIcon mt="1" />
              <Box>
                <AlertTitle>{inlineFeedback.title}</AlertTitle>
                <AlertDescription>{inlineFeedback.description}</AlertDescription>
              </Box>
            </Alert>
          ) : null}

          <Stack spacing="3">
            <GoogleAuthButton redirectTo={redirectTo} isDisabled={isLoading} />
            <Text color="text.tertiary" fontSize="sm" textAlign="center">
              {providerDescription}
            </Text>
          </Stack>

          <AuthMethodDivider label="Or continue with email" />

          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormControl>
          <Box textAlign="right">
            <AuthInlineLink
              to="/forgot-password"
              state={locationState?.from ? { from: locationState.from } : undefined}
            >
              Forgot password?
            </AuthInlineLink>
          </Box>

          <AnimatedPrimaryButton
            type="submit"
            size="lg"
            fontSize="md"
            isLoading={isLoading}
            w="full"
          >
            Sign in
          </AnimatedPrimaryButton>
        </Stack>
      </form>
    </AuthShell>
  )
}

export default LoginPage
