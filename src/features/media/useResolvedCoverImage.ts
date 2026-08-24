import { useEffect, useState } from 'react'
import { ResolvedMediaSource, resolveMediaSources } from './media.api'

const getMediaId = (value?: string): string | undefined => {
  return value?.match(/^media:\/\/([a-zA-Z0-9_-]+)$/)?.[1]
}

const getInitialCoverImage = (rawValue?: string): string | undefined => {
  return getMediaId(rawValue) ? undefined : rawValue
}

const getInitialCoverMedia = (rawValue?: string): ResolvedMediaSource | undefined => {
  const url = getInitialCoverImage(rawValue)
  return url ? { id: '', url, variants: [] } : undefined
}

export const useResolvedCoverMedia = (rawValue?: string): ResolvedMediaSource | undefined => {
  const [coverMedia, setCoverMedia] = useState<ResolvedMediaSource | undefined>(() =>
    getInitialCoverMedia(rawValue),
  )

  useEffect(() => {
    let active = true

    const resolveCover = async () => {
      if (!rawValue) {
        setCoverMedia(undefined)
        return
      }

      const mediaId = getMediaId(rawValue)
      if (!mediaId) {
        setCoverMedia({ id: '', url: rawValue, variants: [] })
        return
      }

      setCoverMedia(undefined)

      try {
        const mediaMap = await resolveMediaSources([mediaId])
        if (!active) return
        setCoverMedia(mediaMap[mediaId])
      } catch {
        if (!active) return
        setCoverMedia(undefined)
      }
    }

    void resolveCover()

    return () => {
      active = false
    }
  }, [rawValue])

  return coverMedia
}

export const useResolvedCoverImage = (rawValue?: string): string | undefined => {
  return useResolvedCoverMedia(rawValue)?.url
}
