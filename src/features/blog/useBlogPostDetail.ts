import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
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
  const location = useLocation()
  const toast = useToast()
  const [post, setPost] = useState<BlogArchivePost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchPost = async () => {
      try {
        const response = await apiService.get<{ data: BlogArchivePost }>(`/posts/${id}`)
        const foundPost = response.data

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

        const validationError = validatePost?.(foundPost)
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
        setLoading(false)
      }
    }

    void fetchPost()
  }, [id, navigate, redirectPath, toast, validatePost, location.pathname])

  return {
    post,
    loading,
  }
}
