import { describe, expect, it } from 'vitest'

import { canReplyTo, commentAuthorName, commentBody, threadIndent } from '../../design-system'
import { toReaderComment } from './comment.presentation'
import { Comment } from './comments.types'

const comment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 11,
  parentId: null,
  depth: 0,
  content: 'A real comment',
  author: { name: 'Nguyễn Văn An' },
  createdAt: '2026-07-27T10:00:00Z',
  editedAt: null,
  isRemoved: false,
  replyCount: 0,
  canEdit: false,
  canRemove: false,
  canReply: true,
  ...overrides,
})

describe('toReaderComment', () => {
  it('carries the numeric identity across as stable string keys', () => {
    const reader = toReaderComment(comment({ id: 11, parentId: 4 }))

    expect(reader.id).toBe('11')
    expect(reader.parentId).toBe('4')
  })

  it('keeps a root comment parentless rather than turning null into "null"', () => {
    expect(toReaderComment(comment()).parentId).toBeNull()
  })

  it('hands the design system enough to refuse a reply the API would refuse', () => {
    expect(canReplyTo(toReaderComment(comment({ depth: 1 })))).toBe(true)
    expect(canReplyTo(toReaderComment(comment({ depth: 2 })))).toBe(false)
    expect(canReplyTo(toReaderComment(comment({ depth: 0, canReply: false })))).toBe(false)
  })

  it('names a deleted account and keeps a removed comment as a tombstone', () => {
    const removed = toReaderComment(comment({ author: null, content: null, isRemoved: true }))

    expect(commentAuthorName(removed.author)).toBe('Deleted reader')
    expect(commentBody(removed)).toEqual({ kind: 'removed', text: 'This comment was removed.' })
  })

  it('stops indenting at the depth the API models, so a deep reply still fits 375px', () => {
    expect(threadIndent(toReaderComment(comment({ depth: 2 })).depth)).toBe(
      threadIndent(toReaderComment(comment({ depth: 2 })).depth),
    )
    expect(threadIndent(0)).toBe('0')
    expect(threadIndent(2)).toBe(threadIndent(5))
  })

  it('preserves a Vietnamese author name unchanged', () => {
    expect(commentAuthorName(toReaderComment(comment()).author)).toBe('Nguyễn Văn An')
  })
})
