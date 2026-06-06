import { describe, expect, it } from 'vitest'

import { DIContainer, SERVICE_TOKENS, getAuthorAnalyticsService } from './container'
import { AuthorAnalyticsService } from '../../features/author-analytics/author-analytics.service'

describe('analytics DI registration', () => {
  it('registers the author analytics repository and service as singletons', () => {
    const localContainer = new DIContainer()

    expect(localContainer.has(SERVICE_TOKENS.AUTHOR_ANALYTICS_REPOSITORY)).toBe(true)
    expect(localContainer.has(SERVICE_TOKENS.AUTHOR_ANALYTICS_SERVICE)).toBe(true)
    expect(localContainer.resolve(SERVICE_TOKENS.AUTHOR_ANALYTICS_SERVICE)).toBe(
      localContainer.resolve(SERVICE_TOKENS.AUTHOR_ANALYTICS_SERVICE),
    )
  })

  it('resolves the author analytics service through the exported getter', () => {
    expect(getAuthorAnalyticsService()).toBeInstanceOf(AuthorAnalyticsService)
  })
})
