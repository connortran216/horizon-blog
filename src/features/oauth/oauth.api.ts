import { apiService } from '../../core/services/api.service'

interface OAuthCompleteResponse {
  redirect_uri: string
}

export interface McpAuthorizationCompletion {
  redirectURI: string
}

export const completeMcpAuthorization = async (
  requestId: string,
): Promise<McpAuthorizationCompletion> => {
  const response = await apiService.post<OAuthCompleteResponse>('/oauth/authorize/complete', {
    request_id: requestId,
  })

  return {
    redirectURI: response.redirect_uri,
  }
}
