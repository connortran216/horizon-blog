export interface AccessTokenSnapshot {
  token: string | null
  expiresAt: number | null
  version: number
}

export class AccessTokenStore {
  private token: string | null = null
  private expiresAt: number | null = null
  private version = 0

  constructor(private readonly now: () => number = Date.now) {}

  getSnapshot(): AccessTokenSnapshot {
    return {
      token: this.token,
      expiresAt: this.expiresAt,
      version: this.version,
    }
  }

  install(token: string, expiresInSeconds?: number): AccessTokenSnapshot {
    const expiresAt =
      typeof expiresInSeconds === 'number' && Number.isFinite(expiresInSeconds)
        ? this.now() + Math.max(0, expiresInSeconds) * 1_000
        : null

    return this.installAbsolute(token, expiresAt)
  }

  installAbsolute(token: string, expiresAt: number | null): AccessTokenSnapshot {
    if (!token.trim()) {
      throw new Error('Access token is required')
    }

    this.token = token
    this.expiresAt = expiresAt
    this.version += 1
    return this.getSnapshot()
  }

  clear(): AccessTokenSnapshot {
    this.token = null
    this.expiresAt = null
    this.version += 1
    return this.getSnapshot()
  }
}

export const accessTokenStore = new AccessTokenStore()
