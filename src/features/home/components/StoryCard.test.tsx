import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { BlogPostSummary, toPublicPostPath } from '../../../core'
import theme from '../../../theme/horizon'
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
  series: {
    id: 9,
    slug: 'database-engineering',
    title: 'Database Engineering',
    position: 2,
    total: 4,
  },
}

const render = (element: JSX.Element) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ChakraProvider theme={theme}>{element}</ChakraProvider>
    </MemoryRouter>,
  )

describe('StoryCard', () => {
  /*
   * The markup assertions this test used to make - `data-layout`, `<footer>`,
   * their order, and `min-height:260px` - described the hand-built card that
   * the v2 `PostCard` replaced. They are gone because the markup they named is
   * gone. What they were protecting is not: the complete cover (spec 008), the
   * card's content, and the public post link are all still asserted below.
   */
  it('keeps the complete cover visible rather than cropping it', () => {
    const markup = render(<StoryCard post={summary} />)

    expect(markup).toContain('src="https://cdn.example.com/complete-cover.png"')
    /*
     * The fit is now asked for by name - `coverFit="contain"` on `PostCard` -
     * so the image itself carries the declaration, and there is no descendant
     * `img` rule written from this component over the design system's cover
     * default. The old assertion matched that override; it would pass again the
     * day someone reintroduced one, so it is gone with it.
     */
    expect(markup).toMatch(/object-fit:contain/)
    expect(markup).not.toMatch(/ img\{/)
  })

  it('renders the post content and links the whole card to the public post', () => {
    const markup = render(<StoryCard post={summary} />)

    expect(markup).toContain('Keep the complete cover visible')
    expect(markup).toContain('A recent blog with meaningful artwork near every edge.')
    expect(markup).toContain('Connor Tran')
    expect(markup).toContain('10 min read')
    expect(markup).toContain('Database Engineering')
    expect(markup).toContain('Part 2 of 4')
    expect(markup).toContain(`href="${toPublicPostPath(87)}"`)
  })

  it('drops a label that would only repeat the section heading above it', () => {
    const markup = render(<StoryCard post={summary} sectionLabels={['recent', 'blogs']} />)

    // The card used to carry a "Lead blog" / "Recent blog" badge under a
    // section already headed "Recent blogs".
    expect(markup).not.toContain('Lead blog')
    expect(markup).not.toContain('Recent blog')
  })
})
