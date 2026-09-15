import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AccessTokenStore } from './access-token.store'
import { ApiError, ApiService, ApiTimeoutError } from './api.service'
import { AuthInterceptor } from './auth.interceptor'
import { DEFAULT_REQUEST_TIMEOUT_MS } from './request-deadline'

/**
 * A fetcher that mimics real `fetch`'s abort contract: it never settles on
 * its own, and rejects with `init.signal.reason` once that signal fires.
 * This is how a request to a host that drops packets (rather than refusing
 * the connection) actually behaves - nothing but the deadline ends it.
 */
const neverRespondingFetcher = () =>
  vi.fn<typeof fetch>(
    (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal!.reason))
      }),
  )

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('ApiService authentication pipeline', () => {
  it('calls a receiver-sensitive fetcher with the global receiver', async () => {
    const fetcher = vi.fn(async function (
      this: typeof globalThis,
      _input: RequestInfo | URL,
      _init?: RequestInit,
    ) {
      if (this !== globalThis) {
        throw new TypeError('Illegal invocation')
      }
      return jsonResponse(200, { data: ['published'] })
    })
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(new AccessTokenStore()),
      { refreshAccessToken: vi.fn() },
      fetcher,
    )

    await expect(api.get('/posts')).resolves.toEqual({ data: ['published'] })
  })

  it('refreshes a 401 once and reconstructs a JSON mutation with the new token', async () => {
    const tokens = new AccessTokenStore()
    tokens.install('expired-token', 1)
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { error: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }))
    const refreshAccessToken = vi.fn(async () => {
      tokens.install('rotated-token', 900)
      return 'rotated-token'
    })
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(tokens),
      { refreshAccessToken },
      fetcher,
    )

    await expect(api.post('/posts', { title: 'Retry me' })).resolves.toEqual({ ok: true })

    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      credentials: 'include',
      body: JSON.stringify({ title: 'Retry me' }),
      headers: expect.objectContaining({ Authorization: 'Bearer expired-token' }),
    })
    expect(fetcher.mock.calls[1][1]).toMatchObject({
      body: JSON.stringify({ title: 'Retry me' }),
      headers: expect.objectContaining({ Authorization: 'Bearer rotated-token' }),
    })
  })

  it('rebuilds FormData for its one allowed retry', async () => {
    const tokens = new AccessTokenStore()
    tokens.install('expired-token', 1)
    const bodies: FormData[] = []
    const fetcher = vi.fn<typeof fetch>(async (_input, init) => {
      bodies.push(init?.body as FormData)
      return bodies.length === 1
        ? jsonResponse(401, { error: 'expired' })
        : jsonResponse(200, { ok: true })
    })
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(tokens),
      {
        refreshAccessToken: vi.fn(async () => {
          tokens.install('rotated-token', 900)
          return 'rotated-token'
        }),
      },
      fetcher,
    )
    const form = new FormData()
    form.append('title', 'Upload')

    await api.post('/media', form)

    expect(bodies).toHaveLength(2)
    expect(bodies[0]).not.toBe(bodies[1])
    expect(bodies[1].get('title')).toBe('Upload')
  })

  it.each(['put', 'patch', 'delete'] as const)('retries %s at most once', async (method) => {
    const tokens = new AccessTokenStore()
    tokens.install('expired-token', 1)
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { error: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }))
    const refreshAccessToken = vi.fn(async () => {
      tokens.install('rotated-token', 900)
      return 'rotated-token'
    })
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(tokens),
      { refreshAccessToken },
      fetcher,
    )

    await expect(api[method]('/resource/1', { value: method })).resolves.toEqual({ ok: true })
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
  })

  it('uses a newer in-memory token without rotating a second time', async () => {
    const tokens = new AccessTokenStore()
    tokens.install('old-token', 1)
    const refreshAccessToken = vi.fn()
    const fetcher = vi.fn<typeof fetch>(async () => {
      if (fetcher.mock.calls.length === 1) {
        tokens.install('newer-token', 900)
        return jsonResponse(401, { error: 'expired' })
      }
      return jsonResponse(200, { ok: true })
    })
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(tokens),
      { refreshAccessToken },
      fetcher,
    )

    await api.get('/users/me')

    expect(refreshAccessToken).not.toHaveBeenCalled()
    expect(fetcher.mock.calls[1][1]?.headers).toEqual(
      expect.objectContaining({ Authorization: 'Bearer newer-token' }),
    )
  })

  it('never refreshes or clears access state for a 403', async () => {
    const tokens = new AccessTokenStore()
    tokens.install('valid-token', 900)
    const refreshAccessToken = vi.fn()
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(tokens),
      { refreshAccessToken },
      vi.fn().mockResolvedValue(jsonResponse(403, { error: 'forbidden' })),
    )

    await expect(api.get('/admin/access')).rejects.toMatchObject({ status: 403 })
    expect(refreshAccessToken).not.toHaveBeenCalled()
    expect(tokens.getSnapshot().token).toBe('valid-token')
  })

  it('falls back to a guest request only when optional mode explicitly allows it', async () => {
    const tokens = new AccessTokenStore()
    tokens.install('stale-token', 1)
    const refreshAccessToken = vi.fn().mockRejectedValue(new Error('session invalid'))
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { error: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { data: ['public'] }))
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(tokens),
      { refreshAccessToken },
      fetcher,
    )

    await expect(
      api.get('/posts', undefined, { authMode: 'optional', allowGuestFallback: true }),
    ).resolves.toEqual({ data: ['public'] })
    expect(fetcher.mock.calls[1][1]?.headers).not.toEqual(
      expect.objectContaining({ Authorization: expect.anything() }),
    )
  })

  it('does not recurse for transport-mode requests', async () => {
    const tokens = new AccessTokenStore()
    tokens.install('token', 900)
    const refreshAccessToken = vi.fn()
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(401, { error: 'invalid' }))
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(tokens),
      { refreshAccessToken },
      fetcher,
    )

    await expect(
      api.post('/auth/refresh', undefined, { authMode: 'transport' }),
    ).rejects.toMatchObject({ status: 401 })
    expect(refreshAccessToken).not.toHaveBeenCalled()
    expect(fetcher.mock.calls[0][1]?.headers).not.toEqual(
      expect.objectContaining({ Authorization: expect.anything() }),
    )
  })
})

