/**
 * Home's Signature story - the single most prominent piece of writing on the
 * site.
 *
 * It is the design system's `SignatureStory`, which is a different editorial
 * object from the cards below it rather than a larger one: the feature radius,
 * the display type ramp, a wide plate and a real call to action.
 *
 * The post is required. This component used to render a card full of standing
 * copy - a made-up title, a made-up byline and a sentence about "a calmer
 * rhythm" - whenever there was nothing to show. A site with no published
 * writing has no Signature, and Home now says so in its own empty state
 * instead of inventing one here.
 */

import { SignatureStory, postCoverTransitionName } from '../../../design-system'
import type { BlogPostSummary } from '../../../core'
import { toPostSummary } from '../../blog/postSummary.presentation'
import { useResolvedCoverMedia } from '../../media/useResolvedCoverImage'

const COVER_SIZES = '(min-width: 1001px) 55vw, 100vw'

interface HeroArchivePreviewProps {
  post: BlogPostSummary
  /** The enclosing section's own words, for label de-duplication. */
  sectionLabels?: readonly string[]
}

const HeroArchivePreview = ({ post, sectionLabels = [] }: HeroArchivePreviewProps) => {
  const coverMedia = useResolvedCoverMedia(post.featuredImage)
  const summary = toPostSummary(post, coverMedia, { coverSizes: COVER_SIZES })

  return (
    <SignatureStory
      post={summary}
      sectionLabels={sectionLabels}
      titleAs="h2"
      coverTransitionName={postCoverTransitionName(summary.id) ?? undefined}
    />
  )
}

export default HeroArchivePreview
