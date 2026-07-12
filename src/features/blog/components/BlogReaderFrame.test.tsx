import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
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

describe('BlogReaderFrame', () => {
  it('places reader interactions after the article content', () => {
    const markup = renderToStaticMarkup(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
        emptyLabel="No post"
        interactionSection={<button type="button">Heart action</button>}
        bottomPadding={false}
      />,
    )

    expect(markup).toContain('Heart action')

    const contentPosition = markup.indexOf('Loading content...')
    const interactionPosition = markup.indexOf('Heart action')

    expect(contentPosition).toBeGreaterThan(-1)
    expect(interactionPosition).toBeGreaterThan(contentPosition)
  })

  it('places related posts after the article column for mobile flow', () => {
    const markup = renderToStaticMarkup(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
        emptyLabel="No post"
        interactionSection={<button type="button">Heart action</button>}
        relatedSection={<aside>More like this</aside>}
        bottomPadding={false}
      />,
    )

    const contentPosition = markup.indexOf('Loading content...')
    const interactionPosition = markup.indexOf('Heart action')
    const relatedPosition = markup.indexOf('More like this')

    expect(contentPosition).toBeGreaterThan(-1)
    expect(interactionPosition).toBeGreaterThan(contentPosition)
    expect(relatedPosition).toBeGreaterThan(interactionPosition)
  })

  it('places table of contents before the article content', () => {
    const markup = renderToStaticMarkup(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
        emptyLabel="No post"
        tableOfContentsRail={<nav>Desktop contents</nav>}
        tableOfContentsInline={<nav>Inline contents</nav>}
        relatedSection={<aside>More like this</aside>}
        bottomPadding={false}
      />,
    )

    const titlePosition = markup.indexOf('Reader interaction placement')
    const desktopTocPosition = markup.indexOf('Desktop contents')
    const inlineTocPosition = markup.indexOf('Inline contents')
    const contentPosition = markup.indexOf('Loading content...')
    const relatedPosition = markup.indexOf('More like this')

    expect(desktopTocPosition).toBeGreaterThan(-1)
    expect(inlineTocPosition).toBeGreaterThan(-1)
    expect(desktopTocPosition).toBeLessThan(titlePosition)
    expect(inlineTocPosition).toBeGreaterThan(titlePosition)
    expect(inlineTocPosition).toBeLessThan(contentPosition)
    expect(relatedPosition).toBeGreaterThan(contentPosition)
  })

  it('shows public blog tags in the reader header', () => {
    const markup = renderToStaticMarkup(
      <BlogReaderFrame
        post={post}
        loading={false}
        resolvedContent="Body content"
        onBack={() => undefined}
        backLabel="View archive"
        emptyLabel="No post"
        bottomPadding={false}
      />,
    )

    expect(markup).toContain('Tags')
    expect(markup).toContain('#database')
    expect(markup).toContain('#backend')
  })
})
