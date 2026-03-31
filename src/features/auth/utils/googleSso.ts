import { getRuntimeConfig } from '../../../config/runtime'

export const normalizeRedirectTo = (value?: string | null) => {
  if (!value) {
    return '/'
  }

  return value.startsWith('/') ? value : '/'
}

export const buildGoogleSsoStartUrl = (redirectTo?: string | null) => {
  const { beHost } = getRuntimeConfig()
  const url = new URL('/auth/providers/google/start', beHost)
  url.searchParams.set('redirect_to', normalizeRedirectTo(redirectTo))
  return url.toString()
}

export const parseOAuthCallbackFragment = (hash: string) => {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(fragment)

  return {
    token: params.get('token'),
    redirectTo: normalizeRedirectTo(params.get('redirect_to')),
    error: params.get('error'),
  }
}

export const getOAuthErrorMessage = (errorCode?: string | null) => {
  switch (errorCode) {
    case 'oauth_cancelled':
    case 'oauth_provider_error':
      return 'Google sign in was cancelled.'
    case 'oauth_expired':
    case 'oauth_cookie_invalid':
      return 'Google sign in expired. Please try again.'
    case 'oauth_invalid_state':
    case 'oauth_state_invalid':
    case 'oauth_nonce_invalid':
      return 'Google sign in could not be verified. Please try again.'
    case 'oauth_exchange_failed':
    case 'oauth_token_exchange_failed':
    case 'oauth_id_token_invalid':
      return 'Google sign in failed while finishing the login.'
    case 'oauth_user_resolution_failed':
      return 'Google sign in could not be linked to your account. Please try another sign-in method.'
    case 'oauth_start_failed':
    case 'oauth_finalize_failed':
    case 'oauth_missing_token':
      return 'Google sign in failed. Please try again.'
    default:
      return 'Google sign in failed. Please try again.'
  }
}
