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
  private inFlightFlush: Promise<void> | null = null

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

  flush(visitorId: string, options: AnalyticsFlushOptions = {}): Promise<void> {
    if (this.inFlightFlush) return this.inFlightFlush
    if (this.queue.length === 0) return Promise.resolve()

    const batch = this.queue.slice(0, this.maxBatchSize)
    const delivery = this.deliverBatch(visitorId, batch, options)
    this.inFlightFlush = delivery
    void delivery.then(() => {
      if (this.inFlightFlush === delivery) {
        this.inFlightFlush = null
      }
    })

    return delivery
  }

  private async deliverBatch(
    visitorId: string,
    batch: QueuedAnalyticsEvent[],
    options: AnalyticsFlushOptions,
  ) {
    const request: AnalyticsBatchRequest = {
      visitor_id: visitorId,
      events: batch.map((item) => item.event),
    }

    try {
      await this.sendBatch(request, { keepalive: options.keepalive ?? false })
      this.removeDeliveredBatch(batch)
    } catch {
      for (const item of batch) {
        item.retryCount += 1
      }

      this.queue = this.queue.filter((item) => item.retryCount <= this.maxRetries)
    }
  }

  private removeDeliveredBatch(batch: QueuedAnalyticsEvent[]) {
    const deliveredItems = new Set(batch)
    this.queue = this.queue.filter((item) => !deliveredItems.has(item))
  }
}
