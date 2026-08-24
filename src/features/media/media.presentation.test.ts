import { describe, expect, it } from 'vitest'
import { getResponsiveImageAttributes } from './media.presentation'

describe('responsive media presentation', () => {
  const source = {
    id: '1',
    url: 'https://media.test/original.png',
    width: 1200,
    height: 800,
    variants: [
      {
        url: 'https://media.test/w640.webp',
        mimeType: 'image/webp',
        sizeBytes: 6400,
        width: 640,
        height: 427,
      },
      {
        url: 'https://media.test/w320.webp',
        mimeType: 'image/webp',
        sizeBytes: 3200,
        width: 320,
        height: 213,
      },
    ],
  }

  it('builds an ordered width srcset and lazy defaults', () => {
    expect(getResponsiveImageAttributes(source, '100vw')).toEqual({
      src: source.url,
      srcSet: 'https://media.test/w320.webp 320w, https://media.test/w640.webp 640w',
      sizes: '100vw',
      width: 1200,
      height: 800,
      loading: 'lazy',
      decoding: 'async',
      fetchPriority: undefined,
    })
  })

  it('keeps the original URL as an eager hero fallback', () => {
    expect(getResponsiveImageAttributes({ ...source, variants: [] }, '100vw', true)).toEqual({
      src: source.url,
      srcSet: undefined,
      sizes: undefined,
      width: 1200,
      height: 800,
      loading: 'eager',
      decoding: 'async',
      fetchPriority: 'high',
    })
  })
})
