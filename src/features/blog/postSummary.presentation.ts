/**
 * The feature layer's map from a blog record to the design system's post
 * contract.
 *
 * `content.logic.ts` in the design system says why this file exists: a card
 * must not have to know whether the field is called `createdAt`, `published_at`
 * or `publishedAt`, and a pattern that reads three spellings will read a fourth
 * next quarter. The mapping happens once, here, and every post surface on Home
 * and the blog archive reads the result.
 *
 * It is a pure module on purpose. Cover resolution is a hook, so the resolved
 * media is passed in rather than fetched here, which keeps every decision in
 * this file testable without a DOM - the only kind of test this repository has.
 */

import { toPublicPostPath, type BlogPostSummary } from '../../core'
import { extractPreviewText } from '../../core'
import type { ImageSource, PostCoverImage, PostSummary } from '../../design-system'
import type { ResolvedMediaSource } from '../media/media.api'

export interface PostSummaryOptions {
  /** The `sizes` attribute for the cover, when the caller knows its columns. */
  readonly coverSizes?: string
  /** Drop the author from the metadata line - an author archive, for instance. */
  readonly withAuthor?: boolean
}

/**
 * Width-descriptor candidates from a resolved media record.
 *
 * A variant with no URL or a non-positive width cannot appear in a `srcset` -
 * `0w` is invalid and the browser discards the whole attribute - so those are
 * dropped rather than passed through and left to fail silently in one browser.
 */
export function coverSourcesFrom(
  media: ResolvedMediaSource | undefined,
): readonly ImageSource[] | undefined {
  const sources = (media?.variants ?? [])
    .filter((variant) => Boolean(variant.url) && variant.width > 0)
    .map((variant) => ({ src: variant.url, width: variant.width }))

  return sources.length > 0 ? sources : undefined
}

/**
 * The cover, or `null` when the post has none.
 *
 * `null` rather than an object with an empty `src`: the design system draws a
 * distinct absent state for a post that has no artwork, and that state is only
 * reachable when the cover is genuinely absent. An empty string would put the
 * frame into a failure it can never recover from.
 *
 * The alt text is the post's own title. A cover plate is the largest thing on a
 * card and it always carries meaning, so there is no decorative escape hatch
 * here - see `PostCoverImage` in the design system.
 */
export function postCoverFrom(
  media: ResolvedMediaSource | undefined,
  alt: string,
  sizes?: string,
): PostCoverImage | null {
  const src = media?.url?.trim() ?? ''

  if (src.length === 0) {
    return null
  }

  const sources = coverSourcesFrom(media)

  return {
    src,
    ...(sources ? { sources } : {}),
    ...(sizes ? { sizes } : {}),
    alt,
  }
}

/**
 * The excerpt a card should show, or `null`.
 *
 * The excerpt wins, the subtitle stands in for it, and neither being present
 * means the card shows no excerpt at all. There is deliberately no filler
 * string: the phrase this page used to print - "Fresh thoughts are on the way."
 * - is an editorial promise the site has not made, and `DESIGN.md` forbids
 * invented content.
 */
export function postExcerptFrom(
  post: Pick<BlogPostSummary, 'excerpt' | 'subtitle'>,
): string | null {
  const preview = extractPreviewText(post.excerpt || post.subtitle || '').trim()

  return preview.length > 0 ? preview : null
}

/**
 * One blog record as the post patterns need it.
 *
 * Two facts are deliberately allowed to be absent rather than guessed. A post
 * with no reading estimate shows no reading time, where this page used to print
 * "1 min read" for everything it did not know; and a post with no excerpt shows
 * none. Both used to be invented, and an invented fact is worse than a shorter
 * card.
 */
export function toPostSummary(
  post: BlogPostSummary,
  media: ResolvedMediaSource | undefined,
  { coverSizes, withAuthor = true }: PostSummaryOptions = {},
): PostSummary {
  return {
    id: String(post.id),
    href: toPublicPostPath(post.id),
    title: post.title,
    excerpt: postExcerptFrom(post),
    cover: postCoverFrom(media, post.title, coverSizes),
    tags: post.tags ?? [],
    metadata: {
      author: withAuthor
        ? { name: post.author.username, avatarUrl: post.author.avatar ?? null }
        : null,
      publishedAt: post.createdAt,
      readingMinutes: post.readingTime ?? null,
      series: post.series
        ? {
            slug: post.series.slug,
            title: post.series.title,
            position: post.series.position,
            total: post.series.total,
          }
        : null,
    },
  }
}
