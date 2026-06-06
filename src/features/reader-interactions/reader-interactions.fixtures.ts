import {
  AnalyticsBatchRequest,
  AnalyticsBatchResponse,
  AnalyticsEventRequest,
  InteractionStateResponse,
} from './reader-interactions.types'

export const readerAnalyticsFixtureVisitorId = '11111111-1111-4111-8111-111111111111'
export const readerAnalyticsFixtureSessionId = '22222222-2222-4222-8222-222222222222'

export const readerAnalyticsFixtureEvent: AnalyticsEventRequest = {
  event_id: '33333333-3333-4333-8333-333333333333',
  event_type: 'progress',
  post_id: 42,
  session_id: readerAnalyticsFixtureSessionId,
  client_time: '2026-06-04T09:15:00Z',
  progress_pct: 50,
}

export const readerAnalyticsFixtureBatchRequest: AnalyticsBatchRequest = {
  visitor_id: readerAnalyticsFixtureVisitorId,
  events: [readerAnalyticsFixtureEvent],
}

export const readerAnalyticsFixtureBatchResponse: AnalyticsBatchResponse = {
  accepted_count: 1,
  duplicate_count: 0,
  rejected: [],
}

export const readerInteractionStateFixture: InteractionStateResponse = {
  post_id: 42,
  heart_count: 128,
  viewer_has_hearted: true,
  can_heart: true,
}
