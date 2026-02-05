/**
 * useAutoSave Hook - Handles automatic saving and local storage backup
 *
 * Follows Single Responsibility Principle by managing auto-save timers,
 * local storage operations, and backend saving logic separate from UI components.
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { getBlogRepository } from '../core/di/container'
import { BlogPost } from '../core/types/blog.types'

interface UseAutoSaveOptions {
  autoSaveDelay?: number // Auto-save delay in milliseconds (default: 5000)
  localSaveDelay?: number // Local storage delay in milliseconds (default: 1000)
  enabled?: boolean // Enable/disable auto-save (default: true)
}

interface AutoSaveState {
  isSaving: boolean
  saveStatus: 'saved' | 'saving' | 'error'
  lastSaved?: Date
}

export function useAutoSave(
  title: string,
  contentMarkdown: string,
  contentJSON: string,
  tags: string[],
  postId: number | null,
  options: UseAutoSaveOptions = {},
) {
  const { autoSaveDelay = 5000, localSaveDelay = 1000, enabled = true } = options
  const [currentPostId, setCurrentPostId] = useState<number | null>(postId)
  const activePostId = currentPostId ?? postId

  // State management
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    saveStatus: 'saved',
  })

  // Refs for timers
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const localSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (postId) {
      setCurrentPostId(postId)
    }
  }, [postId])

  // Local storage backup
  const saveToLocalStorage = useCallback(() => {
    if (!title.trim() || !contentMarkdown) return

    try {
      localStorage.setItem(
        'blog_draft_backup',
        JSON.stringify({
          title,
          contentMarkdown,
          contentJSON,
          tags,
          timestamp: new Date().toISOString(),
        }),
      )
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }, [title, contentMarkdown, contentJSON, tags])

  // Backend auto-save
  const saveToBackend = useCallback(async () => {
    if (!title.trim() || !contentMarkdown) return

    setState((prev) => ({ ...prev, saveStatus: 'saving', isSaving: true }))

    try {
      const postData = {
        title: title.trim(),
        content_markdown: contentMarkdown,
        content_json: '{}',
        status: 'draft' as const,
        tag_names: tags,
      }

      const repository = getBlogRepository()
      let updatedPostId = activePostId

      if (updatedPostId) {
        // Update existing post
        const result = await repository.updatePost(updatedPostId.toString(), postData)
        if (!result.success) {
          throw new Error(result.error || 'Failed to update post')
        }
      } else {
        // Create new post
        const result = await repository.createPost({
          title: postData.title,
          content_markdown: postData.content_markdown,
          content_json: postData.content_json,
          status: postData.status,
          tags: tags,
          author: { username: '', avatar: undefined },
          excerpt: '',
          slug: '',
          readingTime: 1,
        } as Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>)

        if (result.success && result.data?.id) {
          updatedPostId = parseInt(result.data.id)
          setCurrentPostId(updatedPostId)
        } else {
          throw new Error(result.error || 'Failed to create post')
        }
      }

      setState({
        isSaving: false,
        saveStatus: 'saved',
        lastSaved: new Date(),
      })

      console.log('✅ Auto-saved to backend')

      // Return the updated post ID in case it was newly created
      return updatedPostId
    } catch (error) {
      console.error('Error auto-saving to backend:', error)
      setState((prev) => ({
        ...prev,
        saveStatus: 'error',
        isSaving: false,
      }))

      // Don't show toast for auto-save errors to avoid interrupting user
      return null
    }
  }, [title, contentMarkdown, contentJSON, activePostId, tags])

  // Manual publish function (extracted from original component)
  const publishPost = useCallback(async () => {
    if (!title.trim()) {
      throw new Error('Please add a title for your blog post')
    }

    if (!contentMarkdown.trim()) {
      throw new Error('Please add content to your blog post')
    }

    const postData = {
      title: title.trim(),
      content_markdown: contentMarkdown,
      content_json: '{}',
      status: 'published' as const,
      tag_names: tags,
    }

    const repository = getBlogRepository()

    try {
      if (activePostId) {
        // Update existing post
        const result = await repository.updatePost(activePostId.toString(), postData)
        if (!result.success) {
          throw new Error(result.error || 'Failed to update blog post')
        }
        return result.data
      } else {
        // Create new post
        const result = await repository.createPost({
          title: postData.title,
          content_markdown: postData.content_markdown,
          content_json: postData.content_json,
          status: postData.status,
          tags: tags,
          author: { username: '', avatar: undefined },
          excerpt: '',
          slug: '',
          readingTime: 1,
        } as Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>)

        if (!result.success) {
          throw new Error(result.error || 'Failed to create blog post')
        }

        if (result.data?.id) {
          setCurrentPostId(parseInt(result.data.id))
        }

        return result.data
      }
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error
          ? error.message
          : `Failed to ${activePostId ? 'update' : 'publish'} blog post`,
      )
    }
  }, [title, contentMarkdown, contentJSON, activePostId, tags])

  // Clear local storage backup
  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('blog_draft_backup')
  }, [])

  // Set up auto-save timers
  useEffect(() => {
    if (!enabled) return

    // Clear existing timers
    if (localSaveTimer.current) {
      clearTimeout(localSaveTimer.current)
    }
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    // Set new timers
    localSaveTimer.current = setTimeout(saveToLocalStorage, localSaveDelay)
    autoSaveTimer.current = setTimeout(saveToBackend, autoSaveDelay)

    return () => {
      if (localSaveTimer.current) {
        clearTimeout(localSaveTimer.current)
      }
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [saveToLocalStorage, saveToBackend, enabled, localSaveDelay, autoSaveDelay])

  // Public API
  return {
    // State
    isSaving: state.isSaving,
    saveStatus: state.saveStatus,
    lastSaved: state.lastSaved,
    currentPostId,

    // Methods
    saveToBackend,
    publishPost,
    clearLocalStorage,

    // Status helpers
    getSaveStatusText: () => {
      if (state.isSaving || state.saveStatus === 'saving') return 'Saving...'
      if (state.saveStatus === 'error') return 'Save failed'
      if (activePostId) return 'Draft saved'
      return 'Draft'
    },
  }
}
