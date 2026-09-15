/**
 * One blog in the archive grid.
 *
 * The design system's `PostCard` - the quiet workhorse, deliberately different
 * from the archive feature above it. This component resolves the cover, which
 * is a hook, and hands the pattern the section's own words so a label that
 * would only echo the heading is dropped.
 */

import { PostCard, postCoverTransitionName } from '../../../design-system'
import { toPostSummary } from '../postSummary.presentation'
import { useResolvedCoverMedia } from '../../media/useResolvedCoverImage'
import { BlogArchiveSummary } from '../blog.types'

const COVER_SIZES = '(min-width: 1001px) 50vw, 100vw'

interface EditorialCardProps {
  post: BlogArchiveSummary
  /** The enclosing section's eyebrow and heading, for label de-duplication. */
  sectionLabels?: readonly string[]
}

const EditorialCard = ({ post, sectionLabels = [] }: EditorialCardProps) => {
  const coverMedia = useResolvedCoverMedia(post.featuredImage)
  const summary = toPostSummary(post, coverMedia, { coverSizes: COVER_SIZES })

  return (
    <PostCard
      post={summary}
      sectionLabels={sectionLabels}
      coverSizes={COVER_SIZES}
      coverTransitionName={postCoverTransitionName(summary.id) ?? undefined}
    />
  )
}

export default EditorialCard
