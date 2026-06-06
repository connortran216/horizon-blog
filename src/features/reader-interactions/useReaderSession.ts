import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnalyticsEventTransport } from './analytics-event.transport'
import { createReaderIdentityStorage, createReaderUuid } from './reader-identity.storage'
import { ReaderInteractionsService, readerInteractionsService } from './reader-interactions.service'
import {
  createReadingSession,
  recordActiveTime,
  recordProgress,
  startReadingSession,
} from './reader-session.service'
import { ReadingSession } from './reader-interactions.types'
import { shouldTrackActiveTime } from './reader-session.activity'
import { getTrackedLinkUrl } from './reader-session.links'

interface UseReaderSessionOptions {
  postId?: number
  enabled?: boolean
  service?: ReaderInteractionsService
  activeIntervalMs?: number
  idleTimeoutMs?: number
}

export const useReaderSession = ({
  postId,
  enabled = true,
  service = readerInteractionsService,
  activeIntervalMs = 15_000,
  idleTimeoutMs = 30_000,
}: UseReaderSessionOptions) => {
  const identityStorage = useMemo(() => createReaderIdentityStorage(), [])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const visitorIdRef = useRef<string | null>(null)
  const sessionRef = useRef<ReadingSession | null>(null)
  const transportRef = useRef<AnalyticsEventTransport | null>(null)
  const lastActivityMsRef = useRef(Date.now())
  const lastActiveFlushMsRef = useRef(Date.now())

  const flush = useCallback((keepalive = false) => {
    const transport = transportRef.current
    const visitorId = visitorIdRef.current
    if (!transport || !visitorId) return

    void transport.flush(visitorId, { keepalive })
  }, [])

  const markActivity = useCallback(() => {
    lastActivityMsRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (!enabled || !postId) {
      sessionRef.current = null
      transportRef.current = null
      setSessionId(null)
      return
    }

    const visitorId = identityStorage.getOrCreateVisitorId()
    const nextSessionId = createReaderUuid()
    const session = createReadingSession({
      postId,
      sessionId: nextSessionId,
      startedAt: new Date(),
      createEventId: createReaderUuid,
      referrer: document.referrer || undefined,
    })
    const transport = new AnalyticsEventTransport({
      sendBatch: (request, options) => service.sendAnalyticsBatch(request, options),
    })

    visitorIdRef.current = visitorId
    sessionRef.current = session
    transportRef.current = transport
    lastActivityMsRef.current = Date.now()
    lastActiveFlushMsRef.current = Date.now()
    setSessionId(nextSessionId)

    transport.enqueue(startReadingSession(session))
    void transport.flush(visitorId)

    return () => {
      void transport.flush(visitorId, { keepalive: true })
    }
  }, [enabled, identityStorage, postId, service])

  useEffect(() => {
    if (!enabled || !postId) return

    const eventOptions: AddEventListenerOptions = { passive: true }
    window.addEventListener('scroll', markActivity, eventOptions)
    window.addEventListener('pointerdown', markActivity, eventOptions)
    window.addEventListener('keydown', markActivity)
    window.addEventListener('focus', markActivity)

    return () => {
      window.removeEventListener('scroll', markActivity)
      window.removeEventListener('pointerdown', markActivity)
      window.removeEventListener('keydown', markActivity)
      window.removeEventListener('focus', markActivity)
    }
  }, [enabled, markActivity, postId])

  useEffect(() => {
    if (!enabled || !postId) return

    const intervalId = window.setInterval(() => {
      const session = sessionRef.current
      const transport = transportRef.current
      if (!session || !transport) return

      const now = Date.now()
      const isVisible = document.visibilityState !== 'hidden'
      const isFocused = typeof document.hasFocus === 'function' ? document.hasFocus() : true

      if (
        !shouldTrackActiveTime({
          nowMs: now,
          lastActivityMs: lastActivityMsRef.current,
          idleTimeoutMs,
          isVisible,
          isFocused,
        })
      ) {
        lastActiveFlushMsRef.current = now
        return
      }

      const event = recordActiveTime(session, now - lastActiveFlushMsRef.current, new Date(now))
      lastActiveFlushMsRef.current = now

      if (event) {
        transport.enqueue(event)
        flush()
      }
    }, activeIntervalMs)

    return () => window.clearInterval(intervalId)
  }, [activeIntervalMs, enabled, flush, idleTimeoutMs, postId])

  useEffect(() => {
    if (!enabled || !postId) return

    const flushOnPageExit = () => flush(true)
    const flushOnVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush(true)
    }

    window.addEventListener('pagehide', flushOnPageExit)
    document.addEventListener('visibilitychange', flushOnVisibilityChange)

    return () => {
      window.removeEventListener('pagehide', flushOnPageExit)
      document.removeEventListener('visibilitychange', flushOnVisibilityChange)
    }
  }, [enabled, flush, postId])

  const handleReadingProgressChange = useCallback(
    (progressPercent: number) => {
      const session = sessionRef.current
      const transport = transportRef.current
      if (!enabled || !session || !transport) return

      markActivity()
      const events = recordProgress(session, progressPercent)
      if (events.length === 0) return

      for (const event of events) {
        transport.enqueue(event)
      }

      flush()
    },
    [enabled, flush, markActivity],
  )

  const handleContentClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const session = sessionRef.current
      const transport = transportRef.current
      if (!enabled || !session || !transport) return

      markActivity()
      const linkUrl = getTrackedLinkUrl(event.target)
      if (!linkUrl) return

      transport.enqueue({
        event_id: createReaderUuid(),
        event_type: 'click',
        post_id: session.postId,
        session_id: session.sessionId,
        client_time: new Date().toISOString(),
        link_url: linkUrl,
      })
      flush()
    },
    [enabled, flush, markActivity],
  )

  return {
    sessionId,
    handleReadingProgressChange,
    handleContentClick,
  }
}
