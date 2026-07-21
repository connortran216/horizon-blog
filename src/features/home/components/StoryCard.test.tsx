import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { BlogPostSummary } from '../../../core'
import theme from '../../../theme'
import StoryCard from './StoryCard'

const summary: BlogPostSummary = {
  id: '87',
  title: 'Keep the complete cover visible',
  excerpt: 'A recent blog with meaningful artwork near every edge.',
  author: { id: 1, username: 'Connor Tran' },
  createdAt: '2026-07-20T00:00:00Z',
  updatedAt: '2026-07-20T00:00:00Z',
  readingTime: 10,
  tags: [],
  featuredImage: 'https://cdn.example.com/complete-cover.png',
  status: 'published',
  slug: 'keep-the-complete-cover-visible',
}

describe('StoryCard', () => {
  it('contains the complete resolved cover while preserving the card content', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ChakraProvider theme={theme}>
          <StoryCard post={summary} index={1} formatDate={() => 'Jul 20, 2026'} />
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('src="https://cdn.example.com/complete-cover.png"')
    expect(markup).toContain('object-fit:contain')
    expect(markup).not.toContain('object-fit:cover')
    expect(markup).not.toContain('min-height:260px')
    expect(markup).toContain('data-layout="inset-information-panel"')
    expect(markup).toContain('<footer')
    expect(markup.indexOf('data-layout="inset-information-panel"')).toBeGreaterThan(
      markup.indexOf('src="https://cdn.example.com/complete-cover.png"'),
    )
    expect(markup.indexOf('<footer')).toBeGreaterThan(
      markup.indexOf('data-layout="inset-information-panel"'),
    )
    expect(markup).toContain('Keep the complete cover visible')
    expect(markup).toContain('Connor Tran')
    expect(markup).toContain('10 min read')
    expect(markup).toContain('href="/blog/87"')
  })
})
