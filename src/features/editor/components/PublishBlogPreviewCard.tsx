/**
 * "This is how the post will look" - migrated onto Horizon Design System v2
 * (release M6).
 *
 * `PreviewCard` draws the card. What stays here is resolving the cover, because
 * `featuredImage` may be a `media://` token that only the media feature knows
 * how to turn into a URL, and `ResponsiveImage` inside the card wants a URL.
 *
 * Two honesty changes came with the pattern:
 *
 * - The card is named as a preview in the accessibility tree. The legacy card
 *   was indistinguishable from a real post to anyone navigating by heading.
 * - The date is labelled with what it means. A bare date under a draft
 *   scheduled for next week read as the date it would carry today.
 *
 * The cover is decorative: the title it illustrates is the next thing in the
 * card, so the legacy `alt={blog.title}` made a screen reader read the title
 * twice. `ResponsiveImage` handles the absent case with the title as its
 * caption, which is what `DefaultPostCover` was doing by hand.
 */

import { PreviewCard } from '../../../design-system'
import { BlogPostSummary } from '../../../core'
import { useResolvedCoverMedia } from '../../media/useResolvedCoverImage'

interface PublishBlogPreviewCardProps {
  blog: BlogPostSummary
  /** Already formatted by the page, which owns the locale. */
  publicationDate: string
  /** What that date means: "Publishing today", "Scheduled for". */
  publicationDateLabel: string
}

const PublishBlogPreviewCard = ({
  blog,
  publicationDate,
  publicationDateLabel,
}: PublishBlogPreviewCardProps) => {
  const coverMedia = useResolvedCoverMedia(blog.featuredImage)

  return (
    <PreviewCard
      title={blog.title}
      excerpt={blog.excerpt}
      coverUrl={coverMedia?.url ?? null}
      tags={blog.tags}
      author={{ name: blog.author.username, avatarUrl: blog.author.avatar }}
      publicationDate={publicationDate}
      publicationDateLabel={publicationDateLabel}
      readingTime={`${blog.readingTime || 1} min read`}
    />
  )
}

export default PublishBlogPreviewCard
