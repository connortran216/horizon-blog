import { describe, expect, it, vi } from 'vitest'

import {
  AuthSessionCoordinator,
  AuthSessionMessage,
  BroadcastChannelPort,
  LockManagerPort,
} from './auth-session-coordinator'
import { AccessTokenStore } from './access-token.store'
import { AuthSessionService, AuthSessionTransport } from './auth-session.service'

class FakeChannel implements BroadcastChannelPort {
  listeners = new Set<(event: MessageEvent<AuthSessionMessage>) => void>()
  posted: AuthSessionMessage[] = []

  postMessage(message: AuthSessionMessage) {
    this.posted.push(message)
  }

  addEventListener(_type: 'message', listener: (event: MessageEvent<AuthSessionMessage>) => void) {
    this.listeners.add(listener)
  }

  removeEventListener(
    _type: 'message',
    listener: (event: MessageEvent<AuthSessionMessage>) => void,
  ) {
    this.listeners.delete(listener)
  }

  emit(message: AuthSessionMessage) {
    this.listeners.forEach((listener) =>
      listener({ data: message } as MessageEvent<AuthSessionMessage>),
    )
  }

  close() {}
}

class ChannelHub {
  channels = new Set<HubChannel>()

  create(): HubChannel {
    const channel = new HubChannel(this)
    this.channels.add(channel)
    return channel
  }

  send(sender: HubChannel, message: AuthSessionMessage) {
    this.channels.forEach((channel) => {
      if (channel !== sender) channel.emit(message)
    })
  }
}

class HubChannel extends FakeChannel {
  constructor(private readonly hub: ChannelHub) {
    super()
  }

  override postMessage(message: AuthSessionMessage) {
    super.postMessage(message)
    this.hub.send(this, message)
  }
}

class SerialLockManager implements LockManagerPort {
  private tail: Promise<unknown> = Promise.resolve()

  request<T>(_name: string, callback: () => Promise<T>): Promise<T> {
    const result = this.tail.then(callback)
    this.tail = result.catch(() => undefined)
    return result
  }
}

describe('AuthSessionCoordinator', () => {
  it('fails closed when browser coordination is unavailable', async () => {
    const coordinator = new AuthSessionCoordinator(null, null)
    const rotate = vi.fn()

    await expect(coordinator.runWithRefreshLock(rotate)).rejects.toThrow(
      'Cross-tab authentication coordination is unavailable',
    )
    expect(rotate).not.toHaveBeenCalled()
  })

  it('runs refresh work through the named exclusive lock', async () => {
    const request = vi.fn(async (_name: string, callback: () => Promise<string>) => callback())
    const channel = new FakeChannel()
    const coordinator = new AuthSessionCoordinator({ request } as LockManagerPort, channel, 'tab-a')

    await expect(coordinator.runWithRefreshLock(async () => 'rotated')).resolves.toBe('rotated')
    expect(request).toHaveBeenCalledWith('horizon-blog-auth-refresh', expect.any(Function))
  })

  it('broadcasts only the typed ephemeral access state', () => {
    const channel = new FakeChannel()
    const coordinator = new AuthSessionCoordinator(
      { request: vi.fn() } as unknown as LockManagerPort,
      channel,
      'tab-a',
    )

    coordinator.broadcastAccess({ token: 'access-token', expiresAt: 10_000, version: 2 })

    expect(channel.posted).toEqual([
      {
        type: 'access',
        sourceId: 'tab-a',
        token: 'access-token',
        expiresAt: 10_000,
      },
    ])
    expect(JSON.stringify(channel.posted)).not.toContain('refresh')
  })

  it('allows two tabs to share one rotating refresh operation', async () => {
    const locks = new SerialLockManager()
    const hub = new ChannelHub()
    const firstStore = new AccessTokenStore()
    const secondStore = new AccessTokenStore()
    firstStore.install('expired-a', 1)
    secondStore.install('expired-b', 1)
    const refresh = vi.fn().mockResolvedValue({
      access_token: 'rotated-token',
      token_type: 'Bearer' as const,
      expires_in: 900,
      data: { id: 1, email: 'user@example.com', name: 'Example' },
      message: 'Authenticated',
    })
    const transport = {
      login: vi.fn(),
      register: vi.fn(),
      refresh,
      logout: vi.fn(),
    } as unknown as AuthSessionTransport
    const first = new AuthSessionService(
      firstStore,
      transport,
      new AuthSessionCoordinator(locks, hub.create(), 'tab-a'),
    )
    const second = new AuthSessionService(
      secondStore,
      transport,
      new AuthSessionCoordinator(locks, hub.create(), 'tab-b'),
    )

    await expect(
      Promise.all([first.refreshAccessToken(), second.refreshAccessToken()]),
    ).resolves.toEqual(['rotated-token', 'rotated-token'])
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(secondStore.getSnapshot().token).toBe('rotated-token')
  })
})
