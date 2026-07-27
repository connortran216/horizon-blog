import { describe, expect, it } from 'vitest'
import {
  applyCommentRemoval,
  createSiblingPageState,
  failSiblingPageLoad,
  mergeSiblingPage,
  startSiblingPageLoad,
  upsertSiblingComment,
} from './comments.reducer'
import { Comment } from './comments.types'

const makeComment = (id: number, content = `Comment ${id}`): Comment => ({
  id,
  parentId: null,
  depth: 0,
  content,
  author: { name: 'Reader' },
  createdAt: `2026-07-27T10:00:0${id}Z`,
  editedAt: null,
  isRemoved: false,
  replyCount: 0,
  canEdit: true,
  canRemove: true,
  canReply: true,
})

describe('comments sibling-page reducer helpers', () => {
  it('tracks isolated loading and error states', () => {
    const initial = createSiblingPageState()
    const loading = startSiblingPageLoad(initial)
    const failed = failSiblingPageLoad(loading, 'Could not load comments.')

    expect(loading).toEqual({ ...initial, loading: true })
    expect(failed).toEqual({
      ...initial,
      loading: false,
      error: 'Could not load comments.',
    })
    expect(initial.loading).toBe(false)
  })

  it('appends cursor pages in order and replaces duplicate IDs', () => {
    const first = mergeSiblingPage(createSiblingPageState(), [makeComment(1), makeComment(2)], {
      limit: 2,
      nextCursor: 'page-2',
      hasMore: true,
    })
    const second = mergeSiblingPage(first, [makeComment(2, 'Updated by replay'), makeComment(3)], {
      limit: 2,
      nextCursor: null,
      hasMore: false,
    })

    expect(second.items.map((comment) => comment.id)).toEqual([1, 2, 3])
    expect(second.items[1].content).toBe('Updated by replay')
    expect(second).toMatchObject({
      nextCursor: null,
      hasMore: false,
      loading: false,
      error: null,
    })
    expect(first.items[1].content).toBe('Comment 2')
  })

  it('inserts confirmed comments once and replaces successful edits', () => {
    const initial = {
      ...createSiblingPageState(),
      items: [makeComment(1)],
    }
    const inserted = upsertSiblingComment(initial, makeComment(2))
    const replayed = upsertSiblingComment(inserted, makeComment(2))
    const edited = upsertSiblingComment(replayed, {
      ...makeComment(1, 'Corrected'),
      editedAt: '2026-07-27T10:30:00Z',
    })

    expect(inserted.items.map((comment) => comment.id)).toEqual([1, 2])
    expect(replayed.items.map((comment) => comment.id)).toEqual([1, 2])
    expect(edited.items[0]).toMatchObject({
      content: 'Corrected',
      editedAt: '2026-07-27T10:30:00Z',
    })
    expect(initial.items[0].content).toBe('Comment 1')
  })

  it('removes a leaf or converts a retained item to a safe tombstone', () => {
    const initial = {
      ...createSiblingPageState(),
      items: [{ ...makeComment(1), replyCount: 2 }, makeComment(2)],
    }
    const tombstoned = applyCommentRemoval(initial, {
      id: 1,
      isRemoved: true,
      retainTombstone: true,
    })
    const removed = applyCommentRemoval(tombstoned, {
      id: 2,
      isRemoved: true,
      retainTombstone: false,
    })

    expect(tombstoned.items[0]).toMatchObject({
      id: 1,
      content: null,
      author: null,
      isRemoved: true,
      canEdit: false,
      canRemove: false,
      canReply: false,
      replyCount: 2,
    })
    expect(removed.items.map((comment) => comment.id)).toEqual([1])
    expect(initial.items[0].content).toBe('Comment 1')
  })
})
