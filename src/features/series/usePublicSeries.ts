import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../core/services/api.service'
import { getSeriesService } from './series.dependencies'
import { PublicSeries } from './series.types'

export const usePublicSeries = (slug?: string) => {
  const [series, setSeries] = useState<PublicSeries | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const retry = useCallback(() => setVersion((value) => value + 1), [])

  useEffect(() => {
    if (!slug) {
      setSeries(null)
      setError('Series not found.')
      setLoading(false)
      return
    }

    let current = true
    setLoading(true)
    setError(null)
    getSeriesService()
      .getPublicSeries(slug)
      .then((data) => {
        if (current) setSeries(data)
      })
      .catch((requestError) => {
        if (!current) return
        setSeries(null)
        setError(
          requestError instanceof ApiError && requestError.status === 404
            ? 'This series is not available.'
            : 'This series could not load right now.',
        )
      })
      .finally(() => {
        if (current) setLoading(false)
      })

    return () => {
      current = false
    }
  }, [slug, version])

  return { series, loading, error, retry }
}
