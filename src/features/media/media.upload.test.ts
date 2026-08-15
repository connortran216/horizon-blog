import { describe, expect, it } from 'vitest'

import { isAllowedMediaUpload } from './media.upload'

describe('media upload allowlist', () => {
  it.each([
    ['cover.jpg', 'image/jpeg'],
    ['cover.png', 'image/png'],
  ])('accepts %s', (name, type) => {
    expect(isAllowedMediaUpload(new File(['image'], name, { type }))).toBe(true)
  })

  it.each([
    ['diagram.svg', 'image/svg+xml'],
    ['diagram.svg', 'application/octet-stream'],
    ['cover.webp', 'image/webp'],
  ])('rejects %s with %s', (name, type) => {
    expect(isAllowedMediaUpload(new File(['image'], name, { type }))).toBe(false)
  })
})
