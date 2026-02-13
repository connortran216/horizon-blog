/**
 * Profile domain and API types
 */

export interface ApiUserProfile {
  id: number
  name: string
  email: string
  bio?: string | null
  website?: string | null
  location?: string | null
  avatar_url?: string | null
}

export interface ApiUserProfileResponse {
  data: ApiUserProfile
  message: string
}

export interface UserProfile {
  id: number
  name: string
  email: string
  bio?: string
  website?: string
  location?: string
  avatarUrl?: string
}

export interface UpdateUserProfileRequest {
  name?: string
  bio?: string
  website?: string
  location?: string
}

export const AVATAR_UPLOAD_LIMIT_BYTES = 5 * 1024 * 1024
export const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png'] as const
