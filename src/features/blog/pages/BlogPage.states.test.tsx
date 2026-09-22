import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import type { BlogPostSummary } from '../../../core'
import theme from '../../../theme/horizon'

const post = (id: string, title: string): BlogPostSummary => ({
  id,
  title,
  excerpt: `${title} excerpt`,
  author: { id: 7, username: 'Sample Author' },
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  readingTime: 5,
  tags: ['sample'],
  status: 'published',
  slug: id,
})

const archive = {
  searchInput: '',
  setSearchInput: vi.fn(),
  query: '',
  posts: [] as BlogPostSummary[],
  popularTags: [],
  loading: false,
  tagsLoading: false,
  error: null as string | null,
  tagsError: null as string | null,
  page: 1,
  totalPages: 1,
  total: 0,
  activeTags: [] as string[],
  hasActiveFilters: false,
  setPage: vi.fn(),
  toggleTag: vi.fn(),
  clearQuery: vi.fn(),
  removeTag: vi.fn(),
  clearAllFilters: vi.fn(),
  retry: vi.fn(),
  retryTags: vi.fn(),
}

const state = { current: archive }

vi.mock('../useBlogArchive', () => ({
  useBlogArchive: () => state.current,
}))

const BlogPage = (await import('./BlogPage')).default

const render = () =>
  renderToStaticMarkup(
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={['/blog']}>
        <BlogPage />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe('BlogPage async states', () => {
  it('surfaces a failed archive request as a failure, not as an empty archive', () => {
    state.current = { ...archive, error: 'The blog archive could not load right now.' }

    const markup = render()

    expect(markup).toContain('We could not load the blog archive.')
    expect(markup).toContain('The blog archive could not load right now.')
    expect(markup).toContain('Try to load the blog archive again')
    // The empty state tells the reader to broaden their search. A network
    // failure is not a search that matched nothing, and saying so sends them
    // off editing filters that were never the problem.
    expect(markup).not.toContain('Try a broader phrase')
    expect(markup).not.toContain('New writing appears here as it is published.')
  })

  it('names the next valid action when the filters genuinely matched nothing', () => {
    state.current = {
      ...archive,
      query: 'dns',
      searchInput: 'dns',
      activeTags: ['postgresql'],
      hasActiveFilters: true,
    }

    const markup = render()

    expect(markup).toContain('Try a broader phrase, or clear the topic filters.')
    expect(markup).toContain('Clear all filters')
    expect(markup).not.toContain('We could not load the blog archive.')
  })

  it('replaces the topic chips with a retry when only the topic list failed', () => {
    state.current = { ...archive, tagsError: 'The topic list could not load right now.' }

    const markup = render()

    expect(markup).toContain('We could not load the topic list.')
    expect(markup).toContain('Try to load the topic list again')
  })

  it('shows no stale result count while a page is loading', () => {
    state.current = { ...archive, loading: true, total: 13 }

    const markup = render()

    expect(markup).not.toContain('13 blogs')
  })

  it('gives every committed result one stable reflow identity', () => {
    state.current = {
      ...archive,
      posts: [post('41', 'Featured sample'), post('42', 'Grid sample')],
      total: 2,
    }

    const markup = render()

    expect(markup.match(/data-blog-result=/g)).toHaveLength(2)
    expect(markup).toContain('data-blog-result="41"')
    expect(markup).toContain('data-blog-result-kind="featured"')
    expect(markup).toContain('data-blog-result="42"')
    expect(markup).toContain('data-blog-result-kind="card"')
  })
})