describe('ApiService request deadline', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('rejects with a retryable ApiTimeoutError once a hung request outlives the default budget', async () => {
    const fetcher = neverRespondingFetcher()
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(new AccessTokenStore()),
      { refreshAccessToken: vi.fn() },
      fetcher,
    )

    const pending = api.get('/series')
    const assertion = expect(pending).rejects.toBeInstanceOf(ApiTimeoutError)

    await vi.advanceTimersByTimeAsync(DEFAULT_REQUEST_TIMEOUT_MS)
    await assertion

    // ApiTimeoutError extends ApiError with status 0, so every existing
    // `error instanceof ApiError` / `error.status` consumer (e.g.
    // usePublicSeriesList's getPublicSeriesListError) keeps working as-is.
    await pending.catch((error: unknown) => {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).status).toBe(0)
    })
  })

  it('does not fire before the deadline elapses', async () => {
    const fetcher = neverRespondingFetcher()
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(new AccessTokenStore()),
      { refreshAccessToken: vi.fn() },
      fetcher,
    )

    const settled = vi.fn()
    void api.get('/series').then(settled, settled)

    await vi.advanceTimersByTimeAsync(DEFAULT_REQUEST_TIMEOUT_MS - 1)

    expect(settled).not.toHaveBeenCalled()
  })

  it('honors a per-request timeoutMs override for requests with a different budget (e.g. uploads)', async () => {
    const fetcher = neverRespondingFetcher()
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(new AccessTokenStore()),
      { refreshAccessToken: vi.fn() },
      fetcher,
    )

    const pending = api.post('/posts/1/media', new FormData(), { timeoutMs: 60_000 })
    const settled = vi.fn()
    void pending.catch(settled)

    await vi.advanceTimersByTimeAsync(DEFAULT_REQUEST_TIMEOUT_MS)
    expect(settled).not.toHaveBeenCalled()

    const assertion = expect(pending).rejects.toBeInstanceOf(ApiTimeoutError)
    await vi.advanceTimersByTimeAsync(60_000 - DEFAULT_REQUEST_TIMEOUT_MS)
    await assertion
  })

  it('surfaces a caller-driven abort (component unmount / navigation) as a plain AbortError, not an ApiTimeoutError', async () => {
    const fetcher = neverRespondingFetcher()
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(new AccessTokenStore()),
      { refreshAccessToken: vi.fn() },
      fetcher,
    )
    const controller = new AbortController()

    const pending = api.get('/series', undefined, { signal: controller.signal })
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' })

    controller.abort()
    await assertion

    // It must not have been reinterpreted as a timeout failure.
    await pending.catch((error: unknown) => {
      expect(error).not.toBeInstanceOf(ApiTimeoutError)
    })
  })

  it('still resolves as a timeout when the deadline wins a race against a caller signal that never fires', async () => {
    const fetcher = neverRespondingFetcher()
    const api = new ApiService(
      'https://api.example.com',
      new AuthInterceptor(new AccessTokenStore()),
      { refreshAccessToken: vi.fn() },
      fetcher,
    )
    const controller = new AbortController()

    const pending = api.get('/series', undefined, { signal: controller.signal })
    const assertion = expect(pending).rejects.toBeInstanceOf(ApiTimeoutError)

    await vi.advanceTimersByTimeAsync(DEFAULT_REQUEST_TIMEOUT_MS)
    await assertion
  })
})
