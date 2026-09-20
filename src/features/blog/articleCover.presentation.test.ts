import { describe, expect, it } from 'vitest'

import type { ResolveMediaSourceResult } from '../media/media.api'
import { articleCoverFrom } from './articleCover.presentation'

const original = 'https://minio.example/posts/102/cover.png?X-Amz-Signature=abc'

const media: ResolveMediaSourceResult = {
  '117': {
    id: '117',
    url: original,
    width: 1672,
    height: 941,
    variants: [
      {
        url: 'https://minio.example/cover.w1280.webp',
        mimeType: 'image/webp',
        sizeBytes: 59372,
        width: 1280,
        height: 720,
      },
      {
        url: 'https://minio.example/cover.w320.webp',
        mimeType: 'image/webp',
        sizeBytes: 9334,
        width: 320,
        height: 180,
      },
      {
        url: 'https://minio.example/cover.w640.webp',
        mimeType: 'image/webp',
        sizeBytes: 22908,
        width: 640,
        height: 360,
      },
    ],
  },
}

describe('articleCoverFrom', () => {
  it('attaches the resized variants when the cover URL is a resolved media record', () => {
    const cover = articleCoverFrom({ src: original, alt: 'A wide view' }, 'Post title', media)

    expect(cover.alt).toBe('A wide view')
    expect(cover.sources).toEqual([
      { src: 'https://minio.example/cover.w1280.webp', width: 1280 },
      { src: 'https://minio.example/cover.w320.webp', width: 320 },
      { src: 'https://minio.example/cover.w640.webp', width: 640 },
    ])
  })

  it('never leaves the original upload as the srcset-blind fallback when a variant exists', () => {
    const cover = articleCoverFrom({ src: original, alt: 'A wide view' }, 'Post title', media)

    expect(cover.src).toBe('https://minio.example/cover.w320.webp')
    expect(cover.src).not.toBe(original)
  })

  it('renders an unmatched URL from itself, with no sources', () => {
    const cover = articleCoverFrom(
      { src: 'https://example.com/external.jpg', alt: '' },
      'Post title',
      media,
    )

    expect(cover).toEqual({ src: 'https://example.com/external.jpg', alt: 'Post title' })
  })

  it('falls back to the post title when the markdown alt is empty', () => {
    const cover = articleCoverFrom({ src: original, alt: '' }, 'Post title', media)

    expect(cover.alt).toBe('Post title')
  })

  it('keeps the original URL when the record resolved with no variants', () => {
    const bare: ResolveMediaSourceResult = { '5': { id: '5', url: original, variants: [] } }
    const cover = articleCoverFrom({ src: original, alt: 'Alt' }, 'Post title', bare)

    expect(cover).toEqual({ src: original, alt: 'Alt' })
  })
})
