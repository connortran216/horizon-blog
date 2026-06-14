import { useCallback, useEffect, useMemo, useState } from 'react'

import { getAuthorAnalyticsService } from './author-analytics.dependencies'
import { AuthorAnalyticsService } from './author-analytics.service'
import { AnalyticsDateRange, AnalyticsOverview } from './author-analytics.types'
import {
  AnalyticsLoadErrorState,
  getAnalyticsLoadErrorState,
  isAnalyticsOverviewEmpty,
} from './author-analytics.hook-state'

interface UseAnalyticsOverviewOptions {
  range: AnalyticsDateRange
  enabled?: boolean
  service?: AuthorAnalyticsService
}

export const useAnalyticsOverview = ({
  range,
  enabled = true,
  service,
}: UseAnalyticsOverviewOptions) => {
  const analyticsService = useMemo(() => service ?? getAuthorAnalyticsService(), [service])
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [error, setError] = useState<AnalyticsLoadErrorState | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    let isCancelled = false
    setIsLoading(true)
    setError(null)

    analyticsService
      .getOverview(range)
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
  }, [analyticsService, enabled, range.from, range.to, requestVersion])

  const refresh = useCallback(() => {
    setRequestVersion((version) => version + 1)
  }, [])

  return {
    data,
    error,
    isLoading,
    isEmpty: isAnalyticsOverviewEmpty(data),
    dataFreshThrough: data?.dataFreshThrough,
    range,
    refresh,
  }
}
