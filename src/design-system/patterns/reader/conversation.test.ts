import { describe, expect, it } from 'vitest'

import { space } from '../../../theme/tokens'
import {
  MAX_COMMENT_DEPTH,
  REMOVED_AUTHOR_NAME,
  buildCommentTree,
  canReplyTo,
  clampDepth,
  commentAuthorName,
  commentBody,
  commentCountLabel,
  commentTimestamp,
  composerAvailability,
  conversationStatus,
  countCommentNodes,
  replyToggleLabel,
  threadIndent,
  type ReaderComment,
} from './conversation.logic'

function comment(id: string, overrides: Partial<ReaderComment> = {}): ReaderComment {
  return {
    id,
    parentId: null,
    depth: 0,
    content: `Sample comment ${id}`,
    author: { name: 'Sample Reader' },
    createdAt: '2026-09-03T10:15:00.000Z',
    editedAt: null,
    isRemoved: false,
    replyCount: 0,
    canReply: true,
    canEdit: false,
    canRemove: false,
    ...overrides,
  }
}

describe('depth', () => {
  it('never exceeds what the API can store', () => {
    expect(clampDepth(0)).toBe(0)
    expect(clampDepth(2)).toBe(2)
    expect(clampDepth(9)).toBe(MAX_COMMENT_DEPTH)
  })

  it('survives a nonsense depth from the wire', () => {
    expect(clampDepth(-4)).toBe(0)
    expect(clampDepth(Number.NaN)).toBe(0)
    expect(clampDepth(1.7)).toBe(1)
  })

  it('offers no reply control at the deepest level the API models', () => {
    expect(canReplyTo(comment('a', { depth: 1 }))).toBe(true)
    expect(canReplyTo(comment('a', { depth: MAX_COMMENT_DEPTH }))).toBe(false)
  })

  it('offers no reply control where the API refuses one', () => {
    expect(canReplyTo(comment('a', { canReply: false }))).toBe(false)
  })

  it('stops indenting at the depth limit, so the deepest reply is still readable', () => {
    expect(threadIndent(0)).toBe('0')
    expect(threadIndent(1)).toBe(space[4])
    expect(threadIndent(2)).toBe(space[6])
    expect(threadIndent(9)).toBe(threadIndent(2))
  })
})

describe('buildCommentTree', () => {
  it('nests a reply under its parent', () => {
    const tree = buildCommentTree([
      comment('a', { replyCount: 1 }),
      comment('b', { parentId: 'a', depth: 1 }),
    ])

    expect(tree).toHaveLength(1)
    expect(tree[0].replies.map((node) => node.comment.id)).toEqual(['b'])
    expect(tree[0].replies[0].depth).toBe(1)
  })

  it('nests three levels and stops there', () => {
    const tree = buildCommentTree([
      comment('a'),
      comment('b', { parentId: 'a', depth: 1 }),
      comment('c', { parentId: 'b', depth: 2 }),
    ])

    expect(tree[0].replies[0].replies[0].depth).toBe(MAX_COMMENT_DEPTH)
  })

  it('keeps a reply whose parent fell outside this page, at the root', () => {
    const tree = buildCommentTree([comment('b', { parentId: 'not-here', depth: 1 })])

    expect(tree.map((node) => node.comment.id)).toEqual(['b'])
  })

  it('does not recurse forever on a cycle', () => {
    const tree = buildCommentTree([
      comment('a', { parentId: 'b' }),
      comment('b', { parentId: 'a' }),
    ])

    expect(countCommentNodes(tree)).toBeLessThanOrEqual(2)
  })

  it('ignores a comment that claims itself as its parent', () => {
    const tree = buildCommentTree([comment('a', { parentId: 'a' })])

    expect(tree).toHaveLength(1)
    expect(tree[0].replies).toEqual([])
  })

  it('drops a duplicate id from an overlapping cursor page', () => {
    const tree = buildCommentTree([comment('a'), comment('a')])

    expect(tree).toHaveLength(1)
  })

  it('keeps the order the API gave, rather than re-sorting behind the cursor', () => {
    const tree = buildCommentTree([comment('c'), comment('a'), comment('b')])

    expect(tree.map((node) => node.comment.id)).toEqual(['c', 'a', 'b'])
  })

  it('keeps a removed comment in place so its replies keep their context', () => {
    const tree = buildCommentTree([
      comment('a', { isRemoved: true, content: null, replyCount: 1 }),
      comment('b', { parentId: 'a', depth: 1 }),
    ])

    expect(tree[0].comment.id).toBe('a')
    expect(tree[0].replies).toHaveLength(1)
  })

  it('is empty for an empty page', () => {
    expect(buildCommentTree([])).toEqual([])
    expect(countCommentNodes([])).toBe(0)
  })

  it('counts every node, replies included', () => {
    const tree = buildCommentTree([
      comment('a'),
      comment('b', { parentId: 'a', depth: 1 }),
      comment('c', { parentId: 'b', depth: 2 }),
      comment('d'),
    ])

    expect(countCommentNodes(tree)).toBe(4)
  })
})

