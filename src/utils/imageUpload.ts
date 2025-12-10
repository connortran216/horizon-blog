/**
 * Image Upload Handler
 *
 * Handles image uploads to Minio object storage via Go backend.
 * Features:
 * - File validation (size, type)
 * - JWT authentication
 * - Error handling with descriptive messages
 */

import { CREPE_CONFIG } from '../config/crepe.config'

/**
 * Response structure from Go backend /images/upload endpoint
 */
interface UploadResult {
  url: string
  objectKey: string
  filename: string
  size: number
}

interface UploadResponse {
  data: UploadResult
  message: string
}

interface ErrorResponse {
  error: string
}

/**
 * Handles image uploads with validation and authentication
 */
export class ImageUploadHandler {
  /**
   * Upload an image file to Minio via Go backend
   *
   * @param file - The image file to upload
   * @returns Promise<string> - The URL of the uploaded image
   * @throws Error - If validation fails or upload fails
   */
  async uploadImage(file: File): Promise<string> {
    // Validate file before upload
    this.validateFile(file)

    // Prepare form data
    const formData = new FormData()
    formData.append('file', file)

    // Get JWT token from localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication required. Please log in to upload images.')
    }

    try {
      // Upload to Minio via Go backend
      const response = await fetch(CREPE_CONFIG.upload.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Don't set Content-Type header - browser will set it automatically with boundary
        },
        body: formData,
      })

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({ error: 'Upload failed' }))) as ErrorResponse
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`)
      }

      // Parse successful response
      const data: UploadResponse = await response.json()

      if (!data.data?.url) {
        throw new Error('Invalid response from server: missing image URL')
      }

      return data.data.url
    } catch (error) {
      // Re-throw with more context if it's a network error
      if (error instanceof TypeError) {
        throw new Error('Network error: Unable to reach upload server')
      }

      // Re-throw other errors as-is
      throw error
    }
  }

  /**
   * Validate file size and type
   *
   * @param file - The file to validate
   * @throws Error - If validation fails
   */
  private validateFile(file: File): void {
    // Check file size
    const maxBytes = CREPE_CONFIG.upload.maxFileSize * 1024 * 1024
    if (file.size > maxBytes) {
      throw new Error(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size: ${CREPE_CONFIG.upload.maxFileSize}MB`,
      )
    }

    // Check file type
    if (!CREPE_CONFIG.upload.allowedTypes.includes(file.type)) {
      const allowedTypesStr = CREPE_CONFIG.upload.allowedTypes
        .map((type) => type.split('/')[1])
        .join(', ')
      throw new Error(`Invalid file type (${file.type}). Allowed types: ${allowedTypesStr}`)
    }
  }
}

/**
 * Singleton instance of ImageUploadHandler
 * Use this exported instance for all image uploads
 */
export const imageUploadHandler = new ImageUploadHandler()
