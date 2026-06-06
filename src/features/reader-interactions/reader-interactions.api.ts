import { apiService } from '../../core/services/api.service'
import {
  AnalyticsBatchRequest,
  AnalyticsBatchResponse,
  InteractionStateResponse,
} from './reader-interactions.types'

export interface AnalyticsDeliveryOptions {
  keepalive?: boolean
}

export interface ReaderInteractionsHttpClient {
  post<T>(endpoint: string, data?: unknown, options?: AnalyticsDeliveryOptions): Promise<T>
  put<T>(endpoint: string, data?: unknown): Promise<T>
  delete<T>(endpoint: string, data?: unknown): Promise<T>
}

export class ApiReaderInteractionsClient {
  constructor(private readonly http: ReaderInteractionsHttpClient = apiService) {}

  sendAnalyticsBatch(request: AnalyticsBatchRequest, options: AnalyticsDeliveryOptions = {}) {
    return this.http.post<AnalyticsBatchResponse>('/analytics/events/batch', request, options)
  }

  getInteractionState(postId: number, visitorId: string) {
    return this.http.post<InteractionStateResponse>(`/posts/${postId}/interactions/state`, {
      visitor_id: visitorId,
    })
  }

  heartPost(postId: number, visitorId: string) {
    return this.http.put<InteractionStateResponse>(`/posts/${postId}/interactions/heart`, {
      visitor_id: visitorId,
    })
  }

  unheartPost(postId: number, visitorId: string) {
    return this.http.delete<InteractionStateResponse>(`/posts/${postId}/interactions/heart`, {
      visitor_id: visitorId,
    })
  }
}

export const readerInteractionsApi = new ApiReaderInteractionsClient()
