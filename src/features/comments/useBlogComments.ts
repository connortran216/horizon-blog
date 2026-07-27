import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyCommentRemoval,
  createSiblingPageState,
  failSiblingPageLoad,
  mergeSiblingPage,
  startSiblingPageLoad,
  upsertSiblingComment,
} from './comments.reducer'
import { getCommentsService } from './comments.dependencies'
import { Comment, CommentDiscussion, RemoveCommentResult, SiblingPageState } from './comments.types'

interface UseBlogCommentsOptions {
  postId?: number
  enabled?: boolean
}

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const createSubmissionId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20,
  )}-${hex.slice(20)}`
}

export const useBlogComments = ({ postId, enabled = true }: UseBlogCommentsOptions) => {
  const service = getCommentsService()
  const [topLevel, setTopLevel] = useState<SiblingPageState>(createSiblingPageState)
  const [replies, setReplies] = useState<Record<number, SiblingPageState>>({})
  const [discussion, setDiscussion] = useState<CommentDiscussion | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [mutatingCommentId, setMutatingCommentId] = useState<number | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const pendingSubmissionIds = useRef(new Map<string, string>())

  const updateCommentEverywhere = useCallback((comment: Comment) => {
    setTopLevel((state) =>
      state.items.some((item) => item.id === comment.id)
        ? upsertSiblingComment(state, comment)
        : state,
    )
    setReplies((state) => {
      const next = { ...state }
      Object.entries(next).forEach(([parentID, page]) => {
        if (page.items.some((item) => item.id === comment.id)) {
          next[Number(parentID)] = upsertSiblingComment(page, comment)
        }
      })
      return next
    })
  }, [])

  const loadPage = useCallback(
    async (parentId: number | null, append: boolean) => {
      if (!postId) return

      const current = parentId === null ? topLevel : (replies[parentId] ?? createSiblingPageState())
      const cursor = append ? (current.nextCursor ?? undefined) : undefined

      if (parentId === null) {
        setTopLevel((state) => startSiblingPageLoad(append ? state : createSiblingPageState()))
      } else {
        setReplies((state) => ({
          ...state,
          [parentId]: startSiblingPageLoad(
            append ? (state[parentId] ?? createSiblingPageState()) : createSiblingPageState(),
          ),
        }))
      }

      try {
        const page = await service.listComments(postId, {
          parentId: parentId ?? undefined,
          cursor,
        })
        setDiscussion(page.discussion)
        if (parentId === null) {
          setTopLevel((state) =>
            mergeSiblingPage(
              append ? state : createSiblingPageState(),
              page.comments,
              page.pagination,
            ),
          )
        } else {
          setReplies((state) => ({
            ...state,
            [parentId]: mergeSiblingPage(
              append ? (state[parentId] ?? createSiblingPageState()) : createSiblingPageState(),
              page.comments,
              page.pagination,
            ),
          }))
        }
      } catch (error) {
        const message = errorMessage(error, 'Failed to load comments.')
        if (parentId === null) {
          setTopLevel((state) => failSiblingPageLoad(state, message))
        } else {
          setReplies((state) => ({
            ...state,
            [parentId]: failSiblingPageLoad(state[parentId] ?? createSiblingPageState(), message),
          }))
        }
      }
    },
    [postId, replies, service, topLevel],
  )

  useEffect(() => {
    setTopLevel(createSiblingPageState())
    setReplies({})
    setDiscussion(null)
    setMutationError(null)
    pendingSubmissionIds.current.clear()

    if (enabled && postId) {
      void loadPage(null, false)
    }
    // Initial loads are intentionally keyed to the post, not pagination state.
  }, [enabled, postId])

  const createComment = useCallback(
    async (content: string, parentId: number | null = null) => {
      if (!postId) return
      setMutationError(null)
      const key = `${parentId ?? 'root'}:${content.trim()}`
      const submissionId = pendingSubmissionIds.current.get(key) ?? createSubmissionId()
      pendingSubmissionIds.current.set(key, submissionId)

      try {
        const comment = await service.createComment(postId, {
          content,
          parentId,
          submissionId,
        })
        pendingSubmissionIds.current.delete(key)
        if (parentId === null) {
          setTopLevel((state) => upsertSiblingComment(state, comment))
        } else {
          setReplies((state) => ({
            ...state,
            [parentId]: upsertSiblingComment(state[parentId] ?? createSiblingPageState(), comment),
          }))
          setTopLevel((state) => ({
            ...state,
            items: state.items.map((item) =>
              item.id === parentId ? { ...item, replyCount: item.replyCount + 1 } : item,
            ),
          }))
          setReplies((state) => {
            const next = { ...state }
            Object.entries(next).forEach(([pageParentID, page]) => {
              next[Number(pageParentID)] = {
                ...page,
                items: page.items.map((item) =>
                  item.id === parentId ? { ...item, replyCount: item.replyCount + 1 } : item,
                ),
              }
            })
            return next
          })
        }
        setDiscussion((state) =>
          state ? { ...state, commentCount: state.commentCount + 1 } : state,
        )
        return comment
      } catch (error) {
        const message = errorMessage(error, 'Failed to create comment.')
        setMutationError(message)
        throw error
      }
    },
    [postId, service],
  )

  const updateComment = useCallback(
    async (commentId: number, content: string) => {
      if (!postId) return
      setMutationError(null)
      setMutatingCommentId(commentId)
      try {
        updateCommentEverywhere(await service.updateComment(postId, commentId, content))
      } catch (error) {
        setMutationError(errorMessage(error, 'Failed to update comment.'))
        throw error
      } finally {
        setMutatingCommentId(null)
      }
    },
    [postId, service, updateCommentEverywhere],
  )

  const removeComment = useCallback(
    async (commentId: number) => {
      if (!postId) return
      setMutationError(null)
      setMutatingCommentId(commentId)
      const removedParentId =
        topLevel.items.find((item) => item.id === commentId)?.parentId ??
        Object.values(replies)
          .flatMap((page) => page.items)
          .find((item) => item.id === commentId)?.parentId ??
        null
      try {
        const result: RemoveCommentResult = await service.removeComment(postId, commentId)
        setTopLevel((state) => applyCommentRemoval(state, result))
        setReplies((state) => {
          const next = { ...state }
          Object.entries(next).forEach(([parentID, page]) => {
            next[Number(parentID)] = applyCommentRemoval(page, result)
          })

          if (!result.retainTombstone && removedParentId !== null) {
            Object.entries(next).forEach(([parentID, page]) => {
              next[Number(parentID)] = {
                ...page,
                items: page.items.map((item) =>
                  item.id === removedParentId
                    ? { ...item, replyCount: Math.max(0, item.replyCount - 1) }
                    : item,
                ),
              }
            })
          }
          return next
        })
        if (!result.retainTombstone && removedParentId !== null) {
          setTopLevel((state) => ({
            ...state,
            items: state.items.map((item) =>
              item.id === removedParentId
                ? { ...item, replyCount: Math.max(0, item.replyCount - 1) }
                : item,
            ),
          }))
        }
        setDiscussion((state) =>
          state ? { ...state, commentCount: Math.max(0, state.commentCount - 1) } : state,
        )
      } catch (error) {
        setMutationError(errorMessage(error, 'Failed to remove comment.'))
        throw error
      } finally {
        setMutatingCommentId(null)
      }
    },
    [postId, replies, service, topLevel.items],
  )

  const updateSettings = useCallback(
    async (commentsOpen: boolean) => {
      if (!postId) return
      setMutationError(null)
      setSettingsLoading(true)
      try {
        const settings = await service.updateSettings(postId, commentsOpen)
        setDiscussion((state) =>
          state
            ? {
                ...state,
                commentsOpen: settings.commentsOpen,
                canCreate: settings.commentsOpen,
              }
            : state,
        )
      } catch (error) {
        setMutationError(errorMessage(error, 'Failed to update comment settings.'))
        throw error
      } finally {
        setSettingsLoading(false)
      }
    },
    [postId, service],
  )

  return {
    topLevel,
    replies,
    discussion,
    mutationError,
    mutatingCommentId,
    settingsLoading,
    reload: () => loadPage(null, false),
    loadMore: () => loadPage(null, true),
    loadReplies: (parentId: number) => loadPage(parentId, false),
    loadMoreReplies: (parentId: number) => loadPage(parentId, true),
    createComment,
    updateComment,
    removeComment,
    updateSettings,
  }
}
