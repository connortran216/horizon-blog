import { describe, expect, it, vi } from 'vitest'

import { apiService } from '../../core/services/api.service'
import { completeMcpAuthorization } from './oauth.api'

describe('completeMcpAuthorization', () => {
  it('returns the redirect URI and fallback bearer token from the backend response', async () => {
    const postSpy = vi.spyOn(apiService, 'post').mockResolvedValueOnce({
      redirect_uri: 'http://127.0.0.1:49152/callback?code=abc&state=state-123',
      access_token: 'fallback-jwt',
      token_type: 'Bearer',
    })

    const completion = await completeMcpAuthorization('request-123')

    expect(postSpy).toHaveBeenCalledWith('/oauth/authorize/complete', {
      request_id: 'request-123',
    })
    expect(completion).toEqual({
      redirectURI: 'http://127.0.0.1:49152/callback?code=abc&state=state-123',
      accessToken: 'fallback-jwt',
      tokenType: 'Bearer',
    })

    postSpy.mockRestore()
  })
})
