import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthTransport } from './auth.transport'

const accessResponse = {
  access_token: 'access-token',
  token_type: 'Bearer' as const,
  expires_in: 900,
  data: { id: 1, email: 'user@example.com', name: 'Example' },
  message: 'Authenticated',
}

describe('AuthTransport', () => {
  afterEach(() => vi.restoreAllMocks())

  it('uses credentialed raw fetch without an Authorization header', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(accessResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const transport = new AuthTransport('https://api.example.com', fetcher)

    await expect(transport.refresh()).resolves.toEqual(accessResponse)

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.example.com/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: expect.not.objectContaining({ Authorization: expect.anything() }),
      }),
    )
  })

  it('posts login credentials through the non-retrying transport contract', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(accessResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const transport = new AuthTransport('https://api.example.com', fetcher)

    await transport.login({ email: 'user@example.com', password: 'password' })

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.example.com/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email: 'user@example.com', password: 'password' }),
      }),
    )
  })

  it('maps nested stable authentication failures without exposing response secrets', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: 'AUTH_SESSION_INVALID', message: 'Sign in again to continue.' },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const transport = new AuthTransport('https://api.example.com', fetcher)

    await expect(transport.refresh()).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: 'AUTH_SESSION_INVALID',
        message: 'Sign in again to continue.',
      }),
    )
  })

  it('accepts an idempotent empty logout response', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    const transport = new AuthTransport('https://api.example.com', fetcher)

    await expect(transport.logout()).resolves.toBeUndefined()
  })
})
