import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { getBlogRepository } from '../../core/di/container'
import { BlogArchivePost } from '../blog/blog.types'

interface UseOwnerBlogPostDetailOptions {
  redirectPath: string
  routeUsername?: string
  authenticatedUsername?: string
}

const buildOwnerPostErrorMessage = (statusCode?: number) => {
  if (statusCode === 401) {
    return 'Your session has expired. Please sign in again.'
  }

  if (statusCode === 403) {
    return 'You are not allowed to view this post from the profile workspace.'
  }

  if (statusCode === 404) {
    return 'This post is not available in your workspace.'
  }

  return 'Unable to load this post right now.'
}

export const useOwnerBlogPostDetail = ({
  redirectPath,
  routeUsername,
  authenticatedUsername,
}: UseOwnerBlogPostDetailOptions) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [post, setPost] = useState<BlogArchivePost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !authenticatedUsername) {
      setPost(null)
      setLoading(false)
      return
    }

    if (routeUsername && routeUsername !== authenticatedUsername) {
      toast({
        title: 'Access denied',
        description: 'You can only open posts from your own profile workspace.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
      navigate(redirectPath, { replace: true })
      setPost(null)
      setLoading(false)
      return
    }

    let isCancelled = false

    setLoading(true)
    setPost(null)

    const fetchOwnerPost = async () => {
      const result = await getBlogRepository().getCurrentUserPostById(id)

      if (isCancelled) {
        return
      }

      if (!result.success || !result.data) {
        toast({
          title: 'Post unavailable',
          description: buildOwnerPostErrorMessage(result.statusCode),
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
        navigate(redirectPath, { replace: true })
        return
      }

      setPost(result.data)
      setLoading(false)
    }

    void fetchOwnerPost().finally(() => {
      if (!isCancelled) {
        setLoading(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [authenticatedUsername, id, navigate, redirectPath, routeUsername, toast])

  return {
    post,
    loading,
  }
}
