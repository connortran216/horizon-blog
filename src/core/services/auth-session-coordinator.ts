import { AccessTokenSnapshot } from './access-token.store'

export type AuthSessionMessage =
  | {
      type: 'access'
      sourceId: string
      token: string
      expiresAt: number | null
    }
  | {
      type: 'signed-out'
      sourceId: string
      reason: 'logout' | 'session-invalid'
    }

export interface BroadcastChannelPort {
  postMessage(message: AuthSessionMessage): void
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<AuthSessionMessage>) => void,
  ): void
  removeEventListener(
    type: 'message',
    listener: (event: MessageEvent<AuthSessionMessage>) => void,
  ): void
  close(): void
}

export interface LockManagerPort {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>
}

export class SessionCoordinationUnavailableError extends Error {
  constructor() {
    super('Cross-tab authentication coordination is unavailable')
    this.name = 'SessionCoordinationUnavailableError'
  }
}

type MessageListener = (message: AuthSessionMessage) => void

const randomTabId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export class AuthSessionCoordinator {
  private readonly listeners = new Set<MessageListener>()
  private readonly handleMessage = (event: MessageEvent<AuthSessionMessage>) => {
    const message = event.data
    if (!message || message.sourceId === this.sourceId) {
      return
    }

    if (message.type === 'access') {
      if (
        typeof message.token !== 'string' ||
        !message.token ||
        (message.expiresAt !== null && typeof message.expiresAt !== 'number')
      ) {
        return
      }
    } else if (
      message.type !== 'signed-out' ||
      (message.reason !== 'logout' && message.reason !== 'session-invalid')
    ) {
      return
    }

    this.listeners.forEach((listener) => listener(message))
  }

  constructor(
    private readonly locks: LockManagerPort | null,
    private readonly channel: BroadcastChannelPort | null,
    private readonly sourceId: string = randomTabId(),
  ) {
    this.channel?.addEventListener('message', this.handleMessage)
  }

  runWithRefreshLock<T>(work: () => Promise<T>): Promise<T> {
    if (!this.locks || !this.channel) {
      return Promise.reject(new SessionCoordinationUnavailableError())
    }

    return this.locks.request('horizon-blog-auth-refresh', async () => {
      // Give an access broadcast from the previous lock holder one task turn to arrive.
      await new Promise<void>((resolve) => setTimeout(resolve, 0))
      return work()
    })
  }

  subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  broadcastAccess(snapshot: AccessTokenSnapshot): void {
    if (!snapshot.token) {
      return
    }

    this.channel?.postMessage({
      type: 'access',
      sourceId: this.sourceId,
      token: snapshot.token,
      expiresAt: snapshot.expiresAt,
    })
  }

  broadcastSignedOut(reason: 'logout' | 'session-invalid'): void {
    try {
      this.channel?.postMessage({ type: 'signed-out', sourceId: this.sourceId, reason })
    } catch {
      // Local credential clearing must still finish when channel delivery fails.
    }
  }

  close(): void {
    this.channel?.removeEventListener('message', this.handleMessage)
    this.channel?.close()
    this.listeners.clear()
  }
}

const createBrowserCoordinator = (): AuthSessionCoordinator => {
  if (
    typeof window === 'undefined' ||
    typeof BroadcastChannel === 'undefined' ||
    typeof navigator === 'undefined' ||
    !navigator.locks
  ) {
    return new AuthSessionCoordinator(null, null)
  }

  try {
    return new AuthSessionCoordinator(
      navigator.locks as unknown as LockManagerPort,
      new BroadcastChannel('horizon-blog-auth-session'),
    )
  } catch {
    return new AuthSessionCoordinator(null, null)
  }
}

export const authSessionCoordinator = createBrowserCoordinator()
