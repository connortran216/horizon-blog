import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { User } from '../../core/types/common.types'
import { AuthStatus } from '../../core/types/auth.types'
import { getBlogRepository } from '../../core/di/container'
import { resolveMediaUrls } from '../media/media.api'
import { ProfileBlogPost, ProfilePaginationState } from './profile.types'
import { mapBlogSummaryToProfilePost } from './profile.utils'

interface UseProfilePostsParams {
  status: AuthStatus
  user: User | null
}

interface UseProfilePostsResult {
  postsLoading: boolean
  publishedBlogs: ProfileBlogPost[]
  draftBlogs: ProfileBlogPost[]
  publishedPagination: ProfilePaginationState
  draftPagination: ProfilePaginationState
  handlePublishedPageChange: (page: number) => void
  handleDraftPageChange: (page: number) => void
  handleEdit: (blogId: string) => void
  handleDelete: (blogId: string) => Promise<void>
}

const resolveFeaturedImages = async (
  posts: Array<{ featuredImage?: string }>,
): Promise<Record<string, string>> => {
  const tokenToMediaId = new Map<string, string>()

  posts.forEach((post) => {
    const cover = post.featuredImage
    if (!cover) return
    const match = cover.match(/^media:\/\/([a-zA-Z0-9_-]+)$/)
    if (match?.[1]) tokenToMediaId.set(cover, match[1])
  })

  if (tokenToMediaId.size === 0) return {}

  try {
    const mediaMap = await resolveMediaUrls(Array.from(tokenToMediaId.values()))
    const resolvedByToken: Record<string, string> = {}

    tokenToMediaId.forEach((mediaId, token) => {
      const resolved = mediaMap[mediaId]?.url
      if (resolved) resolvedByToken[token] = resolved
    })

    return resolvedByToken
  } catch {
    return {}
  }
}

export const useProfilePosts = ({ status, user }: UseProfilePostsParams): UseProfilePostsResult => {
  const navigate = useNavigate()
  const location = useLocation()

  const [publishedBlogs, setPublishedBlogs] = useState<ProfileBlogPost[]>([])
  const [draftBlogs, setDraftBlogs] = useState<ProfileBlogPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [publishedPagination, setPublishedPagination] = useState<ProfilePaginationState>({
    page: 1,
    limit: 6,
    total: 0,
  })
  const [draftPagination, setDraftPagination] = useState<ProfilePaginationState>({
    page: 1,
    limit: 6,
    total: 0,
  })

  const loadBlogs = async () => {
    const repository = getBlogRepository()

    const publishedResult = await repository.getCurrentUserPosts(
      'published',
      publishedPagination.page,
      publishedPagination.limit,
    )
    if (publishedResult.success && publishedResult.data) {
      const resolvedPublishedImages = await resolveFeaturedImages(publishedResult.data)
      const mappedPublished = publishedResult.data.map((post) =>
        mapBlogSummaryToProfilePost(post, resolvedPublishedImages),
      )
      setPublishedBlogs(mappedPublished)
      const publishedTotal = publishedResult.metadata?.total
      if (publishedTotal !== undefined) {
        setPublishedPagination((prev) => ({ ...prev, total: publishedTotal }))
      }
    }

    const draftsResult = await repository.getCurrentUserPosts(
      'draft',
      draftPagination.page,
      draftPagination.limit,
    )
    if (draftsResult.success && draftsResult.data) {
      const resolvedDraftImages = await resolveFeaturedImages(draftsResult.data)
      const mappedDrafts = draftsResult.data.map((post) =>
        mapBlogSummaryToProfilePost(post, resolvedDraftImages),
      )
      setDraftBlogs(mappedDrafts)
      const draftTotal = draftsResult.metadata?.total
      if (draftTotal !== undefined) {
        setDraftPagination((prev) => ({ ...prev, total: draftTotal }))
      }
    }
  }

  useEffect(() => {
    if (status === AuthStatus.LOADING || status === AuthStatus.UNAUTHENTICATED || !user) {
      setPostsLoading(false)
      return
    }

    const loadUserPosts = async () => {
      setPostsLoading(true)
      void getBlogRepository().clearCache()

      try {
        await loadBlogs()
      } catch (error) {
        console.error('Error loading user posts:', error)
      } finally {
        setPostsLoading(false)
      }
    }

    void loadUserPosts()
  }, [
    location.pathname,
    user,
    status,
    publishedPagination.page,
    publishedPagination.limit,
    draftPagination.page,
    draftPagination.limit,
  ])

  useEffect(() => {
    if (status === AuthStatus.UNAUTHENTICATED || !user) {
      setPublishedBlogs([])
      setDraftBlogs([])
      setPostsLoading(false)
    }
  }, [status, user])

  const handleDelete = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return
    }

    try {
      const result = await getBlogRepository().deletePost(blogId)
      if (result.success) {
        await loadBlogs()
      }
    } catch (error) {
      console.error('Error deleting blog post:', error)
    }
  }

  const handleEdit = (blogId: string) => {
    navigate(`/blog-editor?id=${blogId}`, {
      state: { fromProfile: true, authorizedEdit: true },
    })
  }

  const handlePublishedPageChange = (page: number) => {
    setPublishedPagination((prev) => ({ ...prev, page }))
  }

  const handleDraftPageChange = (page: number) => {
    setDraftPagination((prev) => ({ ...prev, page }))
  }

  return {
    postsLoading,
    publishedBlogs,
    draftBlogs,
    publishedPagination,
    draftPagination,
    handlePublishedPageChange,
    handleDraftPageChange,
    handleEdit,
    handleDelete,
  }
}
