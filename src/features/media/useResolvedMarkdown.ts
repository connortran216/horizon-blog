import { useEffect, useState } from 'react'
import { parseMediaIdsFromMarkdown, replaceMediaTokensWithUrls } from './media.tokens'
import {
  ResolveMediaSourceResult,
  resolveMediaSources,
} from './media.api'

export interface ResolvedMarkdownMedia {
  content: string
  sources: ResolveMediaSourceResult
}

export const buildResolvedMarkdownMedia = (
  markdown: string,
  sources: ResolveMediaSourceResult,
): ResolvedMarkdownMedia => ({
  content: replaceMediaTokensWithUrls(markdown, sources),
  sources,
})

export const useResolvedMarkdownMedia = (markdown: string): ResolvedMarkdownMedia => {
  const [resolved, setResolved] = useState<ResolvedMarkdownMedia>({
    content: markdown,
    sources: {},
  })

  useEffect(() => {
    let active = true

    const resolveContent = async () => {
      if (!markdown) {
        setResolved({ content: markdown, sources: {} })
        return
      }

      const mediaIds = parseMediaIdsFromMarkdown(markdown)
      if (mediaIds.length === 0) {
        setResolved({ content: markdown, sources: {} })
        return
      }

      try {
        const mediaMap = await resolveMediaSources(mediaIds)
        if (!active) return
        setResolved(buildResolvedMarkdownMedia(markdown, mediaMap))
      } catch (error) {
        console.error('Failed to resolve media URLs:', error)
        if (!active) return
        setResolved({ content: markdown, sources: {} })
      }
    }

    resolveContent()

    return () => {
      active = false
    }
  }, [markdown])

  return resolved
}

export const useResolvedMarkdown = (markdown: string): string => {
  return useResolvedMarkdownMedia(markdown).content
}
