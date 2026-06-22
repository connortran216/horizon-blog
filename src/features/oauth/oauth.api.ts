import { apiService } from '../../core/services/api.service'

interface OAuthCompleteResponse {
  redirect_uri: string
  access_token: string
  token_type: string
}

export interface McpAuthorizationCompletion {
  redirectURI: string
  accessToken: string
  tokenType: string
}

export const completeMcpAuthorization = async (
  requestId: string,
): Promise<McpAuthorizationCompletion> => {
  const response = await apiService.post<OAuthCompleteResponse>('/oauth/authorize/complete', {
    request_id: requestId,
  })

  return {
    redirectURI: response.redirect_uri,
    accessToken: response.access_token,
    tokenType: response.token_type,
  }
}
