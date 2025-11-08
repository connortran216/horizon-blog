import { User } from './common.types';

/**
 * Authentication-specific types and interfaces
 */

// Authentication status
export enum AuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading',
}

export type AuthStatusType = AuthStatus;

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Authentication context state
export interface AuthState {
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  error: string | null;
}

// Authentication actions
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Complete authentication context
export interface AuthContextValue extends AuthState, AuthActions {}

// Authentication service interface
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<User>;
  register(data: RegisterData): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(): Promise<User | null>;
}

// Storage keys for authentication
export const AUTH_STORAGE_KEYS = {
  USER: 'horizon_blog_user',
  TOKEN: 'horizon_blog_token',
  REFRESH_TOKEN: 'horizon_blog_refresh_token',
} as const;

// Authentication errors
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Specific authentication error types
export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid username or password', 'INVALID_CREDENTIALS', 401);
  }
}

export class UserAlreadyExistsError extends AuthError {
  constructor(username: string) {
    super(`User ${username} already exists`, 'USER_ALREADY_EXISTS', 409);
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super('Your session has expired. Please log in again.', 'SESSION_EXPIRED', 401);
  }
}
