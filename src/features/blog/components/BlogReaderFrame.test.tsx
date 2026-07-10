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

    expect(markup).toContain('#database')
    expect(markup).toContain('#backend')
  })
})
