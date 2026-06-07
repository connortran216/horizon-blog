import { describe, expect, it } from 'vitest'
import { buildReaderShareTargetUrl } from './reader-share.targets'

describe('reader share targets', () => {
  it('builds social share URLs without using the native share sheet', () => {
    const url = 'https://horizon.example/blog/76?ref=reader'
    const title = 'API Performance Monitoring'

    expect(buildReaderShareTargetUrl('facebook', { title, url })).toBe(
      'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fhorizon.example%2Fblog%2F76%3Fref%3Dreader',
    )
    expect(buildReaderShareTargetUrl('x', { title, url })).toBe(
      'https://twitter.com/intent/tweet?url=https%3A%2F%2Fhorizon.example%2Fblog%2F76%3Fref%3Dreader&text=API%20Performance%20Monitoring',
    )
    expect(buildReaderShareTargetUrl('linkedin', { title, url })).toBe(
      'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fhorizon.example%2Fblog%2F76%3Fref%3Dreader',
    )
    expect(buildReaderShareTargetUrl('copy_link', { title, url })).toBeNull()
  })
})
