/**
 * Authentication Interceptor - Handles authentication-related logic for API requests
 * Follows Single Responsibility Principle by separating auth concerns from HTTP concerns
 */

import { RequestAuthMode } from '../types/auth.types'
import { AccessTokenStore, accessTokenStore } from './access-token.store'

export class AuthInterceptor {
  constructor(private readonly tokens: AccessTokenStore = accessTokenStore) {}

  /**
   * Get headers with optional Authorization token
   *
   * @param skipContentType - If true, skips setting Content-Type header (for FormData uploads)
   */
  getHeaders(
    skipContentType = false,
    authMode: RequestAuthMode = 'required',
    accessToken: string | null = this.tokens.getSnapshot().token,
  ): HeadersInit {
    const headers: HeadersInit = {}

    // Only set Content-Type for non-FormData requests
    if (!skipContentType) {
      headers['Content-Type'] = 'application/json'
    }

    if (authMode !== 'transport' && accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    return headers
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokens.getSnapshot().token !== null
  }

  getAccessSnapshot() {
    return this.tokens.getSnapshot()
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    this.tokens.clear()
  }
}

// Export singleton instance
export const authInterceptor = new AuthInterceptor()
