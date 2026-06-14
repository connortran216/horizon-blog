import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import theme from '../../../theme'
import BlogDetailPage from './BlogDetailPage'

vi.mock('../useBlogPostDetail', () => ({
  useBlogPostDetail: () => ({
    post: {
      id: 76,
      title: 'Article remains readable',
      content_markdown: 'Independent article body',
      content_json: '',
      status: 'published',
      user_id: 1,
      created_at: '2026-06-06T00:00:00Z',
      updated_at: '2026-06-06T00:00:00Z',
      owner: { id: 1, name: 'Horizon Author' },
    },
    loading: false,
    emptyStateMessage: 'No post',
  }),
}))

vi.mock('../../media/useResolvedMarkdown', () => ({
  useResolvedMarkdown: () => 'Independent article body',
}))

vi.mock('../../reader-interactions/useReaderSession', () => ({
  useReaderSession: () => ({
    sessionId: null,
    handleReadingProgressChange: vi.fn(),
    handleContentClick: vi.fn(),
  }),
}))

vi.mock('../../reader-interactions/useReaderInteractions', () => ({
  useReaderInteractions: () => ({
    state: null,
    isHeartLoading: false,
    isShareLoading: false,
    toggleHeart: vi.fn(),
    share: vi.fn(),
  }),
}))

describe('BlogDetailPage dependency independence', () => {
  it('renders the article while analytics is delayed and reactions are unavailable', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ChakraProvider theme={theme}>
          <BlogDetailPage />
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('Article remains readable')
    expect(markup).toContain('Loading content...')
    expect(markup).toContain('Reactions unavailable')
  })
})
