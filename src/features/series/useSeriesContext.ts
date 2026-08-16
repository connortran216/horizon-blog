import { useEffect, useState } from 'react'
import { getSeriesService } from './series.dependencies'
import { markSeriesPostVisited } from './series.progress'
import { PublicSeriesContext } from './series.types'

export const useSeriesContext = (postId?: number) => {
  const [context, setContext] = useState<PublicSeriesContext | null>(null)

  useEffect(() => {
    if (!postId) {
      setContext(null)
      return
    }

    let current = true
    getSeriesService()
      .getPublicContext(postId)
      .then((data) => {
        if (!current) return
        setContext(data)
        if (data) markSeriesPostVisited(data.series.id, postId)
      })
      .catch(() => {
        if (current) setContext(null)
      })

    return () => {
      current = false
    }
  }, [postId])

  return context
}
