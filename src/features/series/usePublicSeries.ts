import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../core/services/api.service'
import { getSeriesService } from './series.dependencies'
import { PublicSeries } from './series.types'

/**
 * A Series with no public parts is as absent as a deleted one.
 *
 * Its header would otherwise claim "0 blogs" over an empty ordered list, which
 * reads as a Series the reader arrived at too early rather than as a link that
 * no longer resolves.
 */
export const publicSeriesIsAbsent = (series: PublicSeries) => series.parts.length === 0

/** A missing or private Series answers 404; anything else may succeed on a retry. */
export const publicSeriesRequestIsAbsent = (error: unknown) =>
  error instanceof ApiError && error.status === 404

/**
 * One public Series.
 *
 * `notFound` is reported separately from `error` because the two states need
 * different surfaces: a Series that is missing, private or has no published
 * blogs answers a second request exactly the same way, so it earns links
 * onward rather than a retry button that cannot work.
 */
export const usePublicSeries = (slug?: string) => {
  const [series, setSeries] = useState<PublicSeries | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [version, setVersion] = useState(0)

  const retry = useCallback(() => setVersion((value) => value + 1), [])

  useEffect(() => {
    if (!slug) {
      setSeries(null)
      setError(null)
      setNotFound(true)
      setLoading(false)
      return
    }

    let current = true
    setLoading(true)
    setError(null)
    setNotFound(false)
    getSeriesService()
      .getPublicSeries(slug)
      .then((data) => {
        if (!current) return
        setSeries(data)
        setNotFound(publicSeriesIsAbsent(data))
      })
      .catch((requestError: unknown) => {
        if (!current) return
        setSeries(null)
        if (publicSeriesRequestIsAbsent(requestError)) {
          setNotFound(true)
          return
        }
        setError('This series could not load right now.')
      })
      .finally(() => {
        if (current) setLoading(false)
      })

    return () => {
      current = false
    }
  }, [slug, version])

  return { series, loading, error, notFound, retry }
}
