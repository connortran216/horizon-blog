import { describe, expect, it } from 'vitest'

import { ReaderInteractionsService, ReaderInteractionsApiPort } from './reader-interactions.service'
import {
  AnalyticsBatchRequest,
  AnalyticsBatchResponse,
  InteractionStateResponse,
} from './reader-interactions.types'

class FakeReaderInteractionsApi implements ReaderInteractionsApiPort {
  batches: AnalyticsBatchRequest[] = []
  heartCalls: string[] = []
  unheartCalls: string[] = []

  async sendAnalyticsBatch(request: AnalyticsBatchRequest): Promise<AnalyticsBatchResponse> {
    this.batches.push(request)
    return { accepted_count: request.events.length, duplicate_count: 0, rejected: [] }
  }

  async getInteractionState(postId: number, visitorId: string): Promise<InteractionStateResponse> {
    return {
      post_id: postId,
      heart_count: visitorId.length,
      viewer_has_hearted: false,
      can_heart: true,
    }
  }

  async heartPost(postId: number, visitorId: string): Promise<InteractionStateResponse> {
    this.heartCalls.push(`${postId}:${visitorId}`)
    return {
      post_id: postId,
      heart_count: 11,
      viewer_has_hearted: true,
      can_heart: true,
      changed: true,
    }
  }

  async unheartPost(postId: number, visitorId: string): Promise<InteractionStateResponse> {
    this.unheartCalls.push(`${postId}:${visitorId}`)
    return {
      post_id: postId,
      heart_count: 10,
      viewer_has_hearted: false,
      can_heart: true,
      changed: true,
    }
  }
}

const visitorId = '11111111-1111-4111-8111-111111111111'

describe('reader interactions service', () => {
  it('maps backend interaction state to display state', async () => {
    const service = new ReaderInteractionsService(new FakeReaderInteractionsApi())

    await expect(service.getInteractionState(42, visitorId)).resolves.toEqual({
      postId: 42,
      heartCount: visitorId.length,
      viewerHasHearted: false,
      canHeart: true,
    })
  })

  it('toggles heart state through the approved endpoints', async () => {
    const api = new FakeReaderInteractionsApi()
    const service = new ReaderInteractionsService(api)

    await expect(service.heartPost(42, visitorId)).resolves.toMatchObject({
      heartCount: 11,
      viewerHasHearted: true,
    })
    await expect(service.unheartPost(42, visitorId)).resolves.toMatchObject({
      heartCount: 10,
      viewerHasHearted: false,
    })
    expect(api.heartCalls).toEqual([`42:${visitorId}`])
    expect(api.unheartCalls).toEqual([`42:${visitorId}`])
  })

  it('creates share analytics events without blocking the reader interaction', async () => {
    const api = new FakeReaderInteractionsApi()
    const service = new ReaderInteractionsService(api)

    await service.trackShare({
      postId: 42,
      visitorId,
      sessionId: '22222222-2222-4222-8222-222222222222',
      eventId: '33333333-3333-4333-8333-333333333333',
      method: 'copy_link',
    })

    expect(api.batches).toEqual([
      {
        visitor_id: visitorId,
        events: [
          {
            event_id: '33333333-3333-4333-8333-333333333333',
            event_type: 'share',
            post_id: 42,
            session_id: '22222222-2222-4222-8222-222222222222',
            share_method: 'copy_link',
          },
        ],
      },
    ])
  })
})
