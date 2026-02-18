import { User } from '../../core/types/common.types'
import { UserProfile } from '../../core/types/profile.types'

export interface ProfileBlogPost {
  id: string
  title: string
  subtitle?: string
  createdAt: string
  status: string
  featuredImage?: string
}

export interface ProfilePaginationState {
  page: number
  limit: number
  total: number
}

export interface ProfileFormValues {
  name: string
  bio: string
  website: string
  location: string
}

export interface ProfileEditorContext {
  profile: UserProfile | null
  user: User | null
}
