import { useCallback, useEffect, useMemo, useState } from 'react'

import { getAuthorAnalyticsService } from '../../core/di/container'
import { AuthorAnalyticsService } from './author-analytics.service'
import {
  AnalyticsDateRange,
  AnalyticsPostSort,
  AnalyticsSortOrder,
  BlogMetricsPage,
} from './author-analytics.types'
import {
  AnalyticsLoadErrorState,
  getAnalyticsLoadErrorState,
  isBlogMetricsEmpty,
} from './author-analytics.hook-state'

interface UseBlogMetricsOptions {
  range: AnalyticsDateRange
  sort?: AnalyticsPostSort
  order?: AnalyticsSortOrder
  page?: number
  limit?: number
  enabled?: boolean
  service?: AuthorAnalyticsService
}

export const useBlogMetrics = ({
  range,
  sort = 'views',
  order = 'desc',
  page = 1,
  limit = 10,
  enabled = true,
  service,
}: UseBlogMetricsOptions) => {
  const analyticsService = useMemo(() => service ?? getAuthorAnalyticsService(), [service])
  const [data, setData] = useState<BlogMetricsPage | null>(null)
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
      .getPostMetrics({ range, sort, order, page, limit })
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
  }, [analyticsService, enabled, limit, order, page, range.from, range.to, requestVersion, sort])

  const refresh = useCallback(() => {
    setRequestVersion((version) => version + 1)
  }, [])

  return {
    data,
    error,
    isLoading,
    isEmpty: isBlogMetricsEmpty(data),
    dataFreshThrough: data?.dataFreshThrough,
    range,
    refresh,
  }
}
