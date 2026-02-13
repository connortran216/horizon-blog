import { User } from './common.types'
import { UserProfile } from './profile.types'

export interface ProfileUpdateInput {
  name?: string
  bio?: string
  website?: string
  location?: string
}

export interface IProfileService {
  getCurrentProfile(): Promise<UserProfile>
  updateCurrentProfile(
    currentProfile: UserProfile,
    updates: ProfileUpdateInput,
  ): Promise<UserProfile>
  uploadAvatar(file: File): Promise<UserProfile>
  removeAvatar(): Promise<void>
  validateAvatarFile(file: File): void
  toAuthUser(profile: UserProfile): User
}
