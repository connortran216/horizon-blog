import { getRuntimeConfig } from '../../config/runtime'
import { ApiRequestOptions, RequestAuthMode } from '../types/auth.types'
import { authInterceptor, AuthInterceptor } from './auth.interceptor'
import { authSessionService } from './auth-session.service'
import { createRequestDeadline, isDeadlineTimeout } from './request-deadline'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Raised when a request never received a response within its deadline (see
 * `request-deadline.ts`) - e.g. a backend that drops packets instead of
 * refusing the connection. Extends `ApiError` (status `0`, meaning "no HTTP
 * response was ever received") so existing `error instanceof ApiError`
 * handling - error states, retry affordances - keeps working unchanged; a
 * caller can additionally check `instanceof ApiTimeoutError` if it wants to
 * say something more specific than a generic failure.
 */
export class ApiTimeoutError extends ApiError {
  constructor(public readonly timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`, 0)
    this.name = 'ApiTimeoutError'
  }
}

interface SessionRefreshPort {
  refreshAccessToken(): Promise<string>
}

type Fetcher = typeof fetch
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface InternalRequest {
  method: HttpMethod
  endpoint: string
  params?: Record<string, unknown>
  data?: unknown
  options?: ApiRequestOptions
}

export class ApiService {
  constructor(
    private readonly baseUrl: string = getRuntimeConfig().beHost,
    private readonly interceptor: AuthInterceptor = authInterceptor,
    private readonly sessions: SessionRefreshPort = authSessionService,
    private readonly fetcher: Fetcher = fetch,
  ) {}

  get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return this.request<T>({ method: 'GET', endpoint, params, options })
  }

  post<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>({ method: 'POST', endpoint, data, options })
  }

  put<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>({ method: 'PUT', endpoint, data, options })
  }

  delete<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>({ method: 'DELETE', endpoint, data, options })
  }

  patch<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>({ method: 'PATCH', endpoint, data, options })
  }

  private async request<T>(request: InternalRequest): Promise<T> {
    const authMode = request.options?.authMode ?? 'required'
    const attempted = this.interceptor.getAccessSnapshot()
    const response = await this.send(request, authMode, attempted.token)

    if (response.status !== 401 || authMode === 'transport' || !attempted.token) {
      return this.handleResponse<T>(response)
    }

    const current = this.interceptor.getAccessSnapshot()
    if (current.token && current.version !== attempted.version) {
      return this.handleResponse<T>(await this.send(request, authMode, current.token))
    }

    try {
      const refreshedToken = await this.sessions.refreshAccessToken()
      return this.handleResponse<T>(await this.send(request, authMode, refreshedToken))
    } catch {
      if (authMode === 'optional' && request.options?.allowGuestFallback) {
        return this.handleResponse<T>(await this.send(request, authMode, null))
      }

      return this.handleResponse<T>(response)
    }
  }

  private async send(
    request: InternalRequest,
    authMode: RequestAuthMode,
    accessToken: string | null,
  ): Promise<Response> {
    const isFormData = request.data instanceof FormData
    const deadline = createRequestDeadline({
      timeoutMs: request.options?.timeoutMs,
      signal: request.options?.signal,
    })

    try {
      return await this.fetcher.call(globalThis, this.buildUrl(request.endpoint, request.params), {
        method: request.method,
        credentials: 'include',
        headers: this.interceptor.getHeaders(isFormData, authMode, accessToken),
        body: this.buildBody(request.data),
        keepalive: request.options?.keepalive,
        signal: deadline.signal,
      })
    } catch (error) {
      if (isDeadlineTimeout(error)) {
        throw new ApiTimeoutError(deadline.timeoutMs)
      }
      throw error
    } finally {
      deadline.release()
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const url = new URL(endpoint, this.baseUrl)
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
    return url.toString()
  }

  private buildBody(data: unknown): BodyInit | undefined {
    if (data === undefined) {
      return undefined
    }
    if (data instanceof FormData) {
      const copy = new FormData()
      data.forEach((value, key) => copy.append(key, value))
      return copy
    }
    return JSON.stringify(data)
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = (await response.json()) as Record<string, unknown>
        if (typeof errorData.message === 'string' && errorData.message.length > 0) {
          errorMessage = errorData.message
        } else if (typeof errorData.error === 'string' && errorData.error.length > 0) {
          errorMessage = errorData.error
        } else if (
          typeof errorData.error === 'object' &&
          errorData.error !== null &&
          'message' in errorData.error &&
          typeof errorData.error.message === 'string'
        ) {
          errorMessage = errorData.error.message
        }
      } catch {
        errorMessage = response.statusText || errorMessage
      }
      throw new ApiError(errorMessage, response.status)
    }

    if (response.status === 204) {
      return {} as T
    }
    return response.json() as Promise<T>
  }
}

export const apiService = new ApiService()
