import { describe, expect, it } from 'vitest'

import { DIContainer } from './container'

describe('feature dependency isolation', () => {
  it('does not register lazy author analytics dependencies in the global container', () => {
    const localContainer = new DIContainer()

    expect(localContainer.has('IAuthorAnalyticsRepository')).toBe(false)
    expect(localContainer.has('IAuthorAnalyticsService')).toBe(false)
  })
})
