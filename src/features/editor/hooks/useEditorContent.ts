/**
 * useEditorContent Hook - Manages editor content state
 *
 * Follows Single Responsibility Principle by managing editor content state,
 * validation, and change handling separate from UI logic.
 *
 * Release M6 removed the tag *input* state from this hook - `tagInput`,
 * `setTagInput`, `addTag` and `handleAddTagByEnter`. The design system's
 * `TagField` owns the text being typed, the Enter/comma commit and the
 * duplicate check; what a caller needs back from it is the finished list, which
 * is `tags` and `setTags`. The lower-casing those removed functions performed
 * moved to `EditorTagField`, so `tag_names` still leaves this feature the same
 * shape it always has.
 */

import { useState, useCallback, useEffect } from 'react'

interface EditorContentState {
  title: string
  contentMarkdown: string
  contentJSON: string
  tags: string[]
}

interface EditorContentActions {
  setTitle: (title: string) => void
  setContentMarkdown: (markdown: string) => void
  setContentJSON: (json: string) => void
  setTags: (tags: string[]) => void

  // Tag management
  removeTag: (tagToRemove: string) => void

  // Content change handler for editor
  handleEditorChange: (markdown: string) => void

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

  const removeTag = useCallback((tagToRemove: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }, [])

  // Markdown is canonical. Keep JSON as temporary compatibility payload for backend validation.
  const handleEditorChange = useCallback(
    (markdown: string) => {
      setContentMarkdown(markdown)
      setContentJSON('{}')
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

    // Setters
    setTitle,
    setContentMarkdown,
    setContentJSON,
    setTags,

    // Tag management
    removeTag,

    // Editor integration
    handleEditorChange,

    // Validation
    isTitleValid,
    isContentValid,
    getValidationErrors,
  } as EditorContentState & EditorContentActions
}
