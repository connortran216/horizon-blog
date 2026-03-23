import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { apiService } from '../../core/services/api.service'
import { BlogArchivePost } from './blog.types'

interface UseBlogPostDetailOptions {
  redirectPath: string
  validatePost?: (post: BlogArchivePost) => string | null
}

export const useBlogPostDetail = ({ redirectPath, validatePost }: UseBlogPostDetailOptions) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [post, setPost] = useState<BlogArchivePost | null>(null)
  const [loading, setLoading] = useState(true)
  const validatePostRef = useRef(validatePost)

  useEffect(() => {
    validatePostRef.current = validatePost
  }, [validatePost])

  useEffect(() => {
    if (!id) {
      setPost(null)
      setLoading(false)
      return
    }

    let isCancelled = false
    setLoading(true)
    setPost(null)

    const fetchPost = async () => {
      try {
        const response = await apiService.get<{ data: BlogArchivePost }>(`/posts/${id}`)
        const foundPost = response.data

        if (isCancelled) {
          return
        }

        if (!foundPost) {
          toast({
            title: 'Post not found',
            description: 'The blog post you are looking for does not exist.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          navigate(redirectPath)
          return
        }

        const validationError = validatePostRef.current?.(foundPost)
        if (validationError) {
          toast({
            title: 'Access denied',
            description: validationError,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          navigate(redirectPath)
          return
        }

        setPost(foundPost)
      } catch (error: unknown) {
        if (isCancelled) {
          return
        }

        console.error('Error fetching post:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load blog post.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        navigate(redirectPath)
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
  }, [id, navigate, redirectPath, toast])

  return {
    post,
    loading,
  }
}
