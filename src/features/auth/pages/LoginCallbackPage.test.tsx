import { describe, expect, it } from 'vitest'

import { AuthStatus } from '../../../core/types/auth.types'
import { resolveLoginCallbackOutcome } from './LoginCallbackPage'

describe('LoginCallbackPage outcome', () => {
  it('waits while AuthContext restores the cookie session', () => {
    expect(resolveLoginCallbackOutcome(AuthStatus.LOADING, false, '#redirect_to=%2Fblog')).toEqual({
      type: 'pending',
    })
  })

  it('navigates only after the standard session is authenticated', () => {
    expect(
      resolveLoginCallbackOutcome(AuthStatus.AUTHENTICATED, true, '#redirect_to=%2Fblog-editor'),
    ).toEqual({ type: 'success', redirectTo: '/blog-editor' })
  })

  it('preserves sanitized provider errors without parsing credentials', () => {
    expect(
      resolveLoginCallbackOutcome(
        AuthStatus.UNAUTHENTICATED,
        false,
        '#error=oauth_state_invalid&token=ignored',
      ),
    ).toEqual({ type: 'failure', error: 'oauth_state_invalid', redirectTo: '/' })
  })
})
