import { apiService } from '../../core/services/api.service'

interface OAuthCompleteResponse {
  redirect_uri: string
}

export const completeMcpAuthorization = async (requestId: string): Promise<string> => {
  const response = await apiService.post<OAuthCompleteResponse>('/oauth/authorize/complete', {
    request_id: requestId,
  })

  return response.redirect_uri
}
