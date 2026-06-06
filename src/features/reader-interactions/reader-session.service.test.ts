import { describe, expect, it } from 'vitest'

import {
  createReadingSession,
  recordActiveTime,
  recordProgress,
  startReadingSession,
} from './reader-session.service'

const createEventIdGenerator = () => {
  const eventIds = [
    'aaaaaaaa-1111-4111-8111-111111111111',
    'bbbbbbbb-2222-4222-8222-222222222222',
    'cccccccc-3333-4333-8333-333333333333',
    'dddddddd-4444-4444-8444-444444444444',
    'eeeeeeee-5555-4555-8555-555555555555',
    'ffffffff-6666-4666-8666-666666666666',
    '99999999-7777-4777-8777-777777777777',
  ]

  return () => {
    const id = eventIds.shift()
    if (!id) throw new Error('test event ID exhausted')
    return id
  }
}

describe('reading session service', () => {
  it('creates a view_started event with stable session identity', () => {
    const session = createReadingSession({
      postId: 42,
      sessionId: '77777777-7777-4777-8777-777777777777',
      startedAt: new Date('2026-06-04T09:00:00Z'),
      createEventId: createEventIdGenerator(),
      referrer: 'https://google.com/search?q=horizon',
    })

    const event = startReadingSession(session)

    expect(event).toMatchObject({
      event_id: 'aaaaaaaa-1111-4111-8111-111111111111',
      event_type: 'view_started',
      post_id: 42,
      session_id: '77777777-7777-4777-8777-777777777777',
      client_time: '2026-06-04T09:00:00.000Z',
      referrer: 'https://google.com/search?q=horizon',
    })
  })

  it('emits progress milestones once and emits completed at 100 percent', () => {
    const session = createReadingSession({
      postId: 42,
      sessionId: '77777777-7777-4777-8777-777777777777',
      startedAt: new Date('2026-06-04T09:00:00Z'),
      createEventId: createEventIdGenerator(),
    })

    const firstEvents = recordProgress(session, 55, new Date('2026-06-04T09:02:00Z'))
    const duplicateEvents = recordProgress(session, 55, new Date('2026-06-04T09:03:00Z'))
    const completedEvents = recordProgress(session, 100, new Date('2026-06-04T09:04:00Z'))

    expect(firstEvents.map((event) => event.progress_pct)).toEqual([25, 50])
    expect(firstEvents.every((event) => event.event_type === 'progress')).toBe(true)
    expect(duplicateEvents).toEqual([])
    expect(completedEvents.map((event) => event.event_type)).toEqual([
      'progress',
      'progress',
      'progress',
      'completed',
    ])
    expect(completedEvents.map((event) => event.progress_pct)).toEqual([75, 80, 100, undefined])
  })

  it('sends cumulative active time with strictly increasing client sequence', () => {
    const session = createReadingSession({
      postId: 42,
      sessionId: '77777777-7777-4777-8777-777777777777',
      startedAt: new Date('2026-06-04T09:00:00Z'),
      createEventId: createEventIdGenerator(),
    })

    const first = recordActiveTime(session, 1500, new Date('2026-06-04T09:01:00Z'))
    const ignored = recordActiveTime(session, 0, new Date('2026-06-04T09:01:05Z'))
    const second = recordActiveTime(session, 2500, new Date('2026-06-04T09:01:10Z'))

    expect(first).toMatchObject({
      event_type: 'active_time',
      active_ms: 1500,
      client_seq: 1,
    })
    expect(ignored).toBeNull()
    expect(second).toMatchObject({
      event_type: 'active_time',
      active_ms: 4000,
      client_seq: 2,
    })
  })
})
