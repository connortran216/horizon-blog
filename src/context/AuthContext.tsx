import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../core/types/common.types';
import { authService } from '../core/services/auth.service';
import { AUTH_STORAGE_KEYS } from '../core/types/auth.types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore user session on app initialization
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
        if (!token) return;

        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token invalid, clear it
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        }
      } catch (err) {
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      } finally {
        setIsLoading(false); // Always runs, even with early return
      }
    };

    restoreSession();
  }, []);

  // Listen for unauthorized events from API service
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setError('Session expired. Please log in again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await authService.login({ email, password });
      setUser(loggedInUser);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err; // Re-throw for component handling
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { username: string; email: string; password: string; confirmPassword: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const registeredUser = await authService.register(data);
      setUser(registeredUser);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err; // Re-throw for component handling
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading,
      error
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
