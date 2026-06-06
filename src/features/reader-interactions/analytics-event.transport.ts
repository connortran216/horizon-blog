import {
  AnalyticsBatchRequest,
  AnalyticsBatchResponse,
  AnalyticsEventRequest,
  QueuedAnalyticsEvent,
} from './reader-interactions.types'

export interface AnalyticsEventTransportOptions {
  maxBatchSize?: number
  maxRetries?: number
  sendBatch: (
    request: AnalyticsBatchRequest,
    options: { keepalive: boolean },
  ) => Promise<AnalyticsBatchResponse>
}

export interface AnalyticsFlushOptions {
  keepalive?: boolean
}

export class AnalyticsEventTransport {
  private readonly maxBatchSize: number
  private readonly maxRetries: number
  private readonly sendBatch: AnalyticsEventTransportOptions['sendBatch']
  private queue: QueuedAnalyticsEvent[] = []

  constructor({ maxBatchSize = 50, maxRetries = 3, sendBatch }: AnalyticsEventTransportOptions) {
    this.maxBatchSize = maxBatchSize
    this.maxRetries = maxRetries
    this.sendBatch = sendBatch
  }

  enqueue(event: AnalyticsEventRequest) {
    this.queue.push({ event, retryCount: 0 })
  }

  getQueueSize() {
    return this.queue.length
  }

  async flush(visitorId: string, options: AnalyticsFlushOptions = {}) {
    if (this.queue.length === 0) return

    const batch = this.queue.slice(0, this.maxBatchSize)
    const request: AnalyticsBatchRequest = {
      visitor_id: visitorId,
      events: batch.map((item) => item.event),
    }

    try {
      const response = await this.sendBatch(request, { keepalive: options.keepalive ?? false })
      this.removeDeliveredBatch(batch, response)
    } catch {
      for (const item of batch) {
        item.retryCount += 1
      }

      this.queue = this.queue.filter((item) => item.retryCount <= this.maxRetries)
    }
  }

  private removeDeliveredBatch(batch: QueuedAnalyticsEvent[], response: AnalyticsBatchResponse) {
    const rejectedEventIds = new Set(
      response.rejected
        .map((event) => event.event_id)
        .filter((eventId): eventId is string => !!eventId),
    )
    const deliveredEventIds = new Set(batch.map((item) => item.event.event_id))

    for (const eventId of rejectedEventIds) {
      deliveredEventIds.add(eventId)
    }

    this.queue = this.queue.filter((item) => !deliveredEventIds.has(item.event.event_id))
  }
}
