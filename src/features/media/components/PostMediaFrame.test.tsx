import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PostMediaFrame from './PostMediaFrame'

describe('PostMediaFrame', () => {
  it('renders a branded no-media state instead of a broken image', () => {
    const markup = renderToStaticMarkup(<PostMediaFrame title="A durable fallback" />)

    expect(markup).toContain('data-media-state="empty"')
    expect(markup).toContain('HORIZON / WRITING')
    expect(markup).toContain('A durable fallback')
    expect(markup).not.toContain('<img')
  })

  it('never emits unresolved media tokens as image sources', () => {
    const markup = renderToStaticMarkup(
      <PostMediaFrame rawSource="media://108" title="Protected cover" />,
    )

    expect(markup).toContain('data-media-state="loading"')
    expect(markup).not.toContain('src="media://108"')
  })
})
