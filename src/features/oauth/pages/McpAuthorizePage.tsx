import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Code,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoadingSignal } from '../../../components/core/animations/LoadingState'
import { useAuth } from '../../../context/AuthContext'
import { AuthStatus } from '../../../core/types/auth.types'
import AuthShell from '../../auth/components/AuthShell'
import { McpAuthorizationCompletion, completeMcpAuthorization } from '../oauth.api'

type BridgeState = 'checking' | 'login_required' | 'connecting' | 'authorized' | 'failed'

interface McpAuthorizationSuccessProps {
  bearerToken: string
  copied: boolean
  onCopy: () => void
  onReturnToClient: () => void
}

export const McpAuthorizationSuccess = ({
  bearerToken,
  copied,
  onCopy,
  onReturnToClient,
}: McpAuthorizationSuccessProps) => (
  <Stack spacing="4" align="stretch" w="full" maxW="lg" textAlign="left">
    <Alert status="success" borderRadius="xl" alignItems="flex-start">
      <AlertIcon mt="1" />
      <Box>
        <AlertTitle>Authentication successful</AlertTitle>
        <AlertDescription>
          Your Horizon Blog MCP login is complete. Copy this bearer token if the active Codex
          session cannot refresh credentials automatically.
        </AlertDescription>
      </Box>
    </Alert>

    <Box>
      <Text color="text.primary" fontSize="sm" fontWeight="semibold" mb="2">
        Bearer token
      </Text>
      <Textarea
        value={bearerToken}
        readOnly
        minH="32"
        fontFamily="mono"
        fontSize="xs"
        borderColor="border.default"
        bg="bg.tertiary"
      />
      <Text color="text.tertiary" fontSize="xs" mt="2">
        Use this as <Code>Authorization: Bearer &lt;token&gt;</Code> when a stale MCP session needs
        manual recovery.
      </Text>
    </Box>

    <Stack direction={{ base: 'column', sm: 'row' }} spacing="3">
      <Button onClick={onCopy}>{copied ? 'Token copied' : 'Copy token'}</Button>
      <Button variant="outline" onClick={onReturnToClient}>
        Return to MCP client
      </Button>
    </Stack>
  </Stack>
)

const McpAuthorizePage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { status } = useAuth()
  const handledRef = useRef(false)
  const requestId = useMemo(
    () => new URLSearchParams(location.search).get('request_id'),
    [location.search],
  )
  const returnPath = `${location.pathname}${location.search}`
  const [bridgeState, setBridgeState] = useState<BridgeState>('checking')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [completion, setCompletion] = useState<McpAuthorizationCompletion | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!requestId) {
      setBridgeState('failed')
      setErrorMessage('Missing authorization request. Please restart the MCP connection.')
      return
    }

    if (status === AuthStatus.LOADING) {
      setBridgeState('checking')
      return
    }

    if (status === AuthStatus.UNAUTHENTICATED) {
      setBridgeState('login_required')
      navigate('/login', { replace: true, state: { from: returnPath } })
      return
    }

    if (handledRef.current) {
      return
    }
    handledRef.current = true

    const finishAuthorization = async () => {
      try {
        setBridgeState('connecting')
        const result = await completeMcpAuthorization(requestId)
        if (!result.redirectURI || !result.accessToken) {
          throw new Error('Authorization callback is missing.')
        }

        setCompletion(result)
        setBridgeState('authorized')
      } catch (error) {
        handledRef.current = false
        setBridgeState('failed')
        setErrorMessage(error instanceof Error ? error.message : 'Authorization failed.')
      }
    }

    void finishAuthorization()
  }, [navigate, requestId, returnPath, status])

  const isBusy =
    bridgeState === 'checking' || bridgeState === 'login_required' || bridgeState === 'connecting'

  const bearerToken = completion
    ? `${completion.tokenType || 'Bearer'} ${completion.accessToken}`.trim()
    : ''

  const copyToken = async () => {
    if (!bearerToken || !navigator.clipboard?.writeText) {
      return
    }

    await navigator.clipboard.writeText(bearerToken)
    setCopied(true)
  }

  const returnToClient = () => {
    if (completion?.redirectURI) {
      window.location.href = completion.redirectURI
    }
  }

  return (
    <AuthShell
      title="Connect Horizon MCP"
      description="We are preparing a secure authorization code for your MCP client."
    >
      <Stack spacing="5" align="center" py={{ base: '6', md: '8' }} textAlign="center">
        {isBusy ? (
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
        ) : null}

        {bridgeState === 'authorized' && completion ? (
          <McpAuthorizationSuccess
            bearerToken={bearerToken}
            copied={copied}
            onCopy={copyToken}
            onReturnToClient={returnToClient}
          />
        ) : bridgeState === 'failed' ? (
          <Alert status="error" borderRadius="xl" alignItems="flex-start" textAlign="left">
            <AlertIcon mt="1" />
            <Box>
              <AlertTitle>Authorization failed</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Please restart the MCP connection and try again.'}
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <Box maxW="sm">
            <Text color="text.primary" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="semibold">
              {bridgeState === 'login_required' ? 'Login required' : 'Connecting your account...'}
            </Text>
            <Text color="text.secondary" fontSize="sm" mt="2" lineHeight="tall">
              {bridgeState === 'login_required'
                ? 'You will come back here automatically after signing in.'
                : 'Keep this tab open while Horizon verifies your session.'}
            </Text>
          </Box>
        )}

        {bridgeState === 'failed' ? (
          <Button
            variant="outline"
            onClick={() => navigate('/login', { state: { from: returnPath } })}
          >
            Sign in again
          </Button>
        ) : null}
      </Stack>
    </AuthShell>
  )
}

export default McpAuthorizePage
