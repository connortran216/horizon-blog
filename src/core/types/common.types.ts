/**
 * Common types and interfaces used across the application
 */

// Base entity interface for all domain objects
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User profile information
export interface User {
  id: number;
  username: string;
  avatar?: string;
  email?: string;
}

// Author information for blog posts
export interface Author {
  username: string;
  avatar?: string;
}

// Application error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: AppError;
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Search and filter parameters
export interface SearchParams {
  query?: string;
  tags?: string[];
  author?: string;
}

// Sort options
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
