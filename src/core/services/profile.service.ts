import { ApiError } from './api.service'
import { IProfileRepository } from '../types/profile-repository.types'
import { IProfileService, ProfileUpdateInput } from '../types/profile-service.types'
import { User } from '../types/common.types'
import {
  ALLOWED_AVATAR_MIME_TYPES,
  AVATAR_UPLOAD_LIMIT_BYTES,
  UpdateUserProfileRequest,
  UserProfile,
} from '../types/profile.types'

const EDITABLE_PROFILE_FIELDS: (keyof ProfileUpdateInput)[] = ['name', 'bio', 'website', 'location']

/**
 * Profile service
 * Handles profile business logic and delegates network access to repository.
 */
export class ProfileService implements IProfileService {
  private repository: IProfileRepository

  constructor(repository: IProfileRepository) {
    this.repository = repository
  }

  async getCurrentProfile(): Promise<UserProfile> {
    const result = await this.repository.getCurrentProfile()
    if (!result.success || !result.data) {
      if (result.statusCode) {
        throw new ApiError(result.error || 'Failed to fetch current profile', result.statusCode)
      }

      throw new Error(result.error || 'Failed to fetch current profile')
    }

    return result.data
  }

  async updateCurrentProfile(
    currentProfile: UserProfile,
    updates: ProfileUpdateInput,
  ): Promise<UserProfile> {
    const payload = this.buildChangedFieldsPayload(currentProfile, updates)

    if (Object.keys(payload).length === 0) {
      return currentProfile
    }

    const result = await this.repository.updateCurrentProfile(payload)
    if (!result.success || !result.data) {
      if (result.statusCode) {
        throw new ApiError(result.error || 'Failed to update current profile', result.statusCode)
      }

      throw new Error(result.error || 'Failed to update current profile')
    }

    return result.data
  }

  async uploadAvatar(file: File): Promise<UserProfile> {
    this.validateAvatarFile(file)

    const result = await this.repository.uploadAvatar(file)
    if (!result.success || !result.data) {
      if (result.statusCode) {
        throw new ApiError(result.error || 'Failed to upload avatar', result.statusCode)
      }

      throw new Error(result.error || 'Failed to upload avatar')
    }

    return result.data
  }

  async removeAvatar(): Promise<void> {
    const result = await this.repository.removeAvatar()
    if (!result.success) {
      if (result.statusCode) {
        throw new ApiError(result.error || 'Failed to remove avatar', result.statusCode)
      }

      throw new Error(result.error || 'Failed to remove avatar')
    }
  }

  validateAvatarFile(file: File): void {
    if (
      !ALLOWED_AVATAR_MIME_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number])
    ) {
      throw new Error('Use JPG/PNG')
    }

    if (file.size > AVATAR_UPLOAD_LIMIT_BYTES) {
      throw new Error('Max 5MB')
    }
  }

  toAuthUser(profile: UserProfile): User {
    return {
      id: profile.id,
      username: profile.name,
      email: profile.email,
      avatar: profile.avatarUrl,
      bio: profile.bio,
      website: profile.website,
      location: profile.location,
    }
  }

  private buildChangedFieldsPayload(
    currentProfile: UserProfile,
    updates: ProfileUpdateInput,
  ): UpdateUserProfileRequest {
    const payload: UpdateUserProfileRequest = {}

    EDITABLE_PROFILE_FIELDS.forEach((field) => {
      const nextValue = updates[field]
      if (nextValue === undefined) {
        return
      }

      const normalizedCurrent = (currentProfile[field] || '').trim()
      const normalizedNext = nextValue.trim()

      if (normalizedNext !== normalizedCurrent) {
        payload[field] = normalizedNext
      }
    })

    return payload
  }
}

export const createProfileServiceInstance = (repository: IProfileRepository): ProfileService =>
  new ProfileService(repository)
