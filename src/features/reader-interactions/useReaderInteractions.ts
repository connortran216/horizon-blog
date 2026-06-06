import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { createReaderIdentityStorage, createReaderUuid } from './reader-identity.storage'
import { ReaderInteractionsService, readerInteractionsService } from './reader-interactions.service'
import { ReaderInteractionState, ReaderShareMethod } from './reader-interactions.types'

interface UseReaderInteractionsOptions {
  postId?: number
  title?: string
  shareUrl?: string
  sessionId?: string | null
  enabled?: boolean
  service?: ReaderInteractionsService
}

const copyToClipboard = async (value: string) => {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard is not available in this browser.')
  }

  await navigator.clipboard.writeText(value)
}

export const useReaderInteractions = ({
  postId,
  title,
  shareUrl,
  sessionId,
  enabled = true,
  service = readerInteractionsService,
}: UseReaderInteractionsOptions) => {
  const toast = useToast()
  const identityStorage = useMemo(() => createReaderIdentityStorage(), [])
  const visitorIdRef = useRef<string | null>(null)
  const [state, setState] = useState<ReaderInteractionState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isHeartLoading, setIsHeartLoading] = useState(false)
  const [isShareLoading, setIsShareLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !postId) {
      setState(null)
      return
    }

    let isCancelled = false
    const visitorId = identityStorage.getOrCreateVisitorId()
    visitorIdRef.current = visitorId
    setIsLoading(true)

    service
      .getInteractionState(postId, visitorId)
      .then((nextState) => {
        if (!isCancelled) setState(nextState)
      })
      .catch((error) => {
        console.error('Failed to load reader interaction state:', error)
        if (!isCancelled) setState(null)
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [enabled, identityStorage, postId, service])

  const toggleHeart = useCallback(async () => {
    const visitorId = visitorIdRef.current
    if (!enabled || !postId || !visitorId || !state?.canHeart || isHeartLoading) return

    const previousState = state
    const optimisticState: ReaderInteractionState = {
      ...state,
      viewerHasHearted: !state.viewerHasHearted,
      heartCount: Math.max(0, state.heartCount + (state.viewerHasHearted ? -1 : 1)),
    }

    setState(optimisticState)
    setIsHeartLoading(true)

    try {
      const nextState = previousState.viewerHasHearted
        ? await service.unheartPost(postId, visitorId)
        : await service.heartPost(postId, visitorId)

      setState(nextState)
    } catch (error) {
      console.error('Failed to update heart state:', error)
      setState(previousState)
      toast({
        title: 'Reaction was not saved',
        description: 'Please try again in a moment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsHeartLoading(false)
    }
  }, [enabled, isHeartLoading, postId, service, state, toast])

  const share = useCallback(async () => {
    if (!enabled || !postId || isShareLoading) return

    const url = shareUrl || window.location.href
    const visitorId = visitorIdRef.current ?? identityStorage.getOrCreateVisitorId()
    visitorIdRef.current = visitorId
    setIsShareLoading(true)

    let method: ReaderShareMethod = 'copy_link'

    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        method = 'native_share'
      } else {
        await copyToClipboard(url)
      }

      toast({
        title: method === 'native_share' ? 'Shared' : 'Link copied',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })

      if (sessionId) {
        void service.trackShare({
          postId,
          visitorId,
          sessionId,
          eventId: createReaderUuid(),
          method,
        })
      }
    } catch (error) {
      console.error('Failed to share blog:', error)
      toast({
        title: 'Unable to share',
        description: error instanceof Error ? error.message : 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsShareLoading(false)
    }
  }, [enabled, identityStorage, isShareLoading, postId, service, sessionId, shareUrl, title, toast])

  return {
    state,
    isLoading,
    isHeartLoading,
    isShareLoading,
    toggleHeart,
    share,
  }
}
