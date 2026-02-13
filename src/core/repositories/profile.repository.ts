import { apiService, ApiError } from '../services/api.service'
import { RepositoryResult } from '../types/blog-repository.types'
import { IProfileRepository } from '../types/profile-repository.types'
import {
  ApiUserProfile,
  ApiUserProfileResponse,
  UpdateUserProfileRequest,
  UserProfile,
} from '../types/profile.types'

const normalizeOptionalText = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const normalizeAvatarUrl = (value?: string | null): string | undefined => {
  const normalized = normalizeOptionalText(value)
  if (!normalized) return undefined

  // Prevent invalid schemes (e.g. media:// token) from being used as image src.
  if (normalized.startsWith('media://')) {
    return undefined
  }

  return normalized
}

/**
 * API Profile Repository
 * Encapsulates profile and avatar endpoint calls.
 */
export class ApiProfileRepository implements IProfileRepository {
  private transformProfile(apiProfile: ApiUserProfile): UserProfile {
    return {
      id: apiProfile.id,
      name: apiProfile.name,
      email: apiProfile.email,
      bio: normalizeOptionalText(apiProfile.bio),
      website: normalizeOptionalText(apiProfile.website),
      location: normalizeOptionalText(apiProfile.location),
      avatarUrl: normalizeAvatarUrl(apiProfile.avatar_url),
    }
  }

  private toErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message
    }

    return fallback
  }

  private toStatusCode(error: unknown): number | undefined {
    if (error instanceof ApiError) {
      return error.status
    }

    return undefined
  }

  async getCurrentProfile(): Promise<RepositoryResult<UserProfile>> {
    try {
      const response = await apiService.get<ApiUserProfileResponse>('/users/me')
      return {
        success: true,
        data: this.transformProfile(response.data),
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: this.toErrorMessage(error, 'Failed to fetch current profile'),
        statusCode: this.toStatusCode(error),
      }
    }
  }

  async updateCurrentProfile(
    updates: UpdateUserProfileRequest,
  ): Promise<RepositoryResult<UserProfile>> {
    try {
      const response = await apiService.patch<ApiUserProfileResponse>('/users/me', updates)
      return {
        success: true,
        data: this.transformProfile(response.data),
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: this.toErrorMessage(error, 'Failed to update current profile'),
        statusCode: this.toStatusCode(error),
      }
    }
  }

  async uploadAvatar(file: File): Promise<RepositoryResult<UserProfile>> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiService.post<ApiUserProfileResponse>('/users/me/avatar', formData)
      return {
        success: true,
        data: this.transformProfile(response.data),
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: this.toErrorMessage(error, 'Failed to upload avatar'),
        statusCode: this.toStatusCode(error),
      }
    }
  }

  async removeAvatar(): Promise<RepositoryResult<void>> {
    try {
      await apiService.delete<unknown>('/users/me/avatar')
      return {
        success: true,
        data: undefined,
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: this.toErrorMessage(error, 'Failed to remove avatar'),
        statusCode: this.toStatusCode(error),
      }
    }
  }
}

export const profileRepository = new ApiProfileRepository()
