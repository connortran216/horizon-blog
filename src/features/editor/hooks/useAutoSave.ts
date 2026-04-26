/**
 * useAutoSave Hook - Handles automatic saving and local storage backup
 *
 * Follows Single Responsibility Principle by managing auto-save timers,
 * local storage operations, and backend saving logic separate from UI components.
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { ApiError } from '../../../core/services/api.service'
import { EditorPostInput, getEditorPostService } from '../editor-post.service'

interface UseAutoSaveOptions {
  autoSaveDelay?: number // Auto-save delay in milliseconds (default: 5000)
  localSaveDelay?: number // Local storage delay in milliseconds (default: 1000)
  enabled?: boolean // Enable/disable auto-save (default: true)
}

interface AutoSaveState {
  isSaving: boolean
  saveStatus: 'saved' | 'saving' | 'error'
  lastSaved?: Date
  validationMessage?: string
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
  const postIdRef = useRef<number | null>(postId)
  const createInFlightRef = useRef<Promise<number | null> | null>(null)

  // State management
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    saveStatus: 'saved',
  })

  // Refs for timers
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const localSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setValidationState = useCallback((error: unknown) => {
    setState((prev) => ({
      ...prev,
      validationMessage:
        error instanceof ApiError && error.status === 400 ? error.message : undefined,
    }))
  }, [])

  const buildEditorPostInput = useCallback(
    (): EditorPostInput => ({
      title: title.trim(),
      content_markdown: contentMarkdown,
      content_json: '{}',
      tag_names: tags,
    }),
    [contentMarkdown, tags, title],
  )

  useEffect(() => {
    if (postId) {
      setCurrentPostId(postId)
      postIdRef.current = postId
    }
  }, [postId])

  useEffect(() => {
    postIdRef.current = currentPostId ?? postId
  }, [currentPostId, postId])

  useEffect(() => {
    setState((prev) => (prev.validationMessage ? { ...prev, validationMessage: undefined } : prev))
  }, [contentMarkdown, title])

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
      setValidationState(undefined)
      const postData = buildEditorPostInput()
      const editorPostService = getEditorPostService()
      let updatedPostId = postIdRef.current

      if (!updatedPostId && createInFlightRef.current) {
        updatedPostId = await createInFlightRef.current
      }

      if (updatedPostId) {
        await editorPostService.saveDraft(updatedPostId.toString(), postData)
      } else {
        const createPromise = (async () => {
          const savedPost = await editorPostService.saveDraft(null, postData)
          const createdPostId = Number(savedPost.id)
          setCurrentPostId(createdPostId)
          postIdRef.current = createdPostId
          return createdPostId
        })()

        createInFlightRef.current = createPromise
        try {
          updatedPostId = await createPromise
        } finally {
          if (createInFlightRef.current === createPromise) {
            createInFlightRef.current = null
          }
        }
      }

      setState({
        isSaving: false,
        saveStatus: 'saved',
        lastSaved: new Date(),
        validationMessage: undefined,
      })

      // Return the updated post ID in case it was newly created
      return updatedPostId
    } catch (error) {
      console.error('Error auto-saving to backend:', error)
      setValidationState(error)
      setState((prev) => ({
        ...prev,
        saveStatus: 'error',
        isSaving: false,
      }))

      // Don't show toast for auto-save errors to avoid interrupting user
      return null
    }
  }, [buildEditorPostInput, contentMarkdown, setValidationState, title])

  // Manual publish function (extracted from original component)
  const publishPost = useCallback(async () => {
    if (!title.trim()) {
      throw new Error('Please add a title for your blog post')
    }

    if (!contentMarkdown.trim()) {
      throw new Error('Please add content to your blog post')
    }

    const postData = buildEditorPostInput()
    const editorPostService = getEditorPostService()

    try {
      setValidationState(undefined)
      let targetPostId = postIdRef.current

      if (!targetPostId && createInFlightRef.current) {
        targetPostId = await createInFlightRef.current
      }

      if (targetPostId) {
        const publishedPost = await editorPostService.publish(targetPostId.toString(), postData)
        setState((prev) => ({
          ...prev,
          validationMessage: undefined,
        }))
        return publishedPost
      } else {
        const publishedPost = await editorPostService.publish(null, postData)

        if (publishedPost.id) {
          setCurrentPostId(Number(publishedPost.id))
        }

        setState((prev) => ({
          ...prev,
          validationMessage: undefined,
        }))

        return publishedPost
      }
    } catch (error: unknown) {
      setValidationState(error)
      if (error instanceof Error) {
        throw error
      }

      throw new Error(`Failed to ${postIdRef.current ? 'update' : 'publish'} blog post`)
    }
  }, [buildEditorPostInput, contentMarkdown, setValidationState, title])

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
    validationMessage: state.validationMessage,

    // Methods
    saveToBackend,
    publishPost,
    clearLocalStorage,

    // Status helpers
    getSaveStatusText: () => {
      if (state.isSaving || state.saveStatus === 'saving') return 'Saving...'
      if (state.saveStatus === 'error') return 'Save failed'
      if (postIdRef.current) return 'Draft saved'
      return 'Draft'
    },
  }
}
