import { apiService } from '../../core/services/api.service'
import { BlogArchivePost, BlogArchiveTag } from './blog.types'

export interface BlogArchiveResponse {
  data: BlogArchivePost[]
  page: number
  limit: number
  total: number
}

interface TagListResponse {
  data: BlogArchiveTag[]
  total: number
}

export interface BlogArchiveQuery {
  q?: string
  tags?: string[]
  page: number
  limit: number
}

export const fetchBlogArchivePosts = async ({
  q,
  tags,
  page,
  limit,
}: BlogArchiveQuery): Promise<BlogArchiveResponse> => {
  if (q || (tags && tags.length > 0)) {
    return apiService.get<BlogArchiveResponse>('/search/posts', {
      q: q || undefined,
      tags: tags?.join(',') || undefined,
      page,
      limit,
    })
  }

  return apiService.get<BlogArchiveResponse>('/posts', {
    page,
    limit,
    status: 'published',
  })
}

export const fetchPopularTags = async (limit: number = 8): Promise<BlogArchiveTag[]> => {
  const response = await apiService.get<TagListResponse>('/tags/popular', { limit })
  return response.data
}
