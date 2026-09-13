/**
 * The MCP authorization bridge - migrated onto Horizon Design System v2
 * (release M5).
 *
 * Presentation only. `completeMcpAuthorization(requestId)` is called once, with
 * the same guard against a second call, and the only thing that comes back is a
 * `redirect_uri`. That is also the only thing this screen knows, which is why it
 * shows no client name, no scope list and no permission checkboxes: a consent
 * screen assembled out of values the server never sent would be an invention,
 * and on this page an invention is a phishing surface. If the authorization
 * model ever grows a real consent step, the server has to describe it first.
 *
 * Composed from `AuthPanel`, `PanelLoading`, `AuthAlert` and `Button`.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  ActionLink,
  AuthAlert,
  AuthPanel,
  Button,
  PanelLoading,
  Stack,
  Text,
} from '../../../design-system'
import { useAuth } from '../../../context/AuthContext'
import { AuthStatus } from '../../../core/types/auth.types'
import { McpAuthorizationCompletion, completeMcpAuthorization } from '../oauth.api'

type BridgeState = 'checking' | 'login_required' | 'connecting' | 'authorized' | 'failed'

interface McpAuthorizationSuccessProps {
  onReturnToClient: () => void
}

export const McpAuthorizationSuccess = ({ onReturnToClient }: McpAuthorizationSuccessProps) => (
  <Stack gap={4} width="100%">
    <AuthAlert
      tone="success"
      title="Authentication successful"
      detail="Your Horizon Blog MCP login is complete. Return to the MCP client to finish connecting."
    />

    {/*
     * The code lives in the redirect URI and is handed back by navigating, not
     * by putting a token on screen for someone to copy.
     */}
    <Button tone="primary" onClick={onReturnToClient}>
      Return to MCP client
    </Button>
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
        if (!result.redirectURI) {
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

  const returnToClient = () => {
    if (completion?.redirectURI) {
      window.location.href = completion.redirectURI
    }
  }

  return (
    <AuthPanel
      title="Connect Horizon MCP"
      description="We are preparing a secure authorization code for your MCP client."
      isSubmitting={isBusy}
    >
      {bridgeState === 'authorized' && completion ? (
        <McpAuthorizationSuccess onReturnToClient={returnToClient} />
      ) : bridgeState === 'failed' ? (
        <Stack gap={4}>
          <AuthAlert
            tone="error"
            title="Authorization failed"
            detail={errorMessage || 'Please restart the MCP connection and try again.'}
          />
          <ActionLink to="/login" state={{ from: returnPath }} weight="secondary">
            Sign in again
          </ActionLink>
        </Stack>
      ) : (
        <Stack gap={4} alignItems="center">
          <PanelLoading
            task={bridgeState === 'login_required' ? 'the sign-in screen' : 'your MCP connection'}
          />
          <Text recipe="body" textAlign="center">
            {bridgeState === 'login_required'
              ? 'You will come back here automatically after signing in.'
              : 'Keep this tab open while Horizon verifies your session.'}
          </Text>
        </Stack>
      )}
    </AuthPanel>
  )
}

export default McpAuthorizePage
