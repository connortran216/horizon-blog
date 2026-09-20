// @vitest-environment jsdom

/**
 * T018 of spec 010: a comments *render* crash must not take the article down.
 *
 * `BlogDetailPage.performance.test.tsx` proves the article survives every
 * transport failure, but it renders with `renderToStaticMarkup`, and React's
 * server renderer never invokes an error boundary - a throw propagates and
 * fails the test instead of exercising the fallback. Only a client render can
 * show the boundary doing its job, so this one file runs under jsdom and
 * mounts the page with `react-dom/client`.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import theme from '../../../theme/horizon'
import { AuthProvider } from '../../../context/AuthContext'
import BlogDetailPage from './BlogDetailPage'

vi.mock('../useBlogPostDetail', () => ({
  useBlogPostDetail: () => ({
    post: {
      id: 76,
      title: 'Article survives the discussion',
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

vi.mock('../../../core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../core')>()
  return {
    ...actual,
    getBlogService: () => ({
      getRelatedPosts: vi.fn().mockResolvedValue([]),
    }),
  }
})

// The crash under test: a comment that throws while rendering, not a request
// that fails. `useBlogComments` already contains the latter.
vi.mock('../../comments/components/CommentSection', () => ({
  default: () => {
    throw new Error('a comment exploded while rendering')
  },
}))

const swallowRethrow = (event: ErrorEvent) => event.preventDefault()

describe('BlogDetailPage discussion isolation', () => {
  let container: HTMLDivElement
  let root: Root
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // React reports the caught error on console.error; that is the boundary
    // working, not the test failing, so it is kept out of the run's output.
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    // React's development build re-throws a caught render error inside a
    // synthetic event so DevTools can pause on it; jsdom would otherwise
    // report that as an uncaught error on the virtual console.
    window.addEventListener('error', swallowRethrow)
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    window.removeEventListener('error', swallowRethrow)
    act(() => root.unmount())
    container.remove()
    consoleError.mockRestore()
  })

  it('keeps the article on screen when rendering a comment throws', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ChakraProvider theme={theme}>
            <AuthProvider>
              <BlogDetailPage />
            </AuthProvider>
          </ChakraProvider>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Article survives the discussion')
    // The boundary's fallback is deliberately silent: no error copy leaks.
    expect(container.textContent).not.toContain('exploded')
    expect(container.textContent).not.toContain('Something went wrong')
    // React did catch it - the boundary, not a swallowed render.
    expect(consoleError).toHaveBeenCalled()
  })
})
