/**
 * The scheduled row's cover, after `postCoverFrom` replaced a bare
 * `coverMedia.url`.
 *
 * `postSummary.presentation.test.ts` already proves `postCoverFrom` picks the
 * narrowest variant; what only a render can prove is that this row's `<img>`
 * actually carries a `srcset` built from that choice, rather than the
 * original upload `useResolvedCoverMedia` resolved. See
 * `articleCover.presentation.ts` for the cost of getting this wrong: a
 * multi-megabyte original shipped into a 180px frame.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import type { ResolvedMediaSource } from '../../media/media.api'
import type { ProfileBlogPost } from '../profile.types'
import ProfileScheduledRow from './ProfileScheduledRow'

const originalUrl = 'https://cdn.example.com/scheduled/original-2mb.png'

let coverMedia: ResolvedMediaSource | undefined

vi.mock('../../media/useResolvedCoverImage', () => ({
  useResolvedCoverMedia: () => coverMedia,
}))

const blog: ProfileBlogPost = {
  id: '9',
  title: 'A scheduled draft',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-10T00:00:00Z',
  scheduledPublishAt: '2026-09-25T09:00:00Z',
  status: 'scheduled',
  featuredImage: 'media://117',
}

const render = () =>
  renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <ProfileScheduledRow
        blog={blog}
        now={new Date('2026-09-20T00:00:00Z')}
        onEdit={vi.fn()}
        onReschedule={vi.fn()}
        onPublishNow={vi.fn()}
        onCancelSchedule={vi.fn()}
        onDelete={vi.fn()}
      />
    </ChakraProvider>,
  )

describe('ProfileScheduledRow cover', () => {
  it('renders a srcset and prefers the narrowest variant over the original when variants exist', () => {
    coverMedia = {
      id: '117',
      url: originalUrl,
      variants: [
        {
          url: 'https://cdn.example.com/scheduled/cover-640.webp',
          mimeType: 'image/webp',
          sizeBytes: 20000,
          width: 640,
          height: 360,
        },
        {
          url: 'https://cdn.example.com/scheduled/cover-320.webp',
          mimeType: 'image/webp',
          sizeBytes: 9000,
          width: 320,
          height: 180,
        },
      ],
    }

    const markup = render()

    expect(markup).toContain('src="https://cdn.example.com/scheduled/cover-320.webp"')
    expect(markup).not.toContain(`src="${originalUrl}"`)
    expect(markup).toMatch(/srcSet="[^"]*cover-320\.webp 320w[^"]*cover-640\.webp 640w[^"]*"/)
  })

  it('falls back to the original URL when the media has no resized variants', () => {
    coverMedia = { id: '117', url: originalUrl, variants: [] }

    const markup = render()

    expect(markup).toContain(`src="${originalUrl}"`)
    expect(markup).not.toMatch(/srcSet="[^"]+"/)
  })
})
