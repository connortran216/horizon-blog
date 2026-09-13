import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

/**
 * Rewritten for release M4 - same guarantee, new composition. The page still
 * has to render the article when analytics, reactions and Series context are
 * all unavailable; what changed is that the loading fallback, the reaction
 * notice and the table of contents are the design system's, so the strings the
 * assertions look for are its strings.
 */

import theme from '../../../theme/horizon'
import { AuthProvider } from '../../../context/AuthContext'
import BlogDetailPage from './BlogDetailPage'

vi.mock('../useBlogPostDetail', () => ({
  useBlogPostDetail: () => ({
    post: {
      id: 76,
      title: 'Article remains readable',
      content_markdown: `
Independent article body

## Setup
### Tradeoffs
## Result
`,
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
  useResolvedMarkdownMedia: () => ({ content: 'Independent article body', sources: {} }),
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

vi.mock('../../series/useSeriesContext', () => ({
  useSeriesContext: () => null,
}))

describe('BlogDetailPage dependency independence', () => {
  it('renders the article while analytics, reactions, or series context are unavailable', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ChakraProvider theme={theme}>
          <AuthProvider>
            <BlogDetailPage />
          </AuthProvider>
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('Article remains readable')
    expect(markup).toContain('On this page')
    expect(markup).toContain('#setup')
    expect(markup).toContain('Loading the article')
    expect(markup).toContain('Sign in to react to this blog.')
    expect(markup).toContain('Discussion')
    expect(markup).not.toContain('Series navigation')
  })
})
