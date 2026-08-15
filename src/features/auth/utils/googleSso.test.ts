import { describe, expect, it } from 'vitest'

import { getOAuthErrorMessage, normalizeRedirectTo, parseOAuthCallbackFragment } from './googleSso'

describe('Google SSO redirect handling', () => {
  it.each(['https://evil.example/path', '//evil.example/path', 'javascript:alert(1)', 'profile'])(
    'rejects unsafe destination %s',
    (destination) => {
      expect(normalizeRedirectTo(destination)).toBe('/')
    },
  )

  it('keeps a safe relative destination and never exposes a token field', () => {
    const result = parseOAuthCallbackFragment(
      '#redirect_to=%2Fprofile%2Fexample&token=must-not-be-consumed',
    )

    expect(result).toEqual({ redirectTo: '/profile/example', error: null })
    expect(result).not.toHaveProperty('token')
  })

  it('maps an account conflict without exposing provider details', () => {
    const message = getOAuthErrorMessage('oauth_account_conflict')

    expect(message).toBe('An account already uses this email. Sign in with your existing method.')
    expect(message).not.toContain('Google account')
  })
})
