import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBlogService } from '../../core'
import { User } from '../../core/types/common.types'
import { AuthStatus } from '../../core/types/auth.types'
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

export const useProfilePosts = ({ status, user }: UseProfilePostsParams): UseProfilePostsResult => {
  const navigate = useNavigate()
  const location = useLocation()

  const [publishedBlogs, setPublishedBlogs] = useState<ProfileBlogPost[]>([])
  const [draftBlogs, setDraftBlogs] = useState<ProfileBlogPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [publishedPagination, setPublishedPagination] = useState<ProfilePaginationState>({
    page: 1,
    limit: 9,
    total: 0,
  })
  const [draftPagination, setDraftPagination] = useState<ProfilePaginationState>({
    page: 1,
    limit: 9,
    total: 0,
  })

  const loadBlogs = async () => {
    const blogService = getBlogService()
    const publishedPage = await blogService.getCurrentUserPostsPage(
      'published',
      publishedPagination.page,
      publishedPagination.limit,
    )
    const mappedPublished = publishedPage.posts.map((post) => mapBlogSummaryToProfilePost(post))
    setPublishedBlogs(mappedPublished)
    setPublishedPagination((prev) => ({ ...prev, total: publishedPage.total }))

    const draftPage = await blogService.getCurrentUserPostsPage(
      'draft',
      draftPagination.page,
      draftPagination.limit,
    )
    const mappedDrafts = draftPage.posts.map((post) => mapBlogSummaryToProfilePost(post))
    setDraftBlogs(mappedDrafts)
    setDraftPagination((prev) => ({ ...prev, total: draftPage.total }))
  }

  useEffect(() => {
    if (status === AuthStatus.LOADING || status === AuthStatus.UNAUTHENTICATED || !user) {
      setPostsLoading(false)
      return
    }

    const loadUserPosts = async () => {
      setPostsLoading(true)

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
      await getBlogService().deletePostOrThrow(blogId)
      await loadBlogs()
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
