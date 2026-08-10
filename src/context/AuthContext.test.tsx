import { describe, expect, it, vi } from 'vitest'

import { AuthStatus } from '../core/types/auth.types'
import { authLifecycleReducer, clearLegacyAuthStorage, initialAuthState } from './AuthContext'

describe('AuthContext lifecycle state', () => {
  it('removes legacy persistent credentials during migration', () => {
    const removeItem = vi.fn()

    clearLegacyAuthStorage({ removeItem })

    expect(removeItem.mock.calls.map(([key]) => key)).toEqual([
      'horizon_blog_token',
      'horizon_blog_user',
      'horizon_blog_refresh_token',
    ])
  })

  it('settles a failed restoration into public signed-out state', () => {
    const state = authLifecycleReducer(initialAuthState, { type: 'unauthenticated' })

    expect(state).toEqual({
      user: null,
      status: AuthStatus.UNAUTHENTICATED,
      isLoading: false,
      error: null,
    })
  })

  it('represents logout uncertainty without retaining the user', () => {
    const authenticated = authLifecycleReducer(initialAuthState, {
      type: 'authenticated',
      user: { id: 1, username: 'Example' },
    })
    const signedOut = authLifecycleReducer(authenticated, {
      type: 'unauthenticated',
      error: 'Local sign-out completed, but server revocation could not be confirmed.',
    })

    expect(signedOut.user).toBeNull()
    expect(signedOut.status).toBe(AuthStatus.UNAUTHENTICATED)
    expect(signedOut.error).toContain('could not be confirmed')
  })
})
