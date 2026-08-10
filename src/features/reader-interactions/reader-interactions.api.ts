import { apiService } from '../../core/services/api.service'
import { ApiRequestOptions } from '../../core/types/auth.types'
import {
  AnalyticsBatchRequest,
  AnalyticsBatchResponse,
  InteractionStateResponse,
} from './reader-interactions.types'

export type AnalyticsDeliveryOptions = ApiRequestOptions

const PUBLIC_INTERACTION_AUTH: ApiRequestOptions = {
  authMode: 'optional',
  allowGuestFallback: true,
}

export interface ReaderInteractionsHttpClient {
  post<T>(endpoint: string, data?: unknown, options?: AnalyticsDeliveryOptions): Promise<T>
  put<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T>
  delete<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T>
}

export class ApiReaderInteractionsClient {
  constructor(private readonly http: ReaderInteractionsHttpClient = apiService) {}

  sendAnalyticsBatch(request: AnalyticsBatchRequest, options: AnalyticsDeliveryOptions = {}) {
    return this.http.post<AnalyticsBatchResponse>('/analytics/events/batch', request, {
      ...PUBLIC_INTERACTION_AUTH,
      ...options,
    })
  }

  getInteractionState(postId: number, visitorId: string) {
    return this.http.post<InteractionStateResponse>(
      `/posts/${postId}/interactions/state`,
      { visitor_id: visitorId },
      PUBLIC_INTERACTION_AUTH,
    )
  }

  heartPost(postId: number, visitorId: string) {
    return this.http.put<InteractionStateResponse>(
      `/posts/${postId}/interactions/heart`,
      { visitor_id: visitorId },
      PUBLIC_INTERACTION_AUTH,
    )
  }

  unheartPost(postId: number, visitorId: string) {
    return this.http.delete<InteractionStateResponse>(
      `/posts/${postId}/interactions/heart`,
      { visitor_id: visitorId },
      PUBLIC_INTERACTION_AUTH,
    )
  }
}

export const readerInteractionsApi = new ApiReaderInteractionsClient()
