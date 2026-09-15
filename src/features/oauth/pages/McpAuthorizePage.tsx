/**
 * The MCP authorization bridge - migrated onto Horizon Design System v2
 * (release M5).
 *
 * This screen is the authorization server's side of an OAuth handoff: an MCP
 * client opened `/oauth/authorize?request_id=...` and is waiting for a code.
 * `completeMcpAuthorization(requestId)` is the one call that mints that code,
 * and it now fires from exactly one place - the "Allow access" press in
 * `McpAuthorizationConsent` - never from an effect that runs because a page
 * loaded and a session happened to be valid. A signed-in reader who is sent
 * this link by someone else must see a screen and choose, not be redirected
 * through it; `canStartAuthorization` (`../mcpAuthorize.logic`) is what keeps
 * that call from firing on a second click, a stale retry, or a reader who
 * backed onto this page after already being redirected away.
 *
 * `completeMcpAuthorization(requestId)` returns a `redirect_uri` and nothing
 * else - no client name, no scope, no logo. That is also all this screen
 * knows before that call, so the consent copy names no client and lists no
 * scope: a consent screen assembled out of values the server never sent would
 * be an invention, and on this page an invention is a phishing surface. What
 * it does say, because it is true and worth saying, is that the requesting
 * application's identity has not been verified. If the request needs to name
 * that application one day, the server has to send its identity first - see
 * `docs/backend/oauth-authorize-consent.md` for the endpoint shape this
 * screen is waiting on.
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
import {
  canStartAuthorization,
  mcpAuthorizationFailureMessage,
  mcpConsentCopy,
  mcpDeclineConfirmation,
  mcpMissingRequestMessage,
  type McpBridgeState,
} from '../mcpAuthorize.logic'

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

interface McpAuthorizationConsentProps {
  /** The last attempt failed. Shown as an alert above the same choice. */
  errorMessage?: string | null
  /** A request is in flight. Both controls are inert; "Allow access" shows a spinner. */
  isSubmitting: boolean
  onAllow: () => void
  onDecline: () => void
}

/**
 * The one screen in this flow that asks instead of acting.
 *
 * Two controls, and only one of them calls the network: "Allow access" is the
 * sole caller of `completeMcpAuthorization`, gated by `canStartAuthorization`
 * in the handler that owns it. "Don't allow" never reaches the API at all -
 * declining is a local decision, not a request the server needs to hear about,
 * and the fewer things a "no" has to succeed at, the more it can be trusted to
 * mean no.
 */
export const McpAuthorizationConsent = ({
  errorMessage,
  isSubmitting,
  onAllow,
  onDecline,
}: McpAuthorizationConsentProps) => {
  const copy = mcpConsentCopy()

  return (
    <Stack gap={4} width="100%">
      {errorMessage ? (
        <AuthAlert tone="error" title="Authorization failed" detail={errorMessage} />
      ) : null}

      <AuthAlert tone="permission" title={copy.title} detail={copy.unverifiedWarning} />
      <Text recipe="body">{copy.detail}</Text>

      <Stack direction="row" gap={3}>
        <Button
          tone="primary"
          onClick={onAllow}
          isLoading={isSubmitting}
          loadingLabel="Connecting your MCP client"
        >
          {copy.allowLabel}
        </Button>
        <Button tone="secondary" onClick={onDecline} isDisabled={isSubmitting}>
          {copy.declineLabel}
        </Button>
      </Stack>
    </Stack>
  )
}

const McpAuthorizePage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { status } = useAuth()
  // Guards the network call itself, synchronously, independent of React's
  // render timing - see `canStartAuthorization`'s doc for why the state check
  // alone is not quite enough for two `click` events inside one tick.
  const isRequestingRef = useRef(false)
  const requestId = useMemo(
    () => new URLSearchParams(location.search).get('request_id'),
    [location.search],
  )
  const returnPath = `${location.pathname}${location.search}`
  const [bridgeState, setBridgeState] = useState<McpBridgeState>('checking')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [completion, setCompletion] = useState<McpAuthorizationCompletion | null>(null)

  useEffect(() => {
    if (!requestId) {
      setBridgeState('missing_request')
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

    // Authenticated, with a request to act on: hand control to the reader.
    // Only advances out of `checking` - a state the reader has already moved
    // past (by choosing, or by this effect having already advanced it once)
    // is never reset back to `awaiting_consent` by a later run of this effect.
    setBridgeState((current) => (current === 'checking' ? 'awaiting_consent' : current))
  }, [navigate, requestId, returnPath, status])

  const handleAllow = async () => {
    if (!requestId || isRequestingRef.current || !canStartAuthorization(bridgeState)) {
      return
    }

    isRequestingRef.current = true
    setErrorMessage(null)
    setBridgeState('connecting')

    try {
      const result = await completeMcpAuthorization(requestId)
      if (!result.redirectURI) {
        throw new Error('Authorization callback is missing.')
      }

      setCompletion(result)
      setBridgeState('authorized')
    } catch (error) {
      console.error('MCP authorization failed', error)
      setErrorMessage(mcpAuthorizationFailureMessage())
      setBridgeState('failed')
    } finally {
      isRequestingRef.current = false
    }
  }

  const handleDecline = () => {
    if (!canStartAuthorization(bridgeState)) {
      return
    }

    setBridgeState('declined')
  }

  const isBusy =
    bridgeState === 'checking' || bridgeState === 'login_required' || bridgeState === 'connecting'

  const returnToClient = () => {
    if (completion?.redirectURI) {
      window.location.href = completion.redirectURI
    }
  }

  const description =
    bridgeState === 'awaiting_consent' || bridgeState === 'failed' || bridgeState === 'connecting'
      ? 'Review the request below before continuing.'
      : 'We are preparing a secure authorization code for your MCP client.'

  return (
    <AuthPanel title="Connect Horizon MCP" description={description} isSubmitting={isBusy}>
      {bridgeState === 'authorized' && completion ? (
        <McpAuthorizationSuccess onReturnToClient={returnToClient} />
      ) : bridgeState === 'declined' ? (
        <Stack gap={4}>
          <AuthAlert tone="info" title="Access not granted" detail={mcpDeclineConfirmation()} />
          <ActionLink to="/" weight="secondary">
            Return to Horizon
          </ActionLink>
        </Stack>
      ) : bridgeState === 'missing_request' ? (
        <Stack gap={4}>
          <AuthAlert
            tone="error"
            title="Authorization link is invalid"
            detail={mcpMissingRequestMessage()}
          />
          <ActionLink to="/" weight="secondary">
            Return to Horizon
          </ActionLink>
        </Stack>
      ) : bridgeState === 'awaiting_consent' ||
        bridgeState === 'connecting' ||
        bridgeState === 'failed' ? (
        <McpAuthorizationConsent
          errorMessage={bridgeState === 'failed' ? errorMessage : null}
          isSubmitting={bridgeState === 'connecting'}
          onAllow={handleAllow}
          onDecline={handleDecline}
        />
      ) : (
        <Stack gap={4} alignItems="center">
          <PanelLoading
            task={bridgeState === 'login_required' ? 'the sign-in screen' : 'your session'}
          />
          <Text recipe="body" textAlign="center">
            {bridgeState === 'login_required'
              ? 'You will come back here automatically after signing in.'
              : 'Checking your Horizon session.'}
          </Text>
        </Stack>
      )}
    </AuthPanel>
  )
}

export default McpAuthorizePage
