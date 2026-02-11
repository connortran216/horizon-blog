import { useEffect, useState } from 'react'
import {
  normalizeMarkdownToMediaTokens,
  parseMediaIdsFromMarkdown,
  replaceMediaTokensWithUrls,
} from './media.tokens'
import { getPostMedia, resolveMediaUrls } from './media.api'

interface UseResolvedMarkdownOptions {
  postId?: number | null
}

export const useResolvedMarkdown = (
  markdown: string,
  options: UseResolvedMarkdownOptions = {},
): string => {
  const { postId } = options
  const [resolvedMarkdown, setResolvedMarkdown] = useState(markdown)

  useEffect(() => {
    let active = true

    const resolveContent = async () => {
      if (!markdown) {
        setResolvedMarkdown(markdown)
        return
      }

      let normalizedMarkdown = markdown

      if (postId) {
        try {
          const postMedia = await getPostMedia(postId)
          const urlToMediaId = postMedia.reduce<Record<string, string>>((acc, item) => {
            if (item.url) {
              acc[item.url] = item.mediaId
            }
            return acc
          }, {})

          normalizedMarkdown = normalizeMarkdownToMediaTokens(markdown, urlToMediaId)
        } catch {
          // Keep content as-is if media metadata cannot be loaded.
        }
      }

      const mediaIds = parseMediaIdsFromMarkdown(normalizedMarkdown)
      if (mediaIds.length === 0) {
        setResolvedMarkdown(normalizedMarkdown)
        return
      }

      try {
        const mediaMap = await resolveMediaUrls(mediaIds)
        if (!active) return
        setResolvedMarkdown(replaceMediaTokensWithUrls(normalizedMarkdown, mediaMap))
      } catch (error) {
        console.error('Failed to resolve media URLs:', error)
        if (!active) return
        setResolvedMarkdown(normalizedMarkdown)
      }
    }

    resolveContent()

    return () => {
      active = false
    }
  }, [markdown, postId])

  return resolvedMarkdown
}
