import { useEffect, useState } from 'react'
import { Box, FormControl, FormLabel, Input, Stack, useToast } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatedPrimaryButton } from '../../../components/core/animations/AnimatedButton'
import { useAuth } from '../../../context/AuthContext'
import AuthShell, { AuthInlineLink } from '../components/AuthShell'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()
  const locationState = location.state as { from?: string; resetPasswordSuccess?: boolean } | null

  useEffect(() => {
    if (!locationState?.resetPasswordSuccess) {
      return
    }

    toast({
      title: 'Password reset successful',
      description: 'Please sign in with your new password.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    const nextState = locationState.from ? { from: locationState.from } : undefined
    navigate(location.pathname, { replace: true, state: nextState })
  }, [location.pathname, locationState, navigate, toast])

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
          Don&apos;t have an account? <AuthInlineLink to="/register">Sign up</AuthInlineLink>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing="6">
          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormControl>

          <Box textAlign="right">
            <AuthInlineLink to="/forgot-password">Forgot password?</AuthInlineLink>
          </Box>

          <AnimatedPrimaryButton type="submit" size="lg" fontSize="md" isLoading={isLoading}>
            Sign in
          </AnimatedPrimaryButton>
        </Stack>
      </form>
    </AuthShell>
  )
}

export default LoginPage
