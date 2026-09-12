/**
 * One of Home's latest blogs.
 *
 * The card itself is the design system's `PostCard`; this component exists only
 * to resolve the cover, which is a hook and therefore cannot live in the pure
 * adapter, and to hand the pattern the section's own words so it can drop a
 * label that would merely echo the heading above it.
 *
 * The "Lead blog" / "Recent blog" badges are gone. They sat under a section
 * headed "Recent blogs" and repeated it on every card, which is the exact
 * failure `hierarchy.logic.ts` was written for.
 */

import { PostCard } from '../../../design-system'
import type { BlogPostSummary } from '../../../core'
import { toPostSummary } from '../../blog/postSummary.presentation'
import { useResolvedCoverMedia } from '../../media/useResolvedCoverImage'

const COVER_SIZES = '(min-width: 1169px) 33vw, (min-width: 801px) 50vw, 100vw'

interface StoryCardProps {
  post: BlogPostSummary
  /** The enclosing section's eyebrow and heading, for label de-duplication. */
  sectionLabels?: readonly string[]
}

const StoryCard = ({ post, sectionLabels = [] }: StoryCardProps) => {
  const coverMedia = useResolvedCoverMedia(post.featuredImage)
  const summary = toPostSummary(post, coverMedia, { coverSizes: COVER_SIZES })

  return (
    <PostCard
      post={summary}
      sectionLabels={sectionLabels}
      coverSizes={COVER_SIZES}
      /*
       * Spec 008 ("Preserve Landing Card Cover") requires the whole cover to
       * stay visible on this card: quiet surrounding space is preferred over
       * cutting the artwork.
       */
      coverFit="contain"
    />
  )
}

export default StoryCard
