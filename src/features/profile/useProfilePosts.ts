import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useToast } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBlogService } from '../../core'
import { AuthStatus } from '../../core/types/auth.types'
import { OwnerPublicationView } from '../../core/types/blog.types'
import { User } from '../../core/types/common.types'
import { ProfileBlogPost, ProfilePaginationState } from './profile.types'
import { mapBlogSummaryToProfilePost } from './profile.utils'

interface UseProfilePostsParams {
  status: AuthStatus
  user: User | null
}

interface UseProfilePostsResult {
  postsLoading: boolean
  publishedBlogs: ProfileBlogPost[]
  scheduledBlogs: ProfileBlogPost[]
  draftBlogs: ProfileBlogPost[]
  publishedPagination: ProfilePaginationState
  scheduledPagination: ProfilePaginationState
  draftPagination: ProfilePaginationState
  scheduleClock: Date
  handlePublishedPageChange: (page: number) => void
  handleScheduledPageChange: (page: number) => void
  handleDraftPageChange: (page: number) => void
  handleEdit: (blogId: string) => void
  handleReschedule: (blogId: string) => void
  handlePublishNow: (blogId: string) => void
  handleCancelSchedule: (blog: ProfileBlogPost) => Promise<void>
  handleDelete: (blogId: string) => Promise<void>
}

const INITIAL_PAGINATION: ProfilePaginationState = { page: 1, limit: 9, total: 0 }
const DUE_REFRESH_INTERVAL_MS = 15_000

export const useProfilePosts = ({ status, user }: UseProfilePostsParams): UseProfilePostsResult => {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const [publishedBlogs, setPublishedBlogs] = useState<ProfileBlogPost[]>([])
  const [scheduledBlogs, setScheduledBlogs] = useState<ProfileBlogPost[]>([])
  const [draftBlogs, setDraftBlogs] = useState<ProfileBlogPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [scheduleClock, setScheduleClock] = useState(new Date())
  const [publishedPagination, setPublishedPagination] =
    useState<ProfilePaginationState>(INITIAL_PAGINATION)
  const [scheduledPagination, setScheduledPagination] =
    useState<ProfilePaginationState>(INITIAL_PAGINATION)
  const [draftPagination, setDraftPagination] = useState<ProfilePaginationState>(INITIAL_PAGINATION)

  const loadView = useCallback(
    async (
      view: OwnerPublicationView,
      pagination: ProfilePaginationState,
      setBlogs: (blogs: ProfileBlogPost[]) => void,
      setPagination: Dispatch<SetStateAction<ProfilePaginationState>>,
    ) => {
      const page = await getBlogService().getCurrentUserPublicationPage(
        view,
        pagination.page,
        pagination.limit,
      )
      setBlogs(page.posts.map((post) => mapBlogSummaryToProfilePost(post)))
      setPagination((previous) => {
        const lastPage = Math.max(1, Math.ceil(page.total / previous.limit))
        const nextPage = Math.min(previous.page, lastPage)
        return previous.total === page.total && previous.page === nextPage
          ? previous
          : { ...previous, page: nextPage, total: page.total }
      })
      return page
    },
    [],
  )

  const loadScheduled = useCallback(async () => {
    await loadView('scheduled', scheduledPagination, setScheduledBlogs, setScheduledPagination)
  }, [loadView, scheduledPagination])

  const loadBlogs = useCallback(async () => {
    await Promise.all([
      loadView('published', publishedPagination, setPublishedBlogs, setPublishedPagination),
      loadScheduled(),
      loadView('draft', draftPagination, setDraftBlogs, setDraftPagination),
    ])
  }, [draftPagination, loadScheduled, loadView, publishedPagination])

  useEffect(() => {
    if (status === AuthStatus.LOADING || status === AuthStatus.UNAUTHENTICATED || !user) {
      setPostsLoading(false)
      return
    }

    let active = true
    setPostsLoading(true)
    loadBlogs()
      .catch((error) => console.error('Error loading user posts:', error))
      .finally(() => {
        if (active) setPostsLoading(false)
      })

    return () => {
      active = false
    }
  }, [loadBlogs, location.pathname, status, user])

  useEffect(() => {
    if (status !== AuthStatus.UNAUTHENTICATED && user) return
    setPublishedBlogs([])
    setScheduledBlogs([])
    setDraftBlogs([])
    setPostsLoading(false)
  }, [status, user])

  useEffect(() => {
    if (scheduledBlogs.length === 0) return

    const interval = window.setInterval(() => {
      const now = new Date()
      setScheduleClock(now)

      const hasDueBlog = scheduledBlogs.some((blog) => {
        if (!blog.scheduledPublishAt) return true
        const scheduledAt = new Date(blog.scheduledPublishAt).getTime()
        return !Number.isFinite(scheduledAt) || scheduledAt <= now.getTime()
      })

      if (document.visibilityState === 'visible' && hasDueBlog) {
        void loadBlogs().catch((error) => console.error('Error refreshing scheduled posts:', error))
      }
    }, DUE_REFRESH_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [loadBlogs, scheduledBlogs])

  const handleEdit = (blogId: string) => {
    navigate(`/blog-editor?id=${blogId}`, {
      state: { fromProfile: true, authorizedEdit: true },
    })
  }

  const handleReschedule = (blogId: string) => {
    navigate(`/blog-editor/publish?id=${blogId}&mode=schedule`)
  }

  const handlePublishNow = (blogId: string) => {
    navigate(`/blog-editor/publish?id=${blogId}&mode=now`)
  }

  const handleCancelSchedule = async (blog: ProfileBlogPost) => {
    if (!window.confirm(`Cancel the schedule for “${blog.title}”? It will return to Drafts.`)) {
      return
    }

    try {
      await getBlogService().cancelPostSchedule(blog.id)
      toast({
        title: 'Schedule canceled',
        description: `“${blog.title}” is now an unscheduled draft.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Could not confirm the cancellation',
        description: 'The list was refreshed. Check the current state before trying again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      console.error('Error canceling blog schedule:', error)
    } finally {
      await loadBlogs().catch((error) => console.error('Error refreshing user posts:', error))
    }
  }

  const handleDelete = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return

    try {
      await getBlogService().deletePostOrThrow(blogId)
      toast({ title: 'Blog deleted', status: 'success', duration: 3000, isClosable: true })
    } catch (error) {
      toast({
        title: 'Could not confirm the deletion',
        description: 'The list was refreshed. Check the current state before trying again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      console.error('Error deleting blog post:', error)
    } finally {
      await loadBlogs().catch((error) => console.error('Error refreshing user posts:', error))
    }
  }

  return {
    postsLoading,
    publishedBlogs,
    scheduledBlogs,
    draftBlogs,
    publishedPagination,
    scheduledPagination,
    draftPagination,
    scheduleClock,
    handlePublishedPageChange: (page) =>
      setPublishedPagination((previous) => ({ ...previous, page })),
    handleScheduledPageChange: (page) =>
      setScheduledPagination((previous) => ({ ...previous, page })),
    handleDraftPageChange: (page) => setDraftPagination((previous) => ({ ...previous, page })),
    handleEdit,
    handleReschedule,
    handlePublishNow,
    handleCancelSchedule,
    handleDelete,
  }
}
