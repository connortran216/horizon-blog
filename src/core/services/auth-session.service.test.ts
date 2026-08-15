import { describe, expect, it, vi } from 'vitest'

import { AccessTokenStore } from './access-token.store'
import { AuthSessionCoordinator } from './auth-session-coordinator'
import { AuthSessionService, AuthSessionTransport } from './auth-session.service'

const response = (token: string) => ({
  access_token: token,
  token_type: 'Bearer' as const,
  expires_in: 900,
  data: { id: 1, email: 'user@example.com', name: 'Example' },
  message: 'Authenticated',
})

const createCoordinator = (beforeWork?: () => void) =>
  ({
    runWithRefreshLock: vi.fn(async (work: () => Promise<string>) => {
      beforeWork?.()
      return work()
    }),
    subscribe: vi.fn(() => () => undefined),
    broadcastAccess: vi.fn(),
    broadcastSignedOut: vi.fn(),
  }) as unknown as AuthSessionCoordinator

const createTransport = (): AuthSessionTransport => ({
  login: vi.fn().mockResolvedValue(response('login-token')),
  refresh: vi.fn().mockResolvedValue(response('refresh-token')),
  logout: vi.fn().mockResolvedValue(undefined),
})

describe('AuthSessionService', () => {
  it('installs login access only in the memory store', async () => {
    const store = new AccessTokenStore()
    const transport = createTransport()
    const service = new AuthSessionService(store, transport, createCoordinator())

    await service.login({ email: 'user@example.com', password: 'password' })
    expect(store.getSnapshot().token).toBe('login-token')

    service.installLegacyRegistrationResponse(response('register-token'))
    expect(store.getSnapshot().token).toBe('register-token')
  })

  it('bootstraps through refresh and accepts the rollout token alias', async () => {
    const store = new AccessTokenStore()
    const transport = createTransport()
    vi.mocked(transport.refresh).mockResolvedValue({
      ...response('ignored'),
      access_token: undefined,
      token: 'compatibility-token',
    })
    const service = new AuthSessionService(store, transport, createCoordinator())

    await expect(service.bootstrap()).resolves.toBe(true)
    expect(store.getSnapshot().token).toBe('compatibility-token')
  })

  it('coalesces concurrent refresh calls into one transport rotation', async () => {
    const store = new AccessTokenStore()
    store.install('expired-token', 1)
    const transport = createTransport()
    let resolveRefresh!: (value: ReturnType<typeof response>) => void
    vi.mocked(transport.refresh).mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve
      }),
    )
    const service = new AuthSessionService(store, transport, createCoordinator())

    const first = service.refreshAccessToken()
    const second = service.refreshAccessToken()
    resolveRefresh(response('rotated-token'))

    await expect(Promise.all([first, second])).resolves.toEqual(['rotated-token', 'rotated-token'])
    expect(transport.refresh).toHaveBeenCalledTimes(1)
  })

  it('uses a token installed by another tab instead of rotating again', async () => {
    const store = new AccessTokenStore()
    store.install('expired-token', 1)
    const transport = createTransport()
    const coordinator = createCoordinator(() => store.install('broadcast-token', 900))
    const service = new AuthSessionService(store, transport, coordinator)

    await expect(service.refreshAccessToken()).resolves.toBe('broadcast-token')
    expect(transport.refresh).not.toHaveBeenCalled()
  })

  it('emits one session-invalid transition for a shared failed refresh', async () => {
    const store = new AccessTokenStore()
    store.install('expired-token', 1)
    const transport = createTransport()
    const failure = new Error('refresh failed')
    vi.mocked(transport.refresh).mockRejectedValue(failure)
    const onUnauthorized = vi.fn()
    const service = new AuthSessionService(store, transport, createCoordinator(), onUnauthorized)

    const results = await Promise.allSettled([
      service.refreshAccessToken(),
      service.refreshAccessToken(),
    ])

    expect(results.every((result) => result.status === 'rejected')).toBe(true)
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot().token).toBeNull()
  })

  it('always clears local state and reports uncertain server logout', async () => {
    const store = new AccessTokenStore()
    store.install('access-token', 900)
    const transport = createTransport()
    vi.mocked(transport.logout).mockRejectedValue(new Error('offline'))
    const coordinator = createCoordinator()
    const service = new AuthSessionService(store, transport, coordinator)

    await expect(service.logout()).resolves.toEqual({ serverRevoked: false })
    expect(store.getSnapshot().token).toBeNull()
    expect(coordinator.broadcastSignedOut).toHaveBeenCalledWith('logout')
  })

  it('reports confirmed server revocation after successful logout', async () => {
    const store = new AccessTokenStore()
    store.install('access-token', 900)
    const transport = createTransport()
    const service = new AuthSessionService(store, transport, createCoordinator())

    await expect(service.logout()).resolves.toEqual({ serverRevoked: true })
    expect(transport.logout).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot().token).toBeNull()
  })
})
