import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../core/types/common.types';
import { authService } from '../core/services/auth.service';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from auth service on initial render if JWT cookie exists
  useEffect(() => {
    // Since JWT is in httpOnly cookie, we can't check it directly
    // User state is managed in memory, will need to re-login on page refresh
    // In future, could add /auth/me endpoint to check cookie validity
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
