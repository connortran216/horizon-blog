import { User } from './common.types'
import { AuthorizationContext } from '../authorization/authorization'

/**
 * Authentication-specific types and interfaces
 */

// Authentication status
export enum AuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading',
}

export type AuthStatusType = AuthStatus

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
}

// Registration data
export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface RegistrationResult {
  pending: boolean
  message: string
  user?: User
}

export interface ApiAuthenticatedUser {
  id: number
  email: string
  name: string
  created_at?: string
  updated_at?: string
  authorization?: AuthorizationContext
}

export interface AuthAccessResponse {
  access_token?: string
  token?: string
  token_type: 'Bearer'
  expires_in: number
  data: ApiAuthenticatedUser
  message: string
}

export type RequestAuthMode = 'required' | 'optional' | 'transport'

export interface ApiRequestOptions {
  authMode?: RequestAuthMode
  allowGuestFallback?: boolean
  keepalive?: boolean
}

export interface LogoutResult {
  serverRevoked: boolean
}

// Authentication context state
export interface AuthState {
  user: User | null
  status: AuthStatus
  isLoading: boolean
  error: string | null
}

// Authentication actions
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<RegistrationResult>
  logout: () => Promise<LogoutResult>
  refreshUserProfile: () => Promise<User | null>
  clearError: () => void
}

// Complete authentication context
export interface AuthContextValue extends AuthState, AuthActions {}

// Authentication service interface
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<User>
  register(data: RegisterData): Promise<RegistrationResult>
  verifyEmail(token: string): Promise<void>
  resendVerification(email: string): Promise<string>
  requestPasswordReset(email: string): Promise<string>
  resetPassword(data: ResetPasswordData): Promise<string>
  restoreSession(): Promise<boolean>
  logout(): Promise<LogoutResult>
  getCurrentUser(): Promise<User | null>
  refreshToken(): Promise<boolean>
}

// Authentication errors
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

// Specific authentication error types
export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid username or password', 'INVALID_CREDENTIALS', 401)
  }
}

export class UserAlreadyExistsError extends AuthError {
  constructor(username: string) {
    super(`User ${username} already exists`, 'USER_ALREADY_EXISTS', 409)
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super('Your session has expired. Please log in again.', 'SESSION_EXPIRED', 401)
  }
}
