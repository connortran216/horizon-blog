import { describe, expect, it } from 'vitest'
import { can, isAuthorizationContext } from './authorization'

describe('authorization helpers', () => {
  it('allows only permissions returned by the backend', () => {
    const authorization = {
      role: 'author' as const,
      permissions: ['profile:manage:self', 'content:manage:own'] as const,
    }

    expect(
      can({ ...authorization, permissions: [...authorization.permissions] }, 'content:manage:own'),
    ).toBe(true)
    expect(
      can({ ...authorization, permissions: [...authorization.permissions] }, 'roles:assign'),
    ).toBe(false)
  })

  it('fails closed for absent or malformed authorization', () => {
    expect(can(undefined, 'content:manage:own')).toBe(false)
    expect(isAuthorizationContext({ role: 'admin', permissions: ['unknown'] })).toBe(false)
    expect(isAuthorizationContext({ role: 'legacy', permissions: [] })).toBe(false)
  })
})
