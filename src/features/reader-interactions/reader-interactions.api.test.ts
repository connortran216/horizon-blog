import { describe, expect, it } from 'vitest'

import {
  ApiReaderInteractionsClient,
  ReaderInteractionsHttpClient,
} from './reader-interactions.api'
import { AnalyticsBatchRequest, InteractionStateResponse } from './reader-interactions.types'

class FakeHttpClient implements ReaderInteractionsHttpClient {
  calls: Array<{ method: string; endpoint: string; data?: unknown; keepalive?: boolean }> = []

  async post<T>(endpoint: string, data?: unknown, options?: { keepalive?: boolean }): Promise<T> {
    this.calls.push({ method: 'POST', endpoint, data, keepalive: options?.keepalive })
    if (endpoint.includes('/interactions/state')) {
      return {
        post_id: 42,
        heart_count: 3,
        viewer_has_hearted: false,
        can_heart: true,
      } as T
    }
    return { accepted_count: 1, duplicate_count: 0, rejected: [] } as T
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    this.calls.push({ method: 'PUT', endpoint, data })
    return {
      post_id: 42,
      heart_count: 4,
      viewer_has_hearted: true,
      can_heart: true,
      changed: true,
    } as T
  }

  async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    this.calls.push({ method: 'DELETE', endpoint, data })
    return {
      post_id: 42,
      heart_count: 3,
      viewer_has_hearted: false,
      can_heart: true,
      changed: true,
    } as T
  }
}

const visitorId = '11111111-1111-4111-8111-111111111111'

describe('reader interactions API client', () => {
  it('sends visitor ID in interaction request bodies, never URLs', async () => {
    const http = new FakeHttpClient()
    const api = new ApiReaderInteractionsClient(http)

    const state = await api.getInteractionState(42, visitorId)
    const hearted = await api.heartPost(42, visitorId)
    const unhearted = await api.unheartPost(42, visitorId)

    expect(state).toMatchObject<InteractionStateResponse>({
      post_id: 42,
      heart_count: 3,
      viewer_has_hearted: false,
      can_heart: true,
    })
    expect(hearted.viewer_has_hearted).toBe(true)
    expect(unhearted.viewer_has_hearted).toBe(false)
    expect(http.calls.map((call) => call.endpoint)).toEqual([
      '/posts/42/interactions/state',
      '/posts/42/interactions/heart',
      '/posts/42/interactions/heart',
    ])
    expect(http.calls.every((call) => !call.endpoint.includes(visitorId))).toBe(true)
    expect(http.calls.map((call) => call.data)).toEqual([
      { visitor_id: visitorId },
      { visitor_id: visitorId },
      { visitor_id: visitorId },
    ])
  })

  it('passes keepalive intent to analytics event batch delivery', async () => {
    const http = new FakeHttpClient()
    const api = new ApiReaderInteractionsClient(http)
    const request: AnalyticsBatchRequest = {
      visitor_id: visitorId,
      events: [
        {
          event_id: '22222222-2222-4222-8222-222222222222',
          event_type: 'share',
          post_id: 42,
          session_id: '33333333-3333-4333-8333-333333333333',
          share_method: 'copy_link',
        },
      ],
    }

    await api.sendAnalyticsBatch(request, { keepalive: true })

    expect(http.calls).toEqual([
      {
        method: 'POST',
        endpoint: '/analytics/events/batch',
        data: request,
        keepalive: true,
      },
    ])
  })
})
