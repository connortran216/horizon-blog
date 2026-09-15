/**
 * The blog the archive lifts out of its own listing.
 *
 * The design system's `FeaturedStory`: the Signature's sibling rather than the
 * card's - the same editorial family and feature radius, at a page-title ramp
 * inside a bounded surface, because it sits in a results page rather than at
 * the top of Home.
 *
 * The "Editor's pick" badge and the "Quiet writing. Sharp ideas." line are
 * gone. Neither was editorial fact: nothing picks this post except its position
 * in the sort order, and the tagline was copy the page wrote about itself.
 */

import {
  FeaturedStory as FeaturedStoryPattern,
  postCoverTransitionName,
} from '../../../design-system'
import { toPostSummary } from '../postSummary.presentation'
import { useResolvedCoverMedia } from '../../media/useResolvedCoverImage'
import { BlogArchiveSummary } from '../blog.types'

const COVER_SIZES = '(min-width: 801px) 50vw, 100vw'

interface FeaturedStoryProps {
  post: BlogArchiveSummary
  /** The enclosing section's eyebrow and heading, for label de-duplication. */
  sectionLabels?: readonly string[]
}

const FeaturedStory = ({ post, sectionLabels = [] }: FeaturedStoryProps) => {
  const coverMedia = useResolvedCoverMedia(post.featuredImage)
  const summary = toPostSummary(post, coverMedia, { coverSizes: COVER_SIZES })

  return (
    <FeaturedStoryPattern
      post={summary}
      sectionLabels={sectionLabels}
      titleAs="h3"
      actionLabel="Read the featured blog"
      coverTransitionName={postCoverTransitionName(summary.id) ?? undefined}
    />
  )
}

export default FeaturedStory
