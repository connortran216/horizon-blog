import { AuthAccessResponse, LoginCredentials, LogoutResult } from '../types/auth.types'
import { AccessTokenStore, accessTokenStore } from './access-token.store'
import {
  AuthSessionCoordinator,
  AuthSessionMessage,
  authSessionCoordinator,
} from './auth-session-coordinator'
import { AuthTransport, authTransport } from './auth.transport'
import { SessionHint, sessionHint } from './session-hint'

export interface AuthSessionTransport {
  login(credentials: LoginCredentials): Promise<AuthAccessResponse>
  refresh(): Promise<AuthAccessResponse>
  logout(): Promise<void>
}

export interface BootstrapOptions {
  /**
   * The caller knows a session was just established outside this tab's
   * knowledge - the OAuth callback, where the backend set the refresh cookie
   * and redirected here - so the hint's absence must not skip the refresh.
   */
  expectSession?: boolean
}

export type AuthSessionEvent =
  | { type: 'access-installed' }
  | { type: 'signed-out'; reason: 'logout' | 'session-invalid' }

type AuthSessionListener = (event: AuthSessionEvent) => void

const defaultUnauthorizedDispatch = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
}

export class AuthSessionService {
  private refreshPromise: Promise<string> | null = null
  private invalidTransitionEmitted = false
  private readonly listeners = new Set<AuthSessionListener>()

  constructor(
    private readonly tokens: AccessTokenStore = accessTokenStore,
    private readonly transport: AuthSessionTransport = authTransport,
    private readonly coordinator: AuthSessionCoordinator = authSessionCoordinator,
    private readonly dispatchUnauthorized: () => void = defaultUnauthorizedDispatch,
    private readonly hint: SessionHint = sessionHint,
  ) {
    this.coordinator.subscribe((message) => this.handleCoordinatorMessage(message))
  }

  getAccessSnapshot() {
    return this.tokens.getSnapshot()
  }

  async login(credentials: LoginCredentials): Promise<AuthAccessResponse> {
    return this.installResponse(await this.transport.login(credentials), true)
  }

  installLegacyRegistrationResponse(response: AuthAccessResponse): AuthAccessResponse {
    return this.installResponse(response, true)
  }

  async bootstrap({ expectSession = false }: BootstrapOptions = {}): Promise<boolean> {
    /*
     * A visitor who has never signed in on this browser is the common case on
     * a public blog, and for them `/auth/refresh` is a guaranteed 401 that
     * still costs a full round-trip - measured at ~1.9s through Cloudflare and
     * the tunnel - in front of the first render.
     *
     * The trade-off: someone who clears localStorage while their refresh
     * cookie is still valid is treated as signed out until they sign in again.
     * That costs one login to one returning reader; the call it removes cost
     * every guest a round-trip on every page load.
     */
    if (!expectSession && !this.hint.hasSessionHint()) {
      return false
    }

    try {
      await this.refreshAccessToken()
      return true
    } catch {
      return false
    }
  }

  refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const startingVersion = this.tokens.getSnapshot().version
    this.refreshPromise = this.coordinator
      .runWithRefreshLock(async () => {
        const current = this.tokens.getSnapshot()
        if (current.token && current.version !== startingVersion) {
          return current.token
        }

        const installed = this.installResponse(await this.transport.refresh(), true)
        return this.resolveAccessToken(installed)
      })
      .catch((error: unknown) => {
        this.invalidateSession(true)
        throw error
      })
      .finally(() => {
        this.refreshPromise = null
      })

    return this.refreshPromise
  }

  async logout(): Promise<LogoutResult> {
    let serverRevoked = true

    try {
      await this.transport.logout()
    } catch {
      serverRevoked = false
    } finally {
      this.tokens.clear()
      this.hint.clearSessionHint()
      this.invalidTransitionEmitted = false
      this.coordinator.broadcastSignedOut('logout')
      this.notify({ type: 'signed-out', reason: 'logout' })
    }

    return { serverRevoked }
  }

  subscribe(listener: AuthSessionListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private installResponse(response: AuthAccessResponse, broadcast: boolean): AuthAccessResponse {
    const snapshot = this.tokens.install(this.resolveAccessToken(response), response.expires_in)
    this.invalidTransitionEmitted = false

    if (broadcast) {
      try {
        this.coordinator.broadcastAccess(snapshot)
      } catch (error) {
        this.tokens.clear()
        throw error
      }
    }

    this.hint.markSessionPresent()
    return response
  }

  private resolveAccessToken(response: AuthAccessResponse): string {
    const token = response.access_token || response.token
    if (!token) {
      throw new Error('Authentication response is missing access_token')
    }
    return token
  }

  private handleCoordinatorMessage(message: AuthSessionMessage): void {
    if (message.type === 'access') {
      this.tokens.installAbsolute(message.token, message.expiresAt)
      // A tab that learns about a session from a sibling needs the hint too,
      // or its next cold load would skip the refresh it is entitled to.
      this.hint.markSessionPresent()
      this.invalidTransitionEmitted = false
      this.notify({ type: 'access-installed' })
      return
    }

    this.tokens.clear()
    this.hint.clearSessionHint()
    if (message.reason === 'session-invalid') {
      this.emitUnauthorizedOnce()
    }
    this.notify({ type: 'signed-out', reason: message.reason })
  }

  private invalidateSession(broadcast: boolean): void {
    this.tokens.clear()
    this.hint.clearSessionHint()
    if (broadcast) {
      this.coordinator.broadcastSignedOut('session-invalid')
    }
    this.emitUnauthorizedOnce()
    this.notify({ type: 'signed-out', reason: 'session-invalid' })
  }

  private emitUnauthorizedOnce(): void {
    if (this.invalidTransitionEmitted) {
      return
    }
    this.invalidTransitionEmitted = true
    this.dispatchUnauthorized()
  }

  private notify(event: AuthSessionEvent): void {
    this.listeners.forEach((listener) => listener(event))
  }
}

export const authSessionService = new AuthSessionService()

export const createAuthSessionService = (
  tokens: AccessTokenStore,
  transport: AuthTransport,
  coordinator: AuthSessionCoordinator,
) => new AuthSessionService(tokens, transport, coordinator)
