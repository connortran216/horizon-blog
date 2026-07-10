import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { BlogPostSummary } from '../../../core'
import theme from '../../../theme'
import EditorialCard from './EditorialCard'
import FeaturedStory from './FeaturedStory'
import RelatedPosts from './RelatedPosts'

const summary: BlogPostSummary = {
  id: '42',
  title: 'Summary-only card',
  excerpt: 'This card renders without downloading markdown.',
  author: { id: 7, username: 'Summary Author' },
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-02T00:00:00Z',
  readingTime: 6,
  tags: [],
  featuredImage: undefined,
  status: 'published',
  slug: '42',
}

describe('blog summary cards', () => {
  it('render backend summary fields without full article content', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ChakraProvider theme={theme}>
          <FeaturedStory post={summary} />
          <EditorialCard post={summary} index={1} />
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('Summary-only card')
    expect(markup).toContain('This card renders without downloading markdown.')
    expect(markup).toContain('Summary Author')
    expect(markup).toContain('6 min')
  })

  it('does not emit unresolved media tokens as image sources on initial render', () => {
    const postWithProtectedCover = {
      ...summary,
      featuredImage: 'media://40',
    }

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ChakraProvider theme={theme}>
          <FeaturedStory post={postWithProtectedCover} />
          <EditorialCard post={postWithProtectedCover} index={1} />
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).not.toContain('src="media://40"')
  })

  it('renders related posts without score or reason labels', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ChakraProvider theme={theme}>
          <RelatedPosts posts={[summary]} />
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('More like this')
    expect(markup).toContain('Summary-only card')
    expect(markup).toContain('This card renders without downloading markdown.')
    expect(markup).not.toContain('score')
    expect(markup).not.toContain('Related because')
  })
})