describe('comment copy', () => {
  it('names an account that is gone without inventing a person', () => {
    expect(commentAuthorName(null)).toBe(REMOVED_AUTHOR_NAME)
    expect(commentAuthorName({ name: '   ' })).toBe(REMOVED_AUTHOR_NAME)
    expect(commentAuthorName({ name: 'Sample Reader' })).toBe('Sample Reader')
  })

  it('shows a tombstone rather than an empty paragraph', () => {
    expect(commentBody(comment('a', { isRemoved: true, content: null }))).toEqual({
      kind: 'removed',
      text: 'This comment was removed.',
    })
  })

  it('treats missing content as removed, whatever the flag says', () => {
    expect(commentBody(comment('a', { content: null })).kind).toBe('removed')
  })

  it('shows real content as text', () => {
    expect(commentBody(comment('a', { content: 'Hello' }))).toEqual({
      kind: 'text',
      text: 'Hello',
    })
  })

  it('marks an edited comment as edited', () => {
    const stamp = commentTimestamp(comment('a', { editedAt: '2026-09-03T11:02:00.000Z' }))

    expect(stamp.edited).toBe(true)
    expect(stamp.label).toBe('Sep 3, 2026 · edited')
    expect(stamp.machine).toBe('2026-09-03')
  })

  it('survives an unparseable timestamp', () => {
    const stamp = commentTimestamp(comment('a', { createdAt: 'not a date' }))

    expect(stamp.machine).toBeNull()
    expect(stamp.label).toBe('')
  })

  it('never says "1 replies"', () => {
    expect(replyToggleLabel(1, false)).toBe('View 1 reply')
    expect(replyToggleLabel(3, false)).toBe('View 3 replies')
    expect(replyToggleLabel(3, true)).toBe('Hide replies')
  })

  it('pluralises the comment count', () => {
    expect(commentCountLabel(1)).toBe('1 comment')
    expect(commentCountLabel(0)).toBe('0 comments')
    expect(commentCountLabel(-4)).toBe('0 comments')
  })
})

describe('conversationStatus', () => {
  it('does not pretend to load a feature that is not deployed', () => {
    expect(conversationStatus({ available: false, isLoading: true })).toBe('unavailable')
  })

  it('replaces a failure with the retry that is in flight', () => {
    expect(conversationStatus({ isLoading: true, error: 'boom' })).toBe('loading')
    expect(conversationStatus({ error: 'boom' })).toBe('error')
  })

  it('says a closed discussion is closed rather than inviting a comment', () => {
    expect(conversationStatus({ commentsOpen: false, commentCount: 0 })).toBe('closed')
    expect(conversationStatus({ commentsOpen: false, commentCount: 4 })).toBe('closed')
  })

  it('separates an empty discussion from a loaded one', () => {
    expect(conversationStatus({ commentCount: 0 })).toBe('empty')
    expect(conversationStatus({ commentCount: 4 })).toBe('ready')
  })
})

describe('composerAvailability', () => {
  it('lets a permitted, signed-in reader write', () => {
    expect(composerAvailability({ canCreate: true, isAuthenticated: true })).toEqual({
      allowed: true,
      notice: null,
    })
  })

  it('tells a signed-out reader how to join', () => {
    const availability = composerAvailability({ canCreate: true, isAuthenticated: false })

    expect(availability.allowed).toBe(false)
    expect(availability.notice).toContain('Sign in')
  })

  it('says a closed discussion is closed before it says anything about signing in', () => {
    const availability = composerAvailability({ commentsOpen: false, isAuthenticated: false })

    expect(availability.notice).toBe('This discussion is closed.')
  })

  it('names a permission problem as one', () => {
    const availability = composerAvailability({ canCreate: false, isAuthenticated: true })

    expect(availability.notice).toContain('permission')
  })
})
