/**
 * The publish preview's cover, after it stopped handing `PreviewCard` a bare
 * `coverMedia.url`.
 *
 * `PreviewCard` used to take only `coverUrl`, so this card could only ever
 * pass the resolved media's canonical URL - the original upload, when the
 * post has one. It now resolves the cover with `postCoverFrom`, the same
 * function every card on Home and `/blog` uses, and forwards its `sources`/
 * `sizes` to `PreviewCard`. What matters here is that the rendered `<img>`
 * actually carries a `srcset` built from the resized variants rather than the
 * original, and that it still falls back to the original when there are none.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import type { BlogPostSummary } from '../../../core'
import type { ResolvedMediaSource } from '../../media/media.api'
import PublishBlogPreviewCard from './PublishBlogPreviewCard'

const originalUrl = 'https://cdn.example.com/publish/original-2mb.png'

let coverMedia: ResolvedMediaSource | undefined

vi.mock('../../media/useResolvedCoverImage', () => ({
  useResolvedCoverMedia: () => coverMedia,
}))

const blog: BlogPostSummary = {
  id: '55',
  title: 'A post about to go live',
  excerpt: 'What changes when the schedule fires.',
  author: { id: 3, username: 'Connor Tran' },
  createdAt: '2026-09-18T00:00:00Z',
  updatedAt: '2026-09-19T00:00:00Z',
  readingTime: 4,
  tags: [],
  featuredImage: 'media://55',
  status: 'draft',
  slug: 'a-post-about-to-go-live',
  series: null,
}

const render = () =>
  renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <PublishBlogPreviewCard
        blog={blog}
        publicationDate="20 Sep 2026"
        publicationDateLabel="Publishing today"
      />
    </ChakraProvider>,
  )

describe('PublishBlogPreviewCard cover', () => {
  it('renders a srcset and prefers the narrowest variant over the original when variants exist', () => {
    coverMedia = {
      id: '55',
      url: originalUrl,
      variants: [
        {
          url: 'https://cdn.example.com/publish/cover-640.webp',
          mimeType: 'image/webp',
          sizeBytes: 20000,
          width: 640,
          height: 360,
        },
        {
          url: 'https://cdn.example.com/publish/cover-320.webp',
          mimeType: 'image/webp',
          sizeBytes: 9000,
          width: 320,
          height: 180,
        },
      ],
    }

    const markup = render()

    expect(markup).toContain('src="https://cdn.example.com/publish/cover-320.webp"')
    expect(markup).not.toContain(`src="${originalUrl}"`)
    expect(markup).toMatch(/srcSet="[^"]*cover-320\.webp 320w[^"]*cover-640\.webp 640w[^"]*"/)
  })

  it('falls back to the original URL when the media has no resized variants', () => {
    coverMedia = { id: '55', url: originalUrl, variants: [] }

    const markup = render()

    expect(markup).toContain(`src="${originalUrl}"`)
    expect(markup).not.toMatch(/srcSet="[^"]+"/)
  })
})
