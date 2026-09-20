import { describe, expect, it, vi } from 'vitest'

import { AccessTokenStore } from './access-token.store'
import { AuthSessionCoordinator, AuthSessionMessage } from './auth-session-coordinator'
import { AuthSessionService, AuthSessionTransport } from './auth-session.service'
import { SESSION_HINT_STORAGE_KEY, SessionHintStorage, createSessionHint } from './session-hint'

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

const createHintStorage = (seeded = false): SessionHintStorage => {
  const values = new Map<string, string>()
  if (seeded) {
    values.set(SESSION_HINT_STORAGE_KEY, '1')
  }

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

const hintOf = (storage: SessionHintStorage) => storage.getItem(SESSION_HINT_STORAGE_KEY)

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
    const service = new AuthSessionService(
      store,
      transport,
      createCoordinator(),
      undefined,
      createSessionHint(createHintStorage(true)),
    )

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

describe('AuthSessionService session hint', () => {
  it('skips the refresh round-trip for a visitor with no hint', async () => {
    const store = new AccessTokenStore()
    const transport = createTransport()
    const service = new AuthSessionService(
      store,
      transport,
      createCoordinator(),
      undefined,
      createSessionHint(createHintStorage()),
    )

    await expect(service.bootstrap()).resolves.toBe(false)
    expect(transport.refresh).not.toHaveBeenCalled()
    expect(store.getSnapshot().token).toBeNull()
  })

  it('still attempts the refresh when the hint is present', async () => {
    const store = new AccessTokenStore()
    const transport = createTransport()
    const service = new AuthSessionService(
      store,
      transport,
      createCoordinator(),
      undefined,
      createSessionHint(createHintStorage(true)),
    )

    await expect(service.bootstrap()).resolves.toBe(true)
    expect(transport.refresh).toHaveBeenCalledTimes(1)
  })

  it('attempts the refresh when storage cannot be read', async () => {
    const store = new AccessTokenStore()
    const transport = createTransport()
    const throwing: SessionHintStorage = {
      getItem: () => {
        throw new Error('storage is blocked')
      },
      setItem: () => {
        throw new Error('storage is blocked')
      },
      removeItem: () => {
        throw new Error('storage is blocked')
      },
    }
    const service = new AuthSessionService(
      store,
      transport,
      createCoordinator(),
      undefined,
      createSessionHint(throwing),
    )

    await expect(service.bootstrap()).resolves.toBe(true)
    expect(transport.refresh).toHaveBeenCalledTimes(1)
  })

  it('records the hint whenever an access token is installed', async () => {
    const storage = createHintStorage()
    const store = new AccessTokenStore()
    const transport = createTransport()
    const service = new AuthSessionService(
      store,
      transport,
      createCoordinator(),
      undefined,
      createSessionHint(storage),
    )

    await service.login({ email: 'user@example.com', password: 'password' })
    expect(hintOf(storage)).toBe('1')

    storage.removeItem(SESSION_HINT_STORAGE_KEY)
    service.installLegacyRegistrationResponse(response('register-token'))
    expect(hintOf(storage)).toBe('1')
  })

  it('clears the hint on logout', async () => {
    const storage = createHintStorage(true)
    const store = new AccessTokenStore()
    store.install('access-token', 900)
    const service = new AuthSessionService(
      store,
      createTransport(),
      createCoordinator(),
      undefined,
      createSessionHint(storage),
    )

    await service.logout()
    expect(hintOf(storage)).toBeNull()
  })

  it('clears the hint when a refresh proves the session invalid', async () => {
    const storage = createHintStorage(true)
    const store = new AccessTokenStore()
    store.install('expired-token', 1)
    const transport = createTransport()
    vi.mocked(transport.refresh).mockRejectedValue(new Error('refresh failed'))
    const service = new AuthSessionService(
      store,
      transport,
      createCoordinator(),
      vi.fn(),
      createSessionHint(storage),
    )

    await expect(service.refreshAccessToken()).rejects.toThrow('refresh failed')
    expect(hintOf(storage)).toBeNull()
  })

  it('follows a sibling tab in both directions', () => {
    const storage = createHintStorage()
    let deliver: (message: AuthSessionMessage) => void = () => undefined
    const coordinator = {
      runWithRefreshLock: vi.fn(),
      subscribe: vi.fn((listener: (message: AuthSessionMessage) => void) => {
        deliver = listener
        return () => undefined
      }),
      broadcastAccess: vi.fn(),
      broadcastSignedOut: vi.fn(),
    } as unknown as AuthSessionCoordinator
    const store = new AccessTokenStore()
    new AuthSessionService(
      store,
      createTransport(),
      coordinator,
      vi.fn(),
      createSessionHint(storage),
    )

    deliver({ type: 'access', sourceId: 'other-tab', token: 'shared-token', expiresAt: null })
    expect(hintOf(storage)).toBe('1')

    deliver({ type: 'signed-out', sourceId: 'other-tab', reason: 'logout' })
    expect(hintOf(storage)).toBeNull()
  })
})
