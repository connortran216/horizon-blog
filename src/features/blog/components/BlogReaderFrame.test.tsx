/**
 * The reading frame's document order.
 *
 * Rewritten for release M4. The assertions that described the old three-column
 * `Grid` and its `tableOfContentsRail` / `tableOfContentsInline` props are gone
 * with those props: the frame now hands its headings to `ReaderFrame`, which
 * renders the rail and the narrow-screen disclosure itself. What the tests
 * still prove is the thing that matters and that a pure function cannot answer
 * on its own - that reader feedback is emitted after the article and never
 * beside the byline, and that the table of contents precedes the prose.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import theme from '../../../theme/horizon'
import BlogReaderFrame from './BlogReaderFrame'
import { BlogArchivePost } from '../blog.types'

const post: BlogArchivePost = {
  id: 76,
  title: 'Reader interaction placement',
  content_markdown: 'Body content',
  content_json: '',
  status: 'published',
  user_id: 1,
  created_at: '2026-06-06T00:00:00Z',
  updated_at: '2026-06-06T00:00:00Z',
  owner: {
    id: 1,
    name: 'Horizon Author',
  },
  tags: [
    { id: 5, name: 'database' },
    { id: 39, name: 'backend' },
  ],
}

const headings = [
  { id: 'setup', text: 'Setup', depth: 2 },
  { id: 'tradeoffs', text: 'Tradeoffs', depth: 3 },
  { id: 'result', text: 'Result', depth: 2 },
]

const render = (element: JSX.Element) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ChakraProvider theme={theme}>{element}</ChakraProvider>
    </MemoryRouter>,
  )

describe('BlogReaderFrame', () => {
  it('places reader interactions after the article content', () => {
    const markup = render(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
        interactionSection={<button type="button">Heart action</button>}
      />,
    )

    const contentPosition = markup.indexOf('Loading the article')
    const interactionPosition = markup.indexOf('Heart action')

    expect(contentPosition).toBeGreaterThan(-1)
    expect(interactionPosition).toBeGreaterThan(contentPosition)
  })

  it('orders Series context, feedback, discussion and related after the prose', () => {
    const markup = render(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
        seriesSection={<aside>Series context</aside>}
        interactionSection={<button type="button">Heart action</button>}
        discussionSection={<section>Discussion goes here</section>}
        relatedSection={<aside>More like this</aside>}
      />,
    )

    const positions = [
      'Loading the article',
      'Series context',
      'Heart action',
      'Discussion goes here',
      'More like this',
    ].map((needle) => markup.indexOf(needle))

    expect(positions.every((position) => position > -1)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('renders the table of contents twice - rail and disclosure - before the prose', () => {
    const markup = render(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
        headings={headings}
        relatedSection={<aside>More like this</aside>}
      />,
    )

    const contentPosition = markup.indexOf('Loading the article')

    expect(markup).toContain('href="#setup"')
    expect(markup).toContain('On this page (3)')
    expect(markup.indexOf('href="#setup"')).toBeLessThan(contentPosition)
    expect(markup.lastIndexOf('href="#setup"')).toBeLessThan(contentPosition)
    expect(markup.indexOf('More like this')).toBeGreaterThan(contentPosition)
  })

  it('renders no table of contents when the article has no headings', () => {
    const markup = render(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
      />,
    )

    expect(markup).not.toContain('On this page')
  })

  it('shows public blog tags in the reader header', () => {
    const markup = render(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
      />,
    )

    expect(markup).toContain('aria-label="Blog tags"')
    expect(markup).toContain('#database')
    expect(markup).toContain('#backend')
  })

  /**
   * The single most likely thing to break on a real article at 375px. `Prose`
   * contains a bare `pre` or `table`, but `crepe-theme.css` styles
   * `.crepe-editor-wrapper table` at the same specificity and arrives with a
   * lazily imported chunk, so the frame restates the rule one level deeper.
   * This asserts the deeper rule is actually emitted, because losing it is
   * silent - the document simply starts scrolling sideways.
   */
  it('keeps wide code and tables inside the article at every width', () => {
    const markup = render(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
      />,
    )

    const selector = markup.indexOf('.crepe-editor-wrapper pre')
    expect(selector).toBeGreaterThan(-1)

    const rule = markup.slice(selector, markup.indexOf('}', selector) + 1)

    expect(rule).toContain('.crepe-editor-wrapper table')
    expect(rule).toContain('.milkdown pre')
    expect(rule).toContain('.milkdown table')
    expect(rule).toContain('overflow-x:auto')
    expect(rule).toContain('max-width:100%')
    expect(rule).toContain('min-width:0')
    expect(rule).toContain('display:block')
  })

  it('names the author once and links the archive once', () => {
    const markup = render(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="Back to Blog"
        authorArchivePath="/authors/horizon-author"
        authorArchiveState={{ authorId: 1 }}
      />,
    )

    expect(markup).toContain('Horizon Author')
    expect(markup).toContain('View archive')
    expect(markup.match(/href="\/authors\/horizon-author"/g)).toHaveLength(1)
  })

  /**
   * One bar, one listener.
   *
   * The page used to measure the article twice: `ReadingProgress` drew the bar
   * from its own scroll listener, and a second hook ran the same measurement
   * again to feed the reader session. The bar publishes its percentage now, so
   * the milestone events and the bar are the same number. What a rendered string
   * can hold of that is the surface: exactly one progress bar, and none at all
   * when the reading view does not ask for one.
   */
  it('measures the article once, through a single progress bar', () => {
    const markup = render(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
        showReadingProgress
        onReadingProgressChange={() => undefined}
      />,
    )

    expect(markup.match(/role="progressbar"/g)).toHaveLength(1)
    expect(markup).toContain('aria-label="Reading progress"')
  })

  it('renders no progress bar for a reading view that does not want one', () => {
    const markup = render(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
        onReadingProgressChange={() => undefined}
      />,
    )

    expect(markup).not.toContain('role="progressbar"')
  })

  it('tells a missing blog apart from a failed request', () => {
    const missing = render(
      <BlogReaderFrame
        post={null}
        loading={false}
        isMissing
        resolvedContent=""
        onBack={() => undefined}
        backLabel="View archive"
      />,
    )
    const failed = render(
      <BlogReaderFrame
        post={null}
        loading={false}
        loadError="HTTP 503"
        resolvedContent=""
        onBack={() => undefined}
        backLabel="View archive"
      />,
    )

    expect(missing).toContain('We could not find this blog.')
    expect(failed).toContain('We could not load this blog.')
    expect(failed).not.toContain('HTTP 503')
  })
})
