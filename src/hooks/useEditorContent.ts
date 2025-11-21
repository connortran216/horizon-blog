/**
 * useEditorContent Hook - Manages editor content state
 *
 * Follows Single Responsibility Principle by managing editor content state,
 * validation, and change handling separate from UI logic.
 */

import { useState, useCallback, useEffect } from 'react'

interface EditorContentState {
  title: string
  contentMarkdown: string
  contentJSON: string
  tags: string[]
  tagInput: string
}

interface EditorContentActions {
  setTitle: (title: string) => void
  setContentMarkdown: (markdown: string) => void
  setContentJSON: (json: string) => void
  setTags: (tags: string[]) => void
  setTagInput: (input: string) => void

  // Tag management
  addTag: (tag: string) => void
  removeTag: (tagToRemove: string) => void
  handleAddTagByEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void

  // Content change handler for editor
  handleEditorChange: (markdown: string, prosemirrorJSON: string) => void

  // Validation helpers
  isTitleValid: () => boolean
  isContentValid: () => boolean
  getValidationErrors: () => string[]
}

export function useEditorContent(initialValues: Partial<EditorContentState> = {}) {
  const [state, setState] = useState<EditorContentState>({
    title: initialValues.title || '',
    contentMarkdown: initialValues.contentMarkdown || '',
    contentJSON: initialValues.contentJSON || '',
    tags: initialValues.tags || [],
    tagInput: initialValues.tagInput || '',
  })

  // Load initial values when they become available (e.g., when post loads asynchronously)
  // Only load if we don't have content yet to avoid overriding user edits
  useEffect(() => {
    if (
      initialValues &&
      !state.title &&
      !state.contentMarkdown &&
      (initialValues.title ||
        initialValues.contentMarkdown ||
        (initialValues.tags && initialValues.tags.length > 0))
    ) {
      console.log('📝 Loading initial content into editor:', {
        title: initialValues.title,
        contentLength: initialValues.contentMarkdown?.length || 0,
        tagsCount: initialValues.tags?.length || 0,
      })

      setState((prev) => ({
        ...prev,
        title: initialValues.title ?? prev.title,
        contentMarkdown: initialValues.contentMarkdown ?? prev.contentMarkdown,
        contentJSON: initialValues.contentJSON ?? prev.contentJSON,
        tags: initialValues.tags ?? prev.tags,
      }))
    }
  }, [initialValues, state.title, state.contentMarkdown])

  // Basic setters
  const setTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, title }))
  }, [])

  const setContentMarkdown = useCallback((markdown: string) => {
    setState((prev) => ({ ...prev, contentMarkdown: markdown }))
  }, [])

  const setContentJSON = useCallback((json: string) => {
    setState((prev) => ({ ...prev, contentJSON: json }))
  }, [])

  const setTags = useCallback((tags: string[]) => {
    setState((prev) => ({ ...prev, tags }))
  }, [])

  const setTagInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, tagInput: input }))
  }, [])

  // Tag management functions
  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim().toLowerCase()
      if (trimmedTag && !state.tags.includes(trimmedTag)) {
        setState((prev) => ({
          ...prev,
          tags: [...prev.tags, trimmedTag],
          tagInput: '',
        }))
      }
    },
    [state.tags],
  )

  const removeTag = useCallback((tagToRemove: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }, [])

  const handleAddTagByEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && state.tagInput.trim()) {
        e.preventDefault()
        addTag(state.tagInput)
      }
    },
    [state.tagInput, addTag],
  )

  // Editor content change handler
  const handleEditorChange = useCallback(
    (markdown: string, prosemirrorJSON: string) => {
      setContentMarkdown(markdown)

      // Validate and store ProseMirror JSON
      try {
        // Validate that it's proper JSON
        const parsed = JSON.parse(prosemirrorJSON)

        // Validate it has the expected ProseMirror structure
        if (parsed && typeof parsed === 'object') {
          setContentJSON(prosemirrorJSON)
        } else {
          console.warn('⚠️ Invalid ProseMirror JSON structure, using fallback')
          setContentJSON('{}')
        }
      } catch (error) {
        console.error('❌ Failed to parse ProseMirror JSON:', error)
        setContentJSON('{}')
      }
    },
    [setContentMarkdown, setContentJSON],
  )

  // Validation functions
  const isTitleValid = useCallback(() => {
    return state.title.trim().length > 0
  }, [state.title])

  const isContentValid = useCallback(() => {
    return state.contentMarkdown.trim().length > 0
  }, [state.contentMarkdown])

  const getValidationErrors = useCallback((): string[] => {
    const errors: string[] = []

    if (!isTitleValid()) {
      errors.push('Title is required')
    }

    if (!isContentValid()) {
      errors.push('Content is required')
    }

    return errors
  }, [isTitleValid, isContentValid])

  // Public API
  return {
    // Current state
    title: state.title,
    contentMarkdown: state.contentMarkdown,
    contentJSON: state.contentJSON,
    tags: state.tags,
    tagInput: state.tagInput,

    // Setters
    setTitle,
    setContentMarkdown,
    setContentJSON,
    setTags,
    setTagInput,

    // Tag management
    addTag,
    removeTag,
    handleAddTagByEnter,

    // Editor integration
    handleEditorChange,

    // Validation
    isTitleValid,
    isContentValid,
    getValidationErrors,
  } as EditorContentState & EditorContentActions
}
