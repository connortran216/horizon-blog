import { RepositoryResult } from './blog-repository.types'
import { UpdateUserProfileRequest, UserProfile } from './profile.types'

/**
 * Profile repository interface
 * Handles profile-related API access.
 */
export interface IProfileRepository {
  getCurrentProfile(): Promise<RepositoryResult<UserProfile>>
  updateCurrentProfile(updates: UpdateUserProfileRequest): Promise<RepositoryResult<UserProfile>>
  uploadAvatar(file: File): Promise<RepositoryResult<UserProfile>>
  removeAvatar(): Promise<RepositoryResult<void>>
}
