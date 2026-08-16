import { useCallback, useEffect, useState } from 'react'
import { getSeriesService } from './series.dependencies'
import { CreateSeriesInput, OwnerSeries, UpdateSeriesInput } from './series.types'

export const useOwnerSeries = () => {
  const [series, setSeries] = useState<OwnerSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSeries(await getSeriesService().listOwned())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Series could not load.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const runMutation = async (mutation: () => Promise<void>) => {
    setError(null)
    try {
      await mutation()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Series could not be saved.')
      throw requestError
    }
  }

  const create = async (input: CreateSeriesInput) => {
    let created: OwnerSeries | null = null
    await runMutation(async () => {
      created = await getSeriesService().create(input)
      setSeries((current) => [created as OwnerSeries, ...current])
    })
    return created
  }

  const update = async (seriesId: number, input: UpdateSeriesInput) => {
    await runMutation(async () => {
      const updated = await getSeriesService().update(seriesId, input)
      setSeries((current) => current.map((item) => (item.id === seriesId ? updated : item)))
    })
  }

  const replacePosts = async (seriesId: number, postIds: number[]) => {
    await runMutation(async () => {
      const updated = await getSeriesService().replacePosts(seriesId, postIds)
      setSeries((current) => current.map((item) => (item.id === seriesId ? updated : item)))
    })
  }

  const remove = async (seriesId: number) => {
    await runMutation(async () => {
      await getSeriesService().remove(seriesId)
      setSeries((current) => current.filter((item) => item.id !== seriesId))
    })
  }

  return { series, loading, error, retry: load, create, update, replacePosts, remove }
}
