import { User } from '../types/common.types';
import {
  LoginCredentials,
  RegisterData,
  AuthError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
  IAuthService,
  AUTH_STORAGE_KEYS
} from '../types/auth.types';
import { apiService } from './api.service';
import { jwtDecode } from 'jwt-decode';

/**
 * API user response interface
 */
interface ApiUserResponse {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  token: string;
  data: ApiUserResponse;
  message: string;
}

/**
 * JWT token payload interface
 */
interface JWTPayload {
  user_id: number;
  email: string;
  name: string;
  exp: number;
}

/**
 * Authentication service implementation
 * Handles user authentication with JWT tokens and Authorization headers
 */
export class AuthService implements IAuthService {
  /**
   * Authenticate user with credentials
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new InvalidCredentialsError();
      }

      // Perform API login
      const response: AuthResponse = await apiService.post('/auth/login', credentials);

      // Store the JWT token
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, response.token);

      // Transform API user to FE format
      const user = this.transformApiUserToUser(response.data);
      return user;
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }

      // Handle API errors
      if (error.status === 401) {
        throw new InvalidCredentialsError();
      }

      throw new AuthError(
        error.message || 'Login failed. Please try again.',
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

      // Prepare registration data for API
      const registrationData = {
        name: data.username,  // API expects 'name', FE uses 'username'
        email: data.email,
        password: data.password,
      };

      // Perform API registration
      const response: AuthResponse = await apiService.post('/users', registrationData);

      // Store the JWT token
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, response.token);

      // Transform API user to FE format
      const user = this.transformApiUserToUser(response.data);
      return user;
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }

      // Handle API errors
      if (error.status === 409) {
        throw new UserAlreadyExistsError(data.email);
      }

      throw new AuthError(
        error.message || 'Registration failed. Please try again.',
        'REGISTRATION_FAILED'
      );
    }
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    // Clear stored token
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);

    // Client-side logout complete
    // Backend may have /auth/logout endpoint but not required for JWT + localStorage approach
  }

  /**
   * Decode JWT token to get user information
   * No API call needed - decode client-side
   */
  decodeToken(token: string): User | null {
    try {
      const decoded = jwtDecode<JWTPayload>(token);

      // Check if token is expired
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        return null;
      }

      // Transform JWT payload to User
      return {
        id: decoded.user_id,
        username: decoded.name,
        email: decoded.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${decoded.name}`
      };
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  }

  /**
   * Refresh user session/token
   * Not implemented - BE needs to add refresh endpoint
   */
  async refreshToken(): Promise<User | null> {
    return null;
  }

  /**
   * Check if user is currently authenticated
   * Not implemented - determined by AuthContext state
   */
  async isAuthenticated(): Promise<boolean> {
    return false;
  }

  // /**
  //  * Get user by username (for profile pages, etc.)
  //  * Not implemented - could call GET /users endpoint
  //  */
  // async getUserByUsername(username: string): Promise<User | null> {
  //   return null;
  // }

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

  private transformApiUserToUser(apiUser: ApiUserResponse): User {
    return {
      id: apiUser.id,
      username: apiUser.name,  // API name -> FE username
      email: apiUser.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiUser.name}`, // Default avatar
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
