import { getRuntimeConfig } from '../../config/runtime'
import {
  AuthAccessResponse,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
} from '../types/auth.types'

interface MessageResponse {
  message: string
}

interface ErrorPayload {
  error?: string | { code?: string; message?: string }
  message?: string
}

export class AuthTransportError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'AuthTransportError'
  }
}

type Fetcher = typeof fetch

export class AuthTransport {
  constructor(
    private readonly baseUrl: string = getRuntimeConfig().beHost,
    private readonly fetcher: Fetcher = fetch,
  ) {}

  login(credentials: LoginCredentials): Promise<AuthAccessResponse> {
    return this.request<AuthAccessResponse>('/auth/login', credentials)
  }

  register(data: RegisterData): Promise<AuthAccessResponse> {
    return this.request<AuthAccessResponse>('/users', {
      name: data.username,
      email: data.email,
      password: data.password,
    })
  }

  refresh(): Promise<AuthAccessResponse> {
    return this.request<AuthAccessResponse>('/auth/refresh')
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout')
  }

  requestPasswordReset(email: string): Promise<MessageResponse> {
    return this.request<MessageResponse>('/auth/forgot-password', { email })
  }

  resetPassword(data: ResetPasswordData): Promise<MessageResponse> {
    return this.request<MessageResponse>('/auth/reset-password', {
      token: data.token,
      new_password: data.newPassword,
      confirm_password: data.confirmPassword,
    })
  }

  private async request<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.fetcher.call(globalThis, `${this.baseUrl}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
    })

    if (!response.ok) {
      throw await this.toError(response)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }

  private async toError(response: Response): Promise<AuthTransportError> {
    let payload: ErrorPayload = {}

    try {
      payload = (await response.json()) as ErrorPayload
    } catch {
      // Keep the public fallback below for empty/non-JSON failures.
    }

    const nestedError =
      typeof payload.error === 'object' && payload.error !== null ? payload.error : undefined
    const message =
      nestedError?.message ||
      payload.message ||
      (typeof payload.error === 'string' ? payload.error : undefined) ||
      response.statusText ||
      `HTTP ${response.status}`

    return new AuthTransportError(message, response.status, nestedError?.code)
  }
}

export const authTransport = new AuthTransport()
