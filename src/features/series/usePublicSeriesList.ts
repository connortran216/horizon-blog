import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../core/services/api.service'
import { getSeriesService } from './series.dependencies'
import { SeriesService } from './series.service'
import { PublicSeriesListPage } from './series.types'

interface UsePublicSeriesListOptions {
  page?: number
  limit?: number
  enabled?: boolean
  service?: SeriesService
}

export const getPublicSeriesListError = (error: unknown) =>
  error instanceof ApiError && error.status === 404
    ? 'No Series are available.'
    : 'Series could not load right now.'

export const incrementSeriesListRequestVersion = (value: number) => value + 1

export const usePublicSeriesList = ({
  page = 1,
  limit = 12,
  enabled = true,
  service,
}: UsePublicSeriesListOptions = {}) => {
  const seriesService = useMemo(() => service ?? getSeriesService(), [service])
  const [data, setData] = useState<PublicSeriesListPage | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    let current = true
    setLoading(true)
    setError(null)
    seriesService
      .listPublic(page, limit)
      .then((nextData) => {
        if (current) setData(nextData)
      })
      .catch((loadError: unknown) => {
        if (!current) return
        setData(null)
        setError(getPublicSeriesListError(loadError))
      })
      .finally(() => {
        if (current) setLoading(false)
      })

    return () => {
      current = false
    }
  }, [enabled, limit, page, seriesService, version])

  const retry = useCallback(() => setVersion(incrementSeriesListRequestVersion), [])

  return {
    data,
    items: data?.items ?? [],
    loading,
    error,
    retry,
  }
}
