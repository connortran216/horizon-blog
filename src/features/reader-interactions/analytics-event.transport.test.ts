import { describe, expect, it } from 'vitest'

import { AnalyticsEventTransport } from './analytics-event.transport'
import { AnalyticsEventRequest } from './reader-interactions.types'

const makeEvent = (eventId: string): AnalyticsEventRequest => ({
  event_id: eventId,
  event_type: 'view_started',
  post_id: 42,
  session_id: '77777777-7777-4777-8777-777777777777',
  client_time: '2026-06-04T09:00:00.000Z',
})

describe('analytics event transport', () => {
  it('batches queued events and removes accepted events', async () => {
    const sentBatches: AnalyticsEventRequest[][] = []
    const transport = new AnalyticsEventTransport({
      sendBatch: async (request) => {
        sentBatches.push(request.events)
        return { accepted_count: request.events.length, duplicate_count: 0, rejected: [] }
      },
    })

    transport.enqueue(makeEvent('aaaaaaaa-1111-4111-8111-111111111111'))
    transport.enqueue(makeEvent('bbbbbbbb-2222-4222-8222-222222222222'))

    await transport.flush('11111111-1111-4111-8111-111111111111')

    expect(sentBatches).toHaveLength(1)
    expect(sentBatches[0].map((event) => event.event_id)).toEqual([
      'aaaaaaaa-1111-4111-8111-111111111111',
      'bbbbbbbb-2222-4222-8222-222222222222',
    ])
    expect(transport.getQueueSize()).toBe(0)
  })

  it('preserves event IDs across retry and removes rejected events as terminal', async () => {
    const sentEventIds: string[] = []
    let attempts = 0
    const transport = new AnalyticsEventTransport({
      maxRetries: 2,
      sendBatch: async (request) => {
        attempts += 1
        sentEventIds.push(...request.events.map((event) => event.event_id))

        if (attempts === 1) {
          throw new Error('network down')
        }

        return {
          accepted_count: 0,
          duplicate_count: 0,
          rejected: [
            {
              event_id: request.events[0].event_id,
              index: 0,
              code: 'invalid_progress',
              message: 'invalid analytics progress percent',
            },
          ],
        }
      },
    })

    transport.enqueue(makeEvent('aaaaaaaa-1111-4111-8111-111111111111'))

    await transport.flush('11111111-1111-4111-8111-111111111111')
    expect(transport.getQueueSize()).toBe(1)

    await transport.flush('11111111-1111-4111-8111-111111111111')

    expect(sentEventIds).toEqual([
      'aaaaaaaa-1111-4111-8111-111111111111',
      'aaaaaaaa-1111-4111-8111-111111111111',
    ])
    expect(transport.getQueueSize()).toBe(0)
  })

  it('passes keepalive intent to final flush delivery', async () => {
    const keepaliveFlags: boolean[] = []
    const transport = new AnalyticsEventTransport({
      sendBatch: async (_request, options) => {
        keepaliveFlags.push(options.keepalive)
        return { accepted_count: 1, duplicate_count: 0, rejected: [] }
      },
    })

    transport.enqueue(makeEvent('aaaaaaaa-1111-4111-8111-111111111111'))
    await transport.flush('11111111-1111-4111-8111-111111111111', { keepalive: true })

    expect(keepaliveFlags).toEqual([true])
  })
})
