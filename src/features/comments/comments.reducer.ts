import { Comment, CommentPagination, RemoveCommentResult, SiblingPageState } from './comments.types'

export const createSiblingPageState = (): SiblingPageState => ({
  items: [],
  nextCursor: null,
  hasMore: false,
  loading: false,
  error: null,
})

export const startSiblingPageLoad = (state: SiblingPageState): SiblingPageState => ({
  ...state,
  loading: true,
  error: null,
})

export const failSiblingPageLoad = (state: SiblingPageState, error: string): SiblingPageState => ({
  ...state,
  loading: false,
  error,
})

export const mergeSiblingPage = (
  state: SiblingPageState,
  comments: Comment[],
  pagination: CommentPagination,
): SiblingPageState => {
  const items = [...state.items]
  const indexes = new Map(items.map((comment, index) => [comment.id, index]))

  comments.forEach((comment) => {
    const existingIndex = indexes.get(comment.id)
    if (existingIndex === undefined) {
      indexes.set(comment.id, items.length)
      items.push(comment)
      return
    }

    items[existingIndex] = comment
  })

  return {
    items,
    nextCursor: pagination.nextCursor,
    hasMore: pagination.hasMore,
    loading: false,
    error: null,
  }
}

/**
 * The reply page a freshly posted reply lands in.
 *
 * A reply can be written without ever expanding the parent's replies, and the
 * page that reply creates then becomes the only page that parent has. Treating
 * it as a complete page strands every older reply: the "View N replies" control
 * disappears the moment a page exists, and a page built from nothing has no
 * cursor to walk. So when the parent is known to have replies the reader has
 * not loaded, the seeded page starts with `hasMore`, and the first "Load more
 * replies" fetches them and merges them in behind the new one.
 */
export const seedReplyPage = (
  existing: SiblingPageState | undefined,
  parentReplyCount: number,
): SiblingPageState =>
  existing ?? {
    ...createSiblingPageState(),
    hasMore: parentReplyCount > 0,
  }

export const upsertSiblingComment = (
  state: SiblingPageState,
  comment: Comment,
): SiblingPageState => {
  const existingIndex = state.items.findIndex((item) => item.id === comment.id)

  if (existingIndex === -1) {
    return {
      ...state,
      items: [...state.items, comment],
    }
  }

  const items = [...state.items]
  items[existingIndex] = comment
  return {
    ...state,
    items,
  }
}

export const applyCommentRemoval = (
  state: SiblingPageState,
  result: RemoveCommentResult,
): SiblingPageState => {
  const existingIndex = state.items.findIndex((comment) => comment.id === result.id)
  if (existingIndex === -1) return state

  if (!result.retainTombstone) {
    return {
      ...state,
      items: state.items.filter((comment) => comment.id !== result.id),
    }
  }

  const existing = state.items[existingIndex]
  const tombstone: Comment = {
    ...existing,
    content: null,
    author: null,
    isRemoved: result.isRemoved,
    canEdit: false,
    canRemove: false,
    canReply: false,
  }
  const items = [...state.items]
  items[existingIndex] = tombstone

  return {
    ...state,
    items,
  }
}
