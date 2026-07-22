import { describe, expect, it } from 'vitest'
import {
  decodePublicPostCode,
  encodePublicPostId,
  resolvePublicPostRouteSegment,
  toPublicPostPath,
} from './public-post-code.mjs'

describe('public post codes', () => {
  it('keeps stable vectors for permanent public links', () => {
    expect(encodePublicPostId(1)).toBe('pZkpdpArtc')
    expect(encodePublicPostId(88)).toBe('pDvKh9bKaB')
    expect(encodePublicPostId(Number.MAX_SAFE_INTEGER)).toBe('pIiC3qbhu6')
    expect(toPublicPostPath(88)).toBe('/blog/pDvKh9bKaB')
  })

  it.each([1, 42, 76, 88, Number.MAX_SAFE_INTEGER])(
    'round trips supported post ID %s',
    (postId) => {
      expect(decodePublicPostCode(encodePublicPostId(postId))).toBe(String(postId))
    },
  )

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, 'abc', '01', ''])(
    'rejects unsupported post ID %s',
    (postId) => {
      expect(() => encodePublicPostId(postId)).toThrow('positive safe integer')
    },
  )

  it.each([undefined, '', '88', 'pDvKh9bKa', 'pDvKh9bKaB0', 'xDvKh9bKaB', 'p!!!!!!!!!!'])(
    'rejects malformed or non-canonical code %s',
    (code) => {
      expect(decodePublicPostCode(code)).toBeUndefined()
    },
  )

  it('distinguishes coded routes from legacy numeric routes', () => {
    expect(resolvePublicPostRouteSegment('pDvKh9bKaB')).toEqual({
      id: '88',
      canonicalPath: '/blog/pDvKh9bKaB',
      legacy: false,
    })
    expect(resolvePublicPostRouteSegment('88')).toEqual({
      id: '88',
      canonicalPath: '/blog/pDvKh9bKaB',
      legacy: true,
    })
    expect(resolvePublicPostRouteSegment('0')).toBeUndefined()
    expect(resolvePublicPostRouteSegment('not-a-code')).toBeUndefined()
  })
})
