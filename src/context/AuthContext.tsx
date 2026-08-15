import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react'
import { User } from '../core/types/common.types'
import { authService } from '../core/services/auth.service'
import {
  AuthContextValue,
  AuthState,
  AuthStatus,
  LoginCredentials,
  LogoutResult,
  RegisterData,
} from '../core/types/auth.types'
import { getProfileService } from '../core/di/container'
import { ApiError } from '../core/services/api.service'
import { authSessionService } from '../core/services/auth-session.service'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export type AuthLifecycleAction =
  | { type: 'loading' }
  | { type: 'authenticated'; user: User }
  | { type: 'unauthenticated'; error?: string | null }
  | { type: 'clear-error' }

export const initialAuthState: AuthState = {
  user: null,
  status: AuthStatus.LOADING,
  isLoading: true,
  error: null,
}

export const authLifecycleReducer = (state: AuthState, action: AuthLifecycleAction): AuthState => {
  switch (action.type) {
    case 'loading':
      return { ...state, status: AuthStatus.LOADING, isLoading: true, error: null }
    case 'authenticated':
      return {
        user: action.user,
        status: AuthStatus.AUTHENTICATED,
        isLoading: false,
        error: null,
      }
    case 'unauthenticated':
      return {
        user: null,
        status: AuthStatus.UNAUTHENTICATED,
        isLoading: false,
        error: action.error ?? null,
      }
    case 'clear-error':
      return { ...state, error: null }
  }
}

const LEGACY_AUTH_KEYS = [
  'horizon_blog_token',
  'horizon_blog_user',
  'horizon_blog_refresh_token',
] as const

export const clearLegacyAuthStorage = (storage?: Pick<Storage, 'removeItem'>): void => {
  const target = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined)
  if (!target) {
    return
  }
  LEGACY_AUTH_KEYS.forEach((key) => target.removeItem(key))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authLifecycleReducer, initialAuthState)
  const hydratingRef = useRef(true)

  const refreshUserProfile = useCallback(async (): Promise<User | null> => {
    try {
      const profileService = getProfileService()
      const profile = await profileService.getCurrentProfile()
      const refreshedUser = profileService.toAuthUser(profile)
      dispatch({ type: 'authenticated', user: refreshedUser })
      return refreshedUser
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        dispatch({
          type: 'unauthenticated',
          error: 'Session expired. Please log in again.',
        })
      }
      return null
    }
  }, [])

  useEffect(() => {
    return authSessionService.subscribe((event) => {
      if (event.type === 'signed-out') {
        dispatch({
          type: 'unauthenticated',
          error:
            event.reason === 'session-invalid' ? 'Session expired. Please log in again.' : null,
        })
        return
      }

      if (!hydratingRef.current && state.status === AuthStatus.UNAUTHENTICATED) {
        void refreshUserProfile()
      }
    })
  }, [refreshUserProfile, state.status])

  useEffect(() => {
    const restoreSession = async () => {
      clearLegacyAuthStorage()
      dispatch({ type: 'loading' })

      try {
        const restored = await authService.restoreSession()
        if (!restored) {
          dispatch({ type: 'unauthenticated' })
          return
        }

        const user = await refreshUserProfile()
        if (!user) {
          dispatch({ type: 'unauthenticated' })
        }
      } catch {
        dispatch({ type: 'unauthenticated' })
      } finally {
        hydratingRef.current = false
      }
    }

    void restoreSession()
  }, [refreshUserProfile])

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'loading' })
    try {
      const loggedInUser = await authService.login(credentials)
      dispatch({ type: 'authenticated', user: loggedInUser })
      await refreshUserProfile()
    } catch (error: unknown) {
      dispatch({
        type: 'unauthenticated',
        error: error instanceof Error ? error.message : 'Login failed',
      })
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    dispatch({ type: 'loading' })
    try {
      const result = await authService.register(data)
      if (result.pending || !result.user) {
        dispatch({ type: 'unauthenticated' })
        return result
      }
      dispatch({ type: 'authenticated', user: result.user })
      await refreshUserProfile()
      return result
    } catch (error: unknown) {
      dispatch({
        type: 'unauthenticated',
        error: error instanceof Error ? error.message : 'Registration failed',
      })
      throw error
    }
  }

  const logout = async (): Promise<LogoutResult> => {
    try {
      return await authService.logout()
    } finally {
      dispatch({ type: 'unauthenticated' })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUserProfile,
        clearError: () => dispatch({ type: 'clear-error' }),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth }
export default useAuth
