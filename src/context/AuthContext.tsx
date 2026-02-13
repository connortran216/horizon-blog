import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { User } from '../core/types/common.types'
import { authService } from '../core/services/auth.service'
import {
  AUTH_STORAGE_KEYS,
  AuthContextValue,
  AuthStatus,
  LoginCredentials,
  RegisterData,
} from '../core/types/auth.types'
import { getProfileService } from '../core/di/container'
import { ApiError } from '../core/services/api.service'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.LOADING)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUserProfile = useCallback(async (): Promise<User | null> => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
    if (!token) {
      setUser(null)
      setStatus(AuthStatus.UNAUTHENTICATED)
      return null
    }

    try {
      const profileService = getProfileService()
      const profile = await profileService.getCurrentProfile()
      const refreshedUser = profileService.toAuthUser(profile)
      setUser(refreshedUser)
      setStatus(AuthStatus.AUTHENTICATED)
      setError(null)
      return refreshedUser
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
        setUser(null)
        setStatus(AuthStatus.UNAUTHENTICATED)
        setError('Session expired. Please log in again.')
        return null
      }

      return null
    }
  }, [])

  // Restore user session on app initialization
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
        if (!token) {
          setStatus(AuthStatus.UNAUTHENTICATED)
          setIsLoading(false)
          return
        }

        // Decode JWT to validate token expiration first.
        const decodedUser = authService.decodeToken(token)
        if (!decodedUser) {
          // Token invalid or expired, clear it
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
          setStatus(AuthStatus.UNAUTHENTICATED)
          setIsLoading(false)
          return
        }

        // Set a quick local user first, then refresh full profile from /users/me.
        setUser(decodedUser)
        setStatus(AuthStatus.AUTHENTICATED)
        await refreshUserProfile()
      } catch (err) {
        console.error('Failed to restore session:', err)
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
        setUser(null)
        setStatus(AuthStatus.UNAUTHENTICATED)
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()
  }, [refreshUserProfile])

  // Listen for unauthorized events from API service
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      setStatus(AuthStatus.UNAUTHENTICATED)
      setError('Session expired. Please log in again.')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setStatus(AuthStatus.LOADING)
    setError(null)
    try {
      const loggedInUser = await authService.login(credentials)
      setUser(loggedInUser)
      setStatus(AuthStatus.AUTHENTICATED)
      await refreshUserProfile()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      setStatus(AuthStatus.UNAUTHENTICATED)
      throw err // Re-throw for component handling
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    setStatus(AuthStatus.LOADING)
    setError(null)
    try {
      const registeredUser = await authService.register(data)
      setUser(registeredUser)
      setStatus(AuthStatus.AUTHENTICATED)
      await refreshUserProfile()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      setStatus(AuthStatus.UNAUTHENTICATED)
      throw err // Re-throw for component handling
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setError(null)
    setStatus(AuthStatus.UNAUTHENTICATED)
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUserProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Ensure useAuth is a stable function reference for HMR
const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth }
export default useAuth
