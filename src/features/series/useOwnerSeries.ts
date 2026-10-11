import { useCallback, useEffect, useState } from 'react'
import { getSeriesService } from './series.dependencies'
import { CreateSeriesInput, OwnerSeries, UpdateSeriesInput } from './series.types'

interface UseOwnerSeriesOptions {
  /**
   * `false` makes no request. The profile passes the viewer's
   * `content:manage:own` grant, so a member without it never asks for a list
   * the server would refuse.
   */
  enabled?: boolean
}

export type OwnerSeriesListStatus = 'idle' | 'loading' | 'ready' | 'failed'

/** An enabled list that has not finished - including one not yet requested - is loading. */
export function ownerSeriesLoading(enabled: boolean, status: OwnerSeriesListStatus): boolean {
  return enabled && (status === 'idle' || status === 'loading')
}

/**
 * The owner's Series and the four mutations on them.
 *
 * `error` is the list's own failure and nothing else. A mutation rethrows, and
 * every caller shows its failure where the action was taken; if a failed create
 * also set `error`, a section that had loaded fine would read as "could not
 * load" the moment its composer closed.
 *
 * `loading` is derived rather than stored, so an enabled hook that has not yet
 * started its request already reads as loading - the first render after the
 * profile grants access never shows an empty list or a count of zero.
 */
export const useOwnerSeries = ({ enabled = true }: UseOwnerSeriesOptions = {}) => {
  const [series, setSeries] = useState<OwnerSeries[]>([])
  const [status, setStatus] = useState<OwnerSeriesListStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      setSeries(await getSeriesService().listOwned())
      setStatus('ready')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Series could not load.')
      setStatus('failed')
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      void load()
    }
  }, [enabled, load])

  const create = async (input: CreateSeriesInput) => {
    const created = await getSeriesService().create(input)
    setSeries((current) => [created, ...current])
    return created
  }

  const update = async (seriesId: number, input: UpdateSeriesInput) => {
    const updated = await getSeriesService().update(seriesId, input)
    setSeries((current) => current.map((item) => (item.id === seriesId ? updated : item)))
  }

  const replacePosts = async (seriesId: number, postIds: number[]) => {
    const updated = await getSeriesService().replacePosts(seriesId, postIds)
    setSeries((current) => current.map((item) => (item.id === seriesId ? updated : item)))
  }

  const remove = async (seriesId: number) => {
    await getSeriesService().remove(seriesId)
    setSeries((current) => current.filter((item) => item.id !== seriesId))
  }

  const loading = ownerSeriesLoading(enabled, status)

  return { series, loading, error, retry: load, create, update, replacePosts, remove }
}
