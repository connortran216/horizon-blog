import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { BlogPostSummary, toPublicPostPath } from '../../../core'
import theme from '../../../theme/horizon'
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
  series: {
    id: 9,
    slug: 'database-engineering',
    title: 'Database Engineering',
    position: 1,
    total: 3,
  },
}

const relatedSummaries = [
  summary,
  { ...summary, id: '43', title: 'Second related card' },
  { ...summary, id: '44', title: 'Third related card' },
]

describe('blog summary cards', () => {
  it('render backend summary fields without full article content', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ChakraProvider theme={theme}>
          <FeaturedStory post={summary} />
          <EditorialCard post={summary} />
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('Summary-only card')
    expect(markup).toContain('This card renders without downloading markdown.')
    expect(markup).toContain('Summary Author')
    expect(markup).toContain('6 min')
    expect(markup).toContain('Database Engineering')
    expect(markup).toContain('Part 1 of 3')
    expect(markup).toContain(`href="${toPublicPostPath(42)}"`)
    expect(markup).not.toContain('href="/blog/42"')
  })

  it('keeps standalone cards free of redundant Series labels', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ChakraProvider theme={theme}>
          <EditorialCard post={{ ...summary, series: null }} />
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).not.toContain('Database Engineering')
    expect(markup).not.toContain('Part 1 of 3')
    expect(markup).not.toContain('Standalone')
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
          <EditorialCard post={postWithProtectedCover} />
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).not.toContain('src="media://40"')
  })

  /*
   * This used to assert the cover's own `240px` box and its own `radii.xl`
   * corners. The v2 card draws the cover differently and deliberately: the
   * picture bleeds to the card's edge, so the frame declines its corners and
   * renders square, and the card surface is the single owner of the radius and
   * the clip. What the old assertion protected - a cover whose corners follow
   * the card's rounded language rather than cutting across it - is what is
   * asserted here, from the other side.
   */
  it('gives the card one rounded, clipped frame that the cover bleeds into', () => {
    const postWithCover = {
      ...summary,
      featuredImage: 'https://cdn.example.com/rounded-cover.png',
    }

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ChakraProvider theme={theme}>
          <EditorialCard post={postWithCover} />
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('src="https://cdn.example.com/rounded-cover.png"')
    // The cover reserves 16/9 in every media state and owns no corners.
    expect(markup).toContain('aspect-ratio:16/9;border-radius:0px;overflow:hidden')

    // The card also carries `data-signal-host` for its cover seam; order is not the point.
    const cardClass = /<article[^>]*\sclass="(css-[a-z0-9]+)"/.exec(markup)?.[1]
    expect(cardClass).toBeDefined()

    const cardRule = new RegExp(`\\.${cardClass}\\{[^}]*\\}`).exec(markup)?.[0] ?? ''
    expect(cardRule).toContain('overflow:hidden')
    expect(cardRule).toMatch(/border-radius:(?!0px)/)
  })

  it('renders related posts without score or reason labels', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ChakraProvider theme={theme}>
          <RelatedPosts posts={relatedSummaries} />
        </ChakraProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('More like this')
    expect(markup).toContain('Summary-only card')
    expect(markup).toContain('Second related card')
    expect(markup).toContain('Third related card')
    expect(markup).toContain('This card renders without downloading markdown.')
    expect(markup).toContain(`href="${toPublicPostPath(42)}"`)
    expect(markup).toContain(`href="${toPublicPostPath(43)}"`)
    expect(markup).toContain(`href="${toPublicPostPath(44)}"`)
    expect(markup).not.toContain('score')
    expect(markup).not.toContain('Related because')
  })
})
