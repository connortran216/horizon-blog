import { AnalyticsDeliveryOptions, readerInteractionsApi } from './reader-interactions.api'
import {
  AnalyticsBatchRequest,
  AnalyticsBatchResponse,
  InteractionStateResponse,
  ReaderInteractionState,
  ReaderShareMethod,
} from './reader-interactions.types'

export interface ReaderInteractionsApiPort {
  sendAnalyticsBatch(
    request: AnalyticsBatchRequest,
    options?: AnalyticsDeliveryOptions,
  ): Promise<AnalyticsBatchResponse>
  getInteractionState(postId: number, visitorId: string): Promise<InteractionStateResponse>
  heartPost(postId: number, visitorId: string): Promise<InteractionStateResponse>
  unheartPost(postId: number, visitorId: string): Promise<InteractionStateResponse>
}

export interface TrackShareInput {
  postId: number
  visitorId: string
  sessionId: string
  eventId: string
  method: ReaderShareMethod
}

export class ReaderInteractionsService {
  constructor(private readonly api: ReaderInteractionsApiPort = readerInteractionsApi) {}

  sendAnalyticsBatch(request: AnalyticsBatchRequest, options: AnalyticsDeliveryOptions = {}) {
    return this.api.sendAnalyticsBatch(request, options)
  }

  async getInteractionState(postId: number, visitorId: string) {
    return this.mapInteractionState(await this.api.getInteractionState(postId, visitorId))
  }

  async heartPost(postId: number, visitorId: string) {
    return this.mapInteractionState(await this.api.heartPost(postId, visitorId))
  }

  async unheartPost(postId: number, visitorId: string) {
    return this.mapInteractionState(await this.api.unheartPost(postId, visitorId))
  }

  async trackShare({ postId, visitorId, sessionId, eventId, method }: TrackShareInput) {
    await this.sendAnalyticsBatch({
      visitor_id: visitorId,
      events: [
        {
          event_id: eventId,
          event_type: 'share',
          post_id: postId,
          session_id: sessionId,
          share_method: method,
        },
      ],
    })
  }

  private mapInteractionState(response: InteractionStateResponse): ReaderInteractionState {
    return {
      postId: response.post_id,
      heartCount: response.heart_count,
      viewerHasHearted: response.viewer_has_hearted,
      canHeart: response.can_heart,
    }
  }
}

export const readerInteractionsService = new ReaderInteractionsService()
