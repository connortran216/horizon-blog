import { useEffect, useState } from 'react'
import { resolveMediaUrls } from './media.api'

const getMediaId = (value?: string): string | undefined => {
  return value?.match(/^media:\/\/([a-zA-Z0-9_-]+)$/)?.[1]
}

const getInitialCoverImage = (rawValue?: string): string | undefined => {
  return getMediaId(rawValue) ? undefined : rawValue
}

export const useResolvedCoverImage = (rawValue?: string): string | undefined => {
  const [coverImage, setCoverImage] = useState<string | undefined>(() =>
    getInitialCoverImage(rawValue),
  )

  useEffect(() => {
    let active = true

    const resolveCover = async () => {
      if (!rawValue) {
        setCoverImage(undefined)
        return
      }

      const mediaId = getMediaId(rawValue)
      if (!mediaId) {
        setCoverImage(rawValue)
        return
      }

      setCoverImage(undefined)

      try {
        const mediaMap = await resolveMediaUrls([mediaId])
        if (!active) return
        setCoverImage(mediaMap[mediaId]?.url)
      } catch {
        if (!active) return
        setCoverImage(undefined)
      }
    }

    void resolveCover()

    return () => {
      active = false
    }
  }, [rawValue])

  return coverImage
}
