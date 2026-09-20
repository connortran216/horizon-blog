/**
 * The four states a reader can arrive in front of, and who is offered a
 * composer.
 *
 * `conversationStatus` and `composerAvailability` decide both, and the pure
 * tests for those live in the design system. What this file proves is the
 * wiring - that the discussion record this feature holds reaches those
 * functions correctly, and that what comes back is actually emitted.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import theme from '../../../theme/horizon'
import CommentSection from './CommentSection'

const state = vi.hoisted(() => ({
  user: null as { id: number; username: string } | null,
  discussion: {
    available: true,
    commentsOpen: true,
    commentCount: 0,
    canCreate: true,
    canManageComments: false,
  },
  topLevel: {
    items: [] as unknown[],
    nextCursor: null,
    hasMore: false,
    loading: false,
    error: null as string | null,
  },
}))

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: state.user }),
}))

vi.mock('../useBlogComments', () => ({
  useBlogComments: () => ({
    discussion: state.discussion,
    topLevel: state.topLevel,
    replies: {},
    mutationError: null,
    mutatingCommentId: null,
    settingsLoading: false,
    reload: vi.fn(),
    loadMore: vi.fn(),
    loadReplies: vi.fn(),
    loadMoreReplies: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    removeComment: vi.fn(),
    updateSettings: vi.fn(),
  }),
}))

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ChakraProvider theme={theme}>
        <CommentSection postId={76} />
      </ChakraProvider>
    </MemoryRouter>,
  )

describe('CommentSection reader states', () => {
  beforeEach(() => {
    state.user = null
    state.discussion = {
      available: true,
      commentsOpen: true,
      commentCount: 0,
      canCreate: true,
      canManageComments: false,
    }
    state.topLevel = {
      items: [],
      nextCursor: null,
      hasMore: false,
      loading: false,
      error: null,
    }
  })

  it('offers a signed-out reader a way in rather than a dead textarea', () => {
    const markup = render()

    expect(markup).toContain('Sign in')
    expect(markup).toContain('to join the discussion.')
    expect(markup).not.toContain('<textarea')
  })

  it('gives a signed-in reader with permission the composer and its limit', () => {
    state.user = { id: 1, username: 'author' }

    const markup = render()

    expect(markup).toContain('Join the discussion')
    expect(markup).toContain('maxLength="2000"')
    expect(markup).toContain('0/2000')
  })

  it('explains a permission refusal instead of hiding the reason', () => {
    state.user = { id: 1, username: 'author' }
    state.discussion.canCreate = false

    const markup = render()

    expect(markup).toContain('You do not have permission to comment on this blog.')
    expect(markup).not.toContain('<textarea')
  })

  it('says a closed discussion is closed rather than inviting a comment', () => {
    state.user = { id: 1, username: 'author' }
    state.discussion.commentsOpen = false

    const markup = render()

    expect(markup).toContain('This discussion is closed')
    expect(markup).toContain('You can still read what has already been said.')
    expect(markup).not.toContain('No comments on this blog yet.')
    expect(markup).not.toContain('<textarea')
  })

  it('invites the first comment when the discussion is open and empty', () => {
    state.user = { id: 1, username: 'author' }

    const markup = render()

    expect(markup).toContain('No comments on this blog yet.')
    expect(markup).toContain('Be the first to share a thought or question.')
  })

  it('shows a spinner only while a first page is genuinely in flight', () => {
    state.topLevel.loading = true

    const markup = render()

    expect(markup).toContain('Loading the discussion')
    expect(markup).not.toContain('No comments on this blog yet.')
  })

  it('gives the blog owner the control that closes the discussion', () => {
    state.user = { id: 1, username: 'author' }
    state.discussion.canManageComments = true

    const markup = render()

    expect(markup).toContain('Close comments')
  })

  it('offers the reopen control once the owner has closed it', () => {
    state.user = { id: 1, username: 'author' }
    state.discussion.canManageComments = true
    state.discussion.commentsOpen = false

    const markup = render()

    expect(markup).toContain('Open comments')
    expect(markup).not.toContain('Close comments')
  })

  it('keeps moderation out of a reader’s reach', () => {
    state.user = { id: 2, username: 'reader' }

    const markup = render()

    expect(markup).not.toContain('Close comments')
    expect(markup).not.toContain('Open comments')
  })

  it('pluralises the comment count rather than printing "1 comments"', () => {
    state.discussion.commentCount = 1

    expect(render()).toContain('1 comment<')
  })
})
