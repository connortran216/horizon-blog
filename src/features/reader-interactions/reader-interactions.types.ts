export type AnalyticsEventType =
  | 'view_started'
  | 'progress'
  | 'active_time'
  | 'completed'
  | 'click'
  | 'share'
  | 'heart'
  | 'unheart'

export type ReaderShareMethod = 'native_share' | 'copy_link'

export interface AnalyticsEventRequest {
  event_id: string
  event_type: AnalyticsEventType
  post_id: number
  session_id: string
  client_time?: string
  progress_pct?: number
  active_ms?: number
  client_seq?: number
  link_url?: string
  referrer?: string
  share_method?: ReaderShareMethod | string
}

export interface AnalyticsBatchRequest {
  visitor_id?: string
  events: AnalyticsEventRequest[]
}

export interface AnalyticsRejectedEvent {
  event_id?: string
  index: number
  code: string
  message: string
}

export interface AnalyticsBatchResponse {
  accepted_count: number
  duplicate_count: number
  rejected: AnalyticsRejectedEvent[]
}

export interface InteractionStateRequest {
  visitor_id?: string
}

export interface InteractionStateResponse {
  post_id: number
  heart_count: number
  viewer_has_hearted: boolean
  can_heart: boolean
  changed?: boolean
}

export interface ReaderCapabilities {
  analyticsTracking: boolean
  reactions: boolean
}

export interface ReaderInteractionState {
  postId: number
  heartCount: number
  viewerHasHearted: boolean
  canHeart: boolean
}

export interface VisitorIdentity {
  visitorId: string
}

export interface ReadingSession {
  postId: number
  sessionId: string
  startedAt: Date
  lastActivityAt: Date
  emittedMilestones: Set<number>
  activeTimeSeq: number
  activeMs: number
  createEventId: () => string
  referrer?: string
}

export interface QueuedAnalyticsEvent {
  event: AnalyticsEventRequest
  retryCount: number
}
