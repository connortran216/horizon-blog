/**
 * useBlogPost Hook - Handles blog post loading and authorization
 *
 * Follows Single Responsibility Principle by managing post data access,
 * authorization checking, and loading states separate from UI logic.
 */

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { ApiError } from '../../../core'
import { PublicPostRecord } from '../../../core/types/blog.types'
import { getEditorPostService } from '../editor-post.service'

interface UseBlogPostOptions {
  redirectOnError?: boolean
}

interface UseBlogPostState {
  post: PublicPostRecord | null
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
  const redirectPath = user?.username ? `/profile/${user.username}` : '/'

  // Parse URL parameters and router state
  const postIdParam = new URLSearchParams(location.search).get('id')
  const routerPost = location.state?.blog as PublicPostRecord | undefined
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
          navigate(redirectPath, { replace: true })
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
          navigate(redirectPath, { replace: true })
        }

        return false
      }

      return true
    },
    [authorizedEdit, navigate, redirectOnError, redirectPath, toast, user],
  )

  // Load post data
  const loadPost = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      let post = routerPost

      // Load by ID if URL parameter exists and no router state
      if (postIdParam && !post) {
        try {
          post = await getEditorPostService().loadEditablePost(postIdParam, user?.id ?? 0)
        } catch (error) {
          const statusCode = error instanceof ApiError ? error.status : undefined
          const errorMsg =
            statusCode === 404
              ? 'This post is not available in your workspace.'
              : statusCode === 401
                ? 'Your session has expired. Please sign in again.'
                : statusCode === 403
                  ? 'You do not have permission to edit this post.'
                  : 'Failed to load post'

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
            navigate(redirectPath, { replace: true })
          }

          return
        }
      }

      // Initialize state from loaded post
      if (post) {
        // For editing, check authorization
        if (postIdParam && !checkAuthorization(post)) {
          return
        }

        setState({
          post,
          postId: post.id ? Number(post.id) : null,
          isLoading: false,
          error: null,
        })
      } else {
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
        navigate(redirectPath, { replace: true })
      }
    }
  }, [checkAuthorization, navigate, postIdParam, redirectOnError, redirectPath, routerPost, toast])

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
