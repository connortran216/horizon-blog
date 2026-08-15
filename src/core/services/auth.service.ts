import { User } from '../types/common.types'
import {
  ApiAuthenticatedUser,
  AuthAccessResponse,
  AuthError,
  IAuthService,
  InvalidCredentialsError,
  LoginCredentials,
  LogoutResult,
  RegisterData,
  RegistrationResult,
  ResetPasswordData,
  UserAlreadyExistsError,
} from '../types/auth.types'
import { AuthSessionService, authSessionService } from './auth-session.service'
import { AuthTransport, AuthTransportError, authTransport } from './auth.transport'
import { isAuthorizationContext } from '../authorization/authorization'
import { getPasswordPolicyError } from '../utils/passwordPolicy'

export class AuthService implements IAuthService {
  constructor(
    private readonly sessions: AuthSessionService = authSessionService,
    private readonly transport: AuthTransport = authTransport,
  ) {}

  async login(credentials: LoginCredentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new InvalidCredentialsError()
    }

    try {
      const response = await this.sessions.login(credentials)
      return this.transformApiUserToUser(response.data)
    } catch (error: unknown) {
      if (error instanceof AuthTransportError && error.status === 401) {
        throw new InvalidCredentialsError()
      }
      throw this.toAuthError(error, 'Login failed. Please try again.', 'LOGIN_FAILED')
    }
  }

  async register(data: RegisterData): Promise<RegistrationResult> {
    this.validateRegistrationData(data)

    try {
      const response = await this.transport.register(data)
      if (this.isAuthAccessResponse(response)) {
        const installed = this.sessions.installLegacyRegistrationResponse(response)
        return {
          pending: false,
          message: installed.message,
          user: this.transformApiUserToUser(installed.data),
        }
      }
      return { pending: true, message: response.message }
    } catch (error: unknown) {
      if (error instanceof AuthTransportError && error.status === 409) {
        throw new UserAlreadyExistsError(data.email)
      }
      throw this.toAuthError(error, 'Registration failed. Please try again.', 'REGISTRATION_FAILED')
    }
  }

  async verifyEmail(token: string): Promise<void> {
    if (!token) {
      throw new AuthError('Verification token is required', 'INVALID_VERIFICATION_TOKEN', 400)
    }

    try {
      await this.transport.verifyEmail(token)
    } catch (error: unknown) {
      throw this.toAuthError(
        error,
        'This verification link is invalid or expired.',
        'EMAIL_VERIFICATION_FAILED',
      )
    }
  }

  async resendVerification(email: string): Promise<string> {
    if (!email || !this.isValidEmail(email)) {
      throw new AuthError('Please enter a valid email address', 'INVALID_EMAIL', 400)
    }

    try {
      return (await this.transport.resendVerification(email)).message
    } catch (error: unknown) {
      throw this.toAuthError(
        error,
        'Something went wrong. Please try again.',
        'RESEND_VERIFICATION_FAILED',
      )
    }
  }

  async requestPasswordReset(email: string): Promise<string> {
    if (!email || !this.isValidEmail(email)) {
      throw new AuthError('Please enter a valid email address', 'INVALID_EMAIL', 400)
    }

    try {
      return (await this.transport.requestPasswordReset(email)).message
    } catch (error: unknown) {
      throw this.toAuthError(
        error,
        'Something went wrong. Please try again.',
        'FORGOT_PASSWORD_FAILED',
      )
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<string> {
    this.validateResetPasswordData(data)

    try {
      return (await this.transport.resetPassword(data)).message
    } catch (error: unknown) {
      throw this.toAuthError(
        error,
        'Something went wrong. Please try again.',
        'RESET_PASSWORD_FAILED',
      )
    }
  }

  restoreSession(): Promise<boolean> {
    return this.sessions.bootstrap()
  }

  logout(): Promise<LogoutResult> {
    return this.sessions.logout()
  }

  async refreshToken(): Promise<boolean> {
    try {
      await this.sessions.refreshAccessToken()
      return true
    } catch {
      return false
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return null
  }

  async isAuthenticated(): Promise<boolean> {
    return this.sessions.getAccessSnapshot().token !== null
  }

  private validateRegistrationData(data: RegisterData): void {
    if (!data.username || data.username.length < 3) {
      throw new AuthError('Username must be at least 3 characters long', 'INVALID_USERNAME')
    }
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new AuthError('Please enter a valid email address', 'INVALID_EMAIL')
    }
    const passwordError = getPasswordPolicyError(data.password)
    if (!data.password || passwordError) {
      throw new AuthError(passwordError ?? 'Password is required', 'INVALID_PASSWORD')
    }
    if (data.password !== data.confirmPassword) {
      throw new AuthError('Passwords do not match', 'PASSWORD_MISMATCH')
    }
  }

  private validateResetPasswordData(data: ResetPasswordData): void {
    if (!data.token) {
      throw new AuthError('Reset token is required', 'INVALID_RESET_TOKEN', 400)
    }
    const passwordError = getPasswordPolicyError(data.newPassword)
    if (!data.newPassword || passwordError) {
      throw new AuthError(passwordError ?? 'Password is required', 'INVALID_PASSWORD', 400)
    }
    if (data.newPassword !== data.confirmPassword) {
      throw new AuthError('Passwords do not match', 'PASSWORD_MISMATCH', 400)
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  private isAuthAccessResponse(
    response: { message: string } | AuthAccessResponse,
  ): response is AuthAccessResponse {
    return 'data' in response && 'expires_in' in response
  }

  private toAuthError(error: unknown, fallbackMessage: string, code: string): AuthError {
    if (error instanceof AuthError) {
      return error
    }

    if (error instanceof AuthTransportError && error.code) {
      return new AuthError(error.message, error.code, error.status)
    }

    const statusCode = error instanceof AuthTransportError ? error.status : undefined
    return new AuthError(
      error instanceof Error && error.message ? error.message : fallbackMessage,
      code,
      statusCode,
    )
  }

  private transformApiUserToUser(apiUser: ApiAuthenticatedUser): User {
    return {
      id: apiUser.id,
      username: apiUser.name,
      email: apiUser.email,
      authorization: isAuthorizationContext(apiUser.authorization)
        ? apiUser.authorization
        : undefined,
    }
  }
}

export const authService = new AuthService()
