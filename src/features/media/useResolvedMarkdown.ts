import { useEffect, useState } from 'react'
import { parseMediaIdsFromMarkdown, replaceMediaTokensWithUrls } from './media.tokens'
import { resolveMediaUrls } from './media.api'

export const useResolvedMarkdown = (markdown: string): string => {
  const [resolvedMarkdown, setResolvedMarkdown] = useState(markdown)

  useEffect(() => {
    let active = true

    const resolveContent = async () => {
      if (!markdown) {
        setResolvedMarkdown(markdown)
        return
      }

      const mediaIds = parseMediaIdsFromMarkdown(markdown)
      if (mediaIds.length === 0) {
        setResolvedMarkdown(markdown)
        return
      }

      try {
        const mediaMap = await resolveMediaUrls(mediaIds)
        if (!active) return
        setResolvedMarkdown(replaceMediaTokensWithUrls(markdown, mediaMap))
      } catch (error) {
        console.error('Failed to resolve media URLs:', error)
        if (!active) return
        setResolvedMarkdown(markdown)
      }
    }

    resolveContent()

    return () => {
      active = false
    }
  }, [markdown])

  return resolvedMarkdown
}
