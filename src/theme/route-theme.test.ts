import { describe, it, expect } from 'vitest'
import { themeForPath } from './route-theme'
import signal from './index'
import legacy from './legacy'
describe('incremental theme rollout', () => {
  it('enables Signal only on the released Home route', () => {
    expect(themeForPath('/')).toBe(signal)
  })
  it.each([
    '/blog',
    '/blog/example',
    '/about',
    '/series',
    '/login',
    '/blog-editor',
    '/profile/connor',
    '/admin/access',
  ])('preserves the previous theme for %s', (path) => {
    expect(themeForPath(path)).toBe(legacy)
  })
})
