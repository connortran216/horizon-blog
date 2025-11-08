import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../core/types/common.types';
import { authService } from '../core/services/auth.service';
import { AUTH_STORAGE_KEYS, AuthContextValue, AuthStatus, LoginCredentials, RegisterData } from '../core/types/auth.types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.LOADING);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore user session on app initialization
  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
        if (!token) {
          setStatus(AuthStatus.UNAUTHENTICATED);
          setIsLoading(false);
          return;
        }

        // Decode JWT token client-side (no API call needed)
        const currentUser = authService.decodeToken(token);
        if (currentUser) {
          setUser(currentUser);
          setStatus(AuthStatus.AUTHENTICATED);
        } else {
          // Token invalid or expired, clear it
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
          setStatus(AuthStatus.UNAUTHENTICATED);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        setStatus(AuthStatus.UNAUTHENTICATED);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Listen for unauthorized events from API service
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setStatus(AuthStatus.UNAUTHENTICATED);
      setError('Session expired. Please log in again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setStatus(AuthStatus.LOADING);
    setError(null);
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
      setStatus(AuthStatus.AUTHENTICATED);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setStatus(AuthStatus.UNAUTHENTICATED);
      throw err; // Re-throw for component handling
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setStatus(AuthStatus.LOADING);
    setError(null);
    try {
      const registeredUser = await authService.register(data);
      setUser(registeredUser);
      setStatus(AuthStatus.AUTHENTICATED);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setStatus(AuthStatus.UNAUTHENTICATED);
      throw err; // Re-throw for component handling
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
    setStatus(AuthStatus.UNAUTHENTICATED);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      status,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
