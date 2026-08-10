import { useEffect, useRef, useState } from 'react'
import { Box, Stack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { LoadingSignal } from '../../../components/core/animations/LoadingState'
import { useAuth } from '../../../context/AuthContext'
import { AuthStatus } from '../../../core/types/auth.types'
import AuthShell from '../components/AuthShell'
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
  const [statusText] = useState('Finishing your Google sign in...')
  const [statusDescription] = useState('We are verifying your account and restoring your session.')

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
    <AuthShell
      title="Completing your sign in"
      description="We are finishing your Google sign in and restoring your account."
    >
      <Stack spacing="5" align="center" py={{ base: '6', md: '8' }} textAlign="center">
        <Box
          px="5"
          py="4"
          borderRadius="full"
          border="1px solid"
          borderColor="border.subtle"
          bg="action.subtle"
        >
          <LoadingSignal size="md" />
        </Box>
        <Box maxW="sm">
          <Text color="text.primary" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="semibold">
            {statusText}
          </Text>
          <Text color="text.secondary" fontSize="sm" mt="2" lineHeight="tall">
            {statusDescription}
          </Text>
        </Box>
      </Stack>
    </AuthShell>
  )
}

export default LoginCallbackPage
