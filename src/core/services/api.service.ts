/**
 * API Service - Handles HTTP requests with automatic JWT authentication
 * Uses localStorage JWT tokens with Authorization headers
 */

import { AUTH_STORAGE_KEYS } from '../types/auth.types';
import { getRuntimeConfig } from '../../config/runtime';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiService {
  private baseUrl: string;

  constructor() {
    // Get base URL from runtime configuration
    this.baseUrl = getRuntimeConfig().beHost;
  }

  /**
   * Get headers with optional Authorization token
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response, endpoint);
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response, endpoint);
  }

  /**
   * Generic PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response, endpoint);
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response, endpoint);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response, endpoint);
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response, endpoint: string): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      const error = new ApiError(errorMessage, response.status);

      // Handle authentication errors ONLY for protected endpoints
      if (response.status === 401) {
        // Don't redirect if this is a login/register attempt (wrong credentials)
        const isAuthEndpoint = endpoint.includes('/auth/login') ||
          endpoint.includes('/users');

        if (!isAuthEndpoint) {
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));

          // Only redirect if not already on login page
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
      }

      throw error;
    }

    // Handle successful responses
    if (response.status === 204) {
      // No content response
      return {} as T;
    }

    return response.json();
  }
}

// Export singleton instance
export const apiService = new ApiService();
