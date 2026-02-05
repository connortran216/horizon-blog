/**
 * Authentication Interceptor - Handles authentication-related logic for API requests
 * Follows Single Responsibility Principle by separating auth concerns from HTTP concerns
 */

import { AUTH_STORAGE_KEYS } from '../types/auth.types'

export class AuthInterceptor {
  /**
   * Get headers with optional Authorization token
   *
   * @param skipContentType - If true, skips setting Content-Type header (for FormData uploads)
   */
  getHeaders(skipContentType = false): HeadersInit {
    const headers: HeadersInit = {}

    // Only set Content-Type for non-FormData requests
    if (!skipContentType) {
      headers['Content-Type'] = 'application/json'
    }

    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Handle authentication errors and redirects
   */
  handleAuthError(status: number, endpoint: string): void {
    // Handle authentication errors ONLY for protected endpoints
    if (status === 401) {
      // Don't redirect if this is a login/register attempt (wrong credentials)
      const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/users')

      if (!isAuthEndpoint) {
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)

        // Dispatch custom event for auth context to handle
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))

        // Only redirect if not already on login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
    return !!token
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
  }
}

// Export singleton instance
export const authInterceptor = new AuthInterceptor()
