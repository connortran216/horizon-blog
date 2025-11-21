/**
 * useBlogPost Hook - Handles blog post loading and authorization
 *
 * Follows Single Responsibility Principle by managing post data access,
 * authorization checking, and loading states separate from UI logic.
 */

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { getBlogRepository } from '../core/di/container'
import { BlogPost } from '../core/types/blog.types'

interface UseBlogPostOptions {
  redirectOnError?: boolean
}

interface UseBlogPostState {
  post: BlogPost | null
  isLoading: boolean
  error: string | null
  postId: number | null
}

export function useBlogPost(options: UseBlogPostOptions = {}) {
  const { redirectOnError = true } = options
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  // Parse URL parameters and router state
  const postIdParam = new URLSearchParams(location.search).get('id')
  const routerPost = location.state?.blog
  const authorizedEdit = location.state?.authorizedEdit || false

  // State management
  const [state, setState] = useState<UseBlogPostState>({
    post: null,
    isLoading: false,
    error: null,
    postId: null,
  })

  // Authorization and ownership check
  const checkAuthorization = useCallback(
    (post: { user_id: number; id?: string | number }) => {
      if (!user || post.user_id !== user.id) {
        const errorMsg =
          'You do not have permission to edit this post. Only the post owner can edit from their profile.'

        setState((prev) => ({
          ...prev,
          error: errorMsg,
          isLoading: false,
        }))

        toast({
          title: 'Access Denied',
          description: errorMsg,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })

        if (redirectOnError) {
          navigate(`/blog/${postIdParam}`)
        }

        return false
      }

      // Check if access is authorized (coming from Profile page)
      if (!authorizedEdit) {
        const errorMsg = 'Please use the Edit option from your profile to edit your posts.'

        setState((prev) => ({
          ...prev,
          error: errorMsg,
          isLoading: false,
        }))

        toast({
          title: 'Access Denied',
          description: errorMsg,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })

        if (redirectOnError) {
          navigate(`/blog/${postIdParam}`)
        }

        return false
      }

      return true
    },
    [user, authorizedEdit, toast, navigate, postIdParam, redirectOnError],
  )

  // Load post data
  const loadPost = useCallback(async () => {
    console.log(
      '🚀 Loading blog post with postIdParam:',
      postIdParam,
      'routerPost:',
      routerPost?.id,
    )

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      let post = routerPost

      // Load by ID if URL parameter exists and no router state
      if (postIdParam && !post) {
        console.log('🔗 Loading post by ID:', postIdParam)
        const repository = getBlogRepository()
        const result = await repository.getPostById(postIdParam)

        if (!result.success || !result.data) {
          const errorMsg = 'Post not found'

          setState({
            post: null,
            postId: null,
            isLoading: false,
            error: errorMsg,
          })

          toast({
            title: 'Error',
            description: errorMsg,
            status: 'error',
            duration: 3000,
            isClosable: true,
          })

          if (redirectOnError) {
            navigate('/')
          }

          return
        }

        post = result.data
      }

      // Initialize state from loaded post
      if (post) {
        console.log(
          '📋 Loading post:',
          post.title,
          'with content length:',
          post.content_markdown?.length || 0,
        )

        // For editing, check authorization
        if (postIdParam && !checkAuthorization(post)) {
          return
        }

        setState({
          post,
          postId: post.id ? parseInt(post.id) : null,
          isLoading: false,
          error: null,
        })

        console.log('✅ Post loaded successfully')
      } else {
        // New post
        console.log('🆕 Initializing new post')
        setState({
          post: null,
          postId: null,
          isLoading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('❌ Error loading post:', error)

      const errorMsg = 'Failed to load post'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }))

      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })

      if (redirectOnError) {
        navigate('/')
      }
    }
  }, [postIdParam, routerPost, toast, navigate, checkAuthorization, redirectOnError])

  // Load post on mount and when parameters change
  useEffect(() => {
    loadPost()
  }, [loadPost])

  // Public API
  return {
    post: state.post,
    isLoading: state.isLoading,
    error: state.error,
    postId: state.postId,
    isNewPost: !state.post && !postIdParam,
    isEditing: !!postIdParam,
    reloadPost: loadPost,
  }
}
