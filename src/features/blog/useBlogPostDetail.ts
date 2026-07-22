import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, getBlogService, resolvePublicPostRouteSegment } from '../../core'
import { BlogArchivePost } from './blog.types'

const PUBLIC_NOT_FOUND_MESSAGE = 'This post is not published or is no longer available.'

export const useBlogPostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogArchivePost | null>(null)
  const [loading, setLoading] = useState(true)
  const [emptyStateMessage, setEmptyStateMessage] = useState(PUBLIC_NOT_FOUND_MESSAGE)
  const [statusCode, setStatusCode] = useState<number | undefined>()

  useEffect(() => {
    const route = resolvePublicPostRouteSegment(id)
    if (!route) {
      setPost(null)
      setLoading(false)
      setStatusCode(404)
      setEmptyStateMessage(PUBLIC_NOT_FOUND_MESSAGE)
      return
    }

    if (route.legacy) {
      setPost(null)
      setLoading(true)
      setStatusCode(undefined)
      setEmptyStateMessage(PUBLIC_NOT_FOUND_MESSAGE)
      navigate(route.canonicalPath, { replace: true })
      return
    }

    let isCancelled = false
    setLoading(true)
    setPost(null)
    setStatusCode(undefined)
    setEmptyStateMessage(PUBLIC_NOT_FOUND_MESSAGE)

    const fetchPost = async () => {
      try {
        const foundPost = await getBlogService().getPublicPostDetail(route.id)

        if (isCancelled) {
          return
        }

        if (!foundPost) {
          setStatusCode(404)
          setEmptyStateMessage(PUBLIC_NOT_FOUND_MESSAGE)
          return
        }

        setPost(foundPost)
      } catch (error: unknown) {
        if (isCancelled) {
          return
        }

        console.error('Error fetching post:', error)
        setPost(null)
        setStatusCode(error instanceof ApiError ? error.status : undefined)
        setEmptyStateMessage(
          error instanceof ApiError && error.status === 404
            ? PUBLIC_NOT_FOUND_MESSAGE
            : error instanceof Error
              ? error.message
              : 'Failed to load blog post.',
        )
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void fetchPost()

    return () => {
      isCancelled = true
    }
  }, [id, navigate])

  return {
    post,
    loading,
    emptyStateMessage,
    statusCode,
  }
}
