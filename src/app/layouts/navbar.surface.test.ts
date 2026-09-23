import { describe, expect, it } from 'vitest'

import { HEADER_TOP_THRESHOLD_PX, headerSurface, isAtTop } from './navbar.logic'

describe('headerSurface', () => {
  it('has no box of its own over the Home field at the top of the page', () => {
    expect(headerSurface({ overField: true, atTop: true }).floating).toBe(false)
  })

  it('floats again as soon as the reader scrolls', () => {
    expect(headerSurface({ overField: true, atTop: false }).floating).toBe(true)
  })

  it('always floats on any other route', () => {
    expect(headerSurface({ overField: false, atTop: true }).floating).toBe(true)
    expect(headerSurface({ overField: false, atTop: false }).floating).toBe(true)
  })
})

describe('isAtTop', () => {
  it('tolerates a few pixels of scroll', () => {
    expect(isAtTop(0)).toBe(true)
    expect(isAtTop(HEADER_TOP_THRESHOLD_PX - 1)).toBe(true)
    expect(isAtTop(HEADER_TOP_THRESHOLD_PX)).toBe(false)
  })
})
