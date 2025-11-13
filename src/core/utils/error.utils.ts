import { AppError } from '../types/common.types'

/**
 * Error handling utilities
 */

/**
 * Create a standardized error object
 */
export function createAppError(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): AppError {
  return {
    code,
    message,
    details,
  }
}

/**
 * Handle async errors in a consistent way
 */
export async function handleAsyncError<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: unknown) => AppError,
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    const appError = errorHandler ? errorHandler(error) : convertToAppError(error)
    return { success: false, error: appError }
  }
}

/**
 * Convert unknown error to AppError
 */
export function convertToAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return createAppError('UNKNOWN_ERROR', error.message || 'An unexpected error occurred')
  }

  return createAppError('UNKNOWN_ERROR', 'An unexpected error occurred', { originalError: error })
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

/**
 * Log error for debugging (in production, this would send to error tracking service)
 */
export function logError(error: unknown, context?: string): void {
  const errorMessage = isAppError(error)
    ? `${error.code}: ${error.message}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  console.error(`[${context || 'APP_ERROR'}]`, errorMessage, error)
}

/**
 * Create error message for user display
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: unknown, code: string): boolean {
  return isAppError(error) && error.code === code
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries) {
        throw error
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
