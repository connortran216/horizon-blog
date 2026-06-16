import { describe, expect, it } from 'vitest'
import { BRAND_LOGO_DIMENSIONS } from './BrandLogo'

describe('BrandLogo', () => {
  it('provides intrinsic dimensions for each logo variant', () => {
    expect(BRAND_LOGO_DIMENSIONS).toEqual({
      full: { width: 1200, height: 320 },
      icon: { width: 700, height: 700 },
    })
  })
})
