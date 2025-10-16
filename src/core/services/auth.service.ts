import { User } from '../types/common.types';
import {
  LoginCredentials,
  RegisterData,
  AuthError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
  AUTH_STORAGE_KEYS,
  IAuthService
} from '../types/auth.types';

/**
 * Authentication service implementation
 * Handles user authentication, registration, and session management
 */
export class AuthService implements IAuthService {
  private readonly STORAGE_KEYS = AUTH_STORAGE_KEYS;

  /**
   * Authenticate user with credentials
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Validate input
      if (!credentials.username || !credentials.password) {
        throw new InvalidCredentialsError();
      }

      // For demo purposes, accept admin/admin as valid credentials
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const user: User = {
          username: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60',
        };

        this.saveUserToStorage(user);
        return user;
      }

      // In a real application, this would make an API call
      // For now, simulate API validation
      throw new InvalidCredentialsError();
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        'Login failed. Please try again.',
        'LOGIN_FAILED'
      );
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<User> {
    try {
      // Validate input
      this.validateRegistrationData(data);

      // Check if user already exists
      const existingUsers = this.getStoredUsers();
      const userExists = existingUsers.some(user => user.username === data.username);

      if (userExists) {
        throw new UserAlreadyExistsError(data.username);
      }

      // Create new user
      const newUser: User = {
        username: data.username,
        email: data.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      };

      // Save user
      existingUsers.push(newUser);
      this.saveUsersToStorage(existingUsers);

      // Auto-login after registration
      this.saveUserToStorage(newUser);

      return newUser;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        'Registration failed. Please try again.',
        'REGISTRATION_FAILED'
      );
    }
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    try {
      this.clearUserFromStorage();
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error on logout - just clear storage
      this.clearUserFromStorage();
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      return this.getUserFromStorage();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Refresh user session/token
   */
  async refreshToken(): Promise<User | null> {
    try {
      // In a real application, this would refresh the JWT token
      // For now, just return the current user if available
      return this.getUserFromStorage();
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user by username (for profile pages, etc.)
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const users = this.getStoredUsers();
      return users.find(user => user.username === username) || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  // Private helper methods

  private validateRegistrationData(data: RegisterData): void {
    if (!data.username || data.username.length < 3) {
      throw new AuthError(
        'Username must be at least 3 characters long',
        'INVALID_USERNAME'
      );
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new AuthError(
        'Please enter a valid email address',
        'INVALID_EMAIL'
      );
    }

    if (!data.password || data.password.length < 6) {
      throw new AuthError(
        'Password must be at least 6 characters long',
        'INVALID_PASSWORD'
      );
    }

    if (data.password !== data.confirmPassword) {
      throw new AuthError(
        'Passwords do not match',
        'PASSWORD_MISMATCH'
      );
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      throw new AuthError(
        'Failed to save user session',
        'STORAGE_ERROR'
      );
    }
  }

  private getUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      return null;
    }
  }

  private clearUserFromStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.USER);
      localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to clear user storage:', error);
    }
  }

  private getStoredUsers(): User[] {
    try {
      // In a real application, users would be stored server-side
      // For demo purposes, we'll use localStorage
      const stored = localStorage.getItem('horizon_blog_demo_users');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse stored users:', error);
      return [];
    }
  }

  private saveUsersToStorage(users: User[]): void {
    try {
      localStorage.setItem('horizon_blog_demo_users', JSON.stringify(users));
    } catch (error) {
      throw new AuthError(
        'Failed to save users',
        'STORAGE_ERROR'
      );
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
