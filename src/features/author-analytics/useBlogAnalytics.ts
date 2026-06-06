import { useCallback, useEffect, useMemo, useState } from 'react'

import { getAuthorAnalyticsService } from '../../core/di/container'
import { AuthorAnalyticsService } from './author-analytics.service'
import { AnalyticsDateRange, BlogAnalyticsDetail } from './author-analytics.types'
import { AnalyticsLoadErrorState, getAnalyticsLoadErrorState } from './author-analytics.hook-state'

interface UseBlogAnalyticsOptions {
  postId?: number
  range: AnalyticsDateRange
  enabled?: boolean
  service?: AuthorAnalyticsService
}

export const useBlogAnalytics = ({
  postId,
  range,
  enabled = true,
  service,
}: UseBlogAnalyticsOptions) => {
  const analyticsService = useMemo(() => service ?? getAuthorAnalyticsService(), [service])
  const [data, setData] = useState<BlogAnalyticsDetail | null>(null)
  const [error, setError] = useState<AnalyticsLoadErrorState | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(enabled && postId))
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    if (!enabled || !postId) {
      setIsLoading(false)
      return
    }

    let isCancelled = false
    setIsLoading(true)
    setError(null)

    analyticsService
      .getPostDetail(postId, range)
      .then((nextData) => {
        if (!isCancelled) setData(nextData)
      })
      .catch((loadError) => {
        if (!isCancelled) {
          setData(null)
          setError(getAnalyticsLoadErrorState(loadError))
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [analyticsService, enabled, postId, range.from, range.to, requestVersion])

  const refresh = useCallback(() => {
    setRequestVersion((version) => version + 1)
  }, [])

  return {
    data,
    error,
    isLoading,
    isEmpty: data !== null && data.summary.views === 0,
    dataFreshThrough: data?.dataFreshThrough,
    range,
    refresh,
  }
}
