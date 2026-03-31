import { useEffect, useRef, useState } from 'react'
import { Box, Stack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { LoadingSignal } from '../../../components/core/animations/LoadingState'
import { useAuth } from '../../../context/AuthContext'
import AuthShell from '../components/AuthShell'
import { parseOAuthCallbackFragment } from '../utils/googleSso'

const LoginCallbackPage = () => {
  const navigate = useNavigate()
  const { completeOAuthLogin } = useAuth()
  const handledRef = useRef(false)
  const [statusText, setStatusText] = useState('Finishing your Google sign in...')
  const [statusDescription, setStatusDescription] = useState(
    'We are verifying your account and restoring your session.',
  )

  useEffect(() => {
    if (handledRef.current) {
      return
    }
    handledRef.current = true

    const finishOAuthLogin = async () => {
      const { token, redirectTo, error } = parseOAuthCallbackFragment(window.location.hash)

      if (!token) {
        navigate('/login', {
          replace: true,
          state: {
            oauthError: error || 'oauth_missing_token',
            ...(redirectTo ? { from: redirectTo } : {}),
          },
        })
        return
      }

      try {
        setStatusText('Loading your account...')
        setStatusDescription(
          'This usually takes a moment. Keep this tab open while we finish sign in.',
        )
        const user = await completeOAuthLogin(token)
        if (!user) {
          throw new Error('oauth_finalize_failed')
        }

        navigate(redirectTo, { replace: true })
      } catch {
        navigate('/login', {
          replace: true,
          state: {
            oauthError: 'oauth_finalize_failed',
            ...(redirectTo ? { from: redirectTo } : {}),
          },
        })
      }
    }

    void finishOAuthLogin()
  }, [completeOAuthLogin, navigate])

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
