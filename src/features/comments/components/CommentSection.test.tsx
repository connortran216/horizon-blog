import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import theme from '../../../theme'
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

    expect(markup).toContain('This article doesn’t have a discussion yet.')
    expect(markup).not.toContain('HTTP 404')
    expect(markup).not.toContain('Retry comments')
  })

  it('keeps retry for a genuine transient failure without exposing transport text', () => {
    state.discussion.available = true
    state.topLevel.error = 'HTTP 503'

    const markup = renderSection()

    expect(markup).toContain('Comments couldn’t load right now.')
    expect(markup).toContain('Try comments again')
    expect(markup).not.toContain('HTTP 503')
  })
})
