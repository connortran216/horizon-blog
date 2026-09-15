import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
/**
 * Rewritten for release M4. The two states these tests guard are unchanged -
 * a deployment with no discussion is not a failure, and a real failure never
 * shows transport text - but the panels are now the system's feedback surfaces,
 * so the wording is `FeedbackSurface`'s and the retry is `RetryAction`'s.
 */

import theme from '../../../theme/horizon'
import CommentSection from './CommentSection'

const state = vi.hoisted(() => ({
  discussion: {
    available: false,
    commentsOpen: false,
    commentCount: 0,
    canCreate: false,
    canManageComments: false,
  },
  topLevel: {
    items: [],
    nextCursor: null,
    hasMore: false,
    loading: false,
    error: null as string | null,
  },
}))

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
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

const renderSection = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ChakraProvider theme={theme}>
        <CommentSection postId={76} />
      </ChakraProvider>
    </MemoryRouter>,
  )

describe('CommentSection fallback states', () => {
  beforeEach(() => {
    state.discussion.available = false
    state.topLevel.items = []
    state.topLevel.nextCursor = null
    state.topLevel.hasMore = false
    state.topLevel.loading = false
    state.topLevel.error = null
  })

  it('renders a missing discussion as a neutral article state', () => {
    const markup = renderSection()

    expect(markup).toContain('This article does not have a discussion yet')
    expect(markup).not.toContain('HTTP 404')
    expect(markup).not.toContain('Try to load the discussion again')
  })

  it('keeps retry for a genuine transient failure without exposing transport text', () => {
    state.discussion.available = true
    state.topLevel.error = 'HTTP 503'

    const markup = renderSection()

    expect(markup).toContain('We could not load the discussion.')
    expect(markup).toContain('Try to load the discussion again')
    expect(markup).not.toContain('HTTP 503')
  })
})
