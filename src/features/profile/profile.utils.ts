import { BlogPostSummary } from '../../core/types/blog.types'
import { User } from '../../core/types/common.types'
import { ApiError } from '../../core/services/api.service'
import { UserProfile } from '../../core/types/profile.types'
import { extractPreviewText } from '../../core/utils/markdown-preview.utils'
import { ProfileBlogPost, ProfileFormValues } from './profile.types'

export const DEFAULT_PROFILE_FORM: ProfileFormValues = {
  name: '',
  bio: '',
  website: '',
  location: '',
}

export const buildProfileFormValues = (profile: UserProfile | null): ProfileFormValues => {
  if (!profile) {
    return DEFAULT_PROFILE_FORM
  }

  return {
    name: profile.name || '',
    bio: profile.bio || '',
    website: profile.website || '',
    location: profile.location || '',
  }
}

export const buildFallbackProfile = (
  profile: UserProfile | null,
  authUser: User | null,
): UserProfile => {
  if (profile) {
    return profile
  }

  return {
    id: authUser?.id || 0,
    name: authUser?.username || '',
    email: authUser?.email || '',
    bio: '',
    website: '',
    location: '',
    avatarUrl: undefined,
  }
}

export const getProfileErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'Invalid profile data. Please check your inputs.'
    if (error.status === 401) return 'Session expired. Please log in again.'
    if (error.status === 413) return 'Max 5MB'
    if (error.status === 415) return 'Use JPG/PNG'
    if (error.status >= 500) return 'Something went wrong. Please try again.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export const sanitizeImageSrc = (value?: string): string | undefined => {
  if (!value) return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('media://')) return undefined

  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/')
  ) {
    return trimmed
  }

  return undefined
}

export const mapBlogSummaryToProfilePost = (
  post: BlogPostSummary,
  resolvedImageByToken: Record<string, string>,
): ProfileBlogPost => ({
  featuredImage: sanitizeImageSrc(
    post.featuredImage ? resolvedImageByToken[post.featuredImage] || post.featuredImage : undefined,
  ),
  id: String(post.id),
  title: post.title,
  subtitle: extractPreviewText(post.subtitle || post.excerpt || ''),
  createdAt: post.createdAt,
  status: post.status,
})

export const formatBlogDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
