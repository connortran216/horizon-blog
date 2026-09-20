/**
 * The lifted article cover, with its resized variants attached.
 *
 * `extractArticleCoverImage` works on markdown and can only hand back the one
 * URL the markdown carries. By the time it runs, `replaceMediaTokensWithUrls`
 * has already turned `media://117` into the media record's canonical URL - the
 * original upload. Rendered as a bare `src`, that is what the browser fetched:
 * measured on `/blog/p9SjNJh4aP`, the cover was a 1672px PNG of 1,050,054
 * bytes, in a frame 873px wide, while `/media/resolve` had already returned
 * four WebP variants of 9-59 KB for the same picture. Every card on Home and
 * `/blog` uses those variants; the largest image in the reader did not.
 *
 * The record is found again here by that same canonical URL - the way
 * `applyResponsiveMediaAttributes` already does for the body's images - and
 * the cover is shaped exactly as a card cover is, by `postCoverFrom`: the
 * narrowest variant as `src`, every variant in `sources`. A cover whose URL
 * matches no record (an external image, or a resolve that failed) renders
 * from its own URL, as before.
 */

import type { ImageSource } from '../../design-system'
import type { ResolveMediaSourceResult } from '../media/media.api'
import type { ArticleCoverImage } from './articleCoverImage.logic'
import { postCoverFrom } from './postSummary.presentation'

export interface ArticleCover {
  readonly src: string
  readonly alt: string
  /** Width-descriptor candidates, when the cover is a resolved media record. */
  readonly sources?: readonly ImageSource[]
}

export function articleCoverFrom(
  cover: ArticleCoverImage,
  fallbackAlt: string,
  media: ResolveMediaSourceResult,
): ArticleCover {
  const alt = cover.alt || fallbackAlt
  const record = Object.values(media).find((source) => source.url === cover.src)

  if (!record) {
    return { src: cover.src, alt }
  }

  const resolved = postCoverFrom(record, alt)

  return {
    src: resolved?.src || cover.src,
    alt,
    ...(resolved?.sources ? { sources: resolved.sources } : {}),
  }
}
