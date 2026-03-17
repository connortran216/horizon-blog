import { useEffect, useState } from 'react'
import { resolveMediaUrls } from './media.api'

export const useResolvedCoverImage = (rawValue?: string): string | undefined => {
  const [coverImage, setCoverImage] = useState<string | undefined>(rawValue)

  useEffect(() => {
    let active = true

    const resolveCover = async () => {
      if (!rawValue) {
        setCoverImage(undefined)
        return
      }

      const mediaMatch = rawValue.match(/^media:\/\/([a-zA-Z0-9_-]+)$/)
      if (!mediaMatch?.[1]) {
        setCoverImage(rawValue)
        return
      }

      try {
        const mediaMap = await resolveMediaUrls([mediaMatch[1]])
        if (!active) return
        setCoverImage(mediaMap[mediaMatch[1]]?.url)
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
