import { describe, expect, it } from 'vitest'

import { getAuthorAnalyticsService } from './author-analytics.dependencies'
import { AuthorAnalyticsService } from './author-analytics.service'

describe('author analytics dependencies', () => {
  it('creates one feature-local analytics service singleton', () => {
    const first = getAuthorAnalyticsService()
    const second = getAuthorAnalyticsService()

    expect(first).toBeInstanceOf(AuthorAnalyticsService)
    expect(second).toBe(first)
  })
})
