import { AnalyticsEventRequest, ReadingSession } from './reader-interactions.types'

const PROGRESS_MILESTONES = [25, 50, 75, 80, 100]

export interface CreateReadingSessionOptions {
  postId: number
  sessionId: string
  startedAt?: Date
  createEventId: () => string
  referrer?: string
}

export const createReadingSession = ({
  postId,
  sessionId,
  startedAt = new Date(),
  createEventId,
  referrer,
}: CreateReadingSessionOptions): ReadingSession => ({
  postId,
  sessionId,
  startedAt,
  lastActivityAt: startedAt,
  emittedMilestones: new Set<number>(),
  activeTimeSeq: 0,
  activeMs: 0,
  createEventId,
  referrer,
})

const createBaseEvent = (
  session: ReadingSession,
  eventTime: Date,
): Pick<AnalyticsEventRequest, 'event_id' | 'post_id' | 'session_id' | 'client_time'> => ({
  event_id: session.createEventId(),
  post_id: session.postId,
  session_id: session.sessionId,
  client_time: eventTime.toISOString(),
})

export const startReadingSession = (session: ReadingSession): AnalyticsEventRequest => ({
  ...createBaseEvent(session, session.startedAt),
  event_type: 'view_started',
  referrer: session.referrer,
})

export const recordProgress = (
  session: ReadingSession,
  progressPercent: number,
  eventTime: Date = new Date(),
): AnalyticsEventRequest[] => {
  const normalizedProgress = Math.max(0, Math.min(100, Math.floor(progressPercent)))
  const events: AnalyticsEventRequest[] = []

  for (const milestone of PROGRESS_MILESTONES) {
    if (normalizedProgress < milestone || session.emittedMilestones.has(milestone)) {
      continue
    }

    session.emittedMilestones.add(milestone)
    events.push({
      ...createBaseEvent(session, eventTime),
      event_type: 'progress',
      progress_pct: milestone,
    })
  }

  if (normalizedProgress >= 100 && !session.emittedMilestones.has(101)) {
    session.emittedMilestones.add(101)
    events.push({
      ...createBaseEvent(session, eventTime),
      event_type: 'completed',
    })
  }

  if (events.length > 0) {
    session.lastActivityAt = eventTime
  }

  return events
}

export const recordActiveTime = (
  session: ReadingSession,
  activeDeltaMs: number,
  eventTime: Date = new Date(),
): AnalyticsEventRequest | null => {
  if (!Number.isFinite(activeDeltaMs) || activeDeltaMs <= 0) {
    return null
  }

  session.activeMs += Math.floor(activeDeltaMs)
  session.activeTimeSeq += 1
  session.lastActivityAt = eventTime

  return {
    ...createBaseEvent(session, eventTime),
    event_type: 'active_time',
    active_ms: session.activeMs,
    client_seq: session.activeTimeSeq,
  }
}
