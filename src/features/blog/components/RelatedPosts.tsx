/**
 * What to read next, under the article.
 *
 * The design system's `PostRow` - the same row the Series part list and the
 * author archive use, so a related blog and a Series part are recognisably the
 * same kind of thing. Cover resolution is a hook, so each row is its own
 * component; the mapping from a blog record to the post contract is
 * `toPostSummary`, shared with the archive.
 *
 * These used to be a 280px sticky rail beside the article. `ReaderFrame` puts
 * the related region in the reading column after the discussion, which is what
 * makes the excerpt worth showing at last: the rail was too narrow for it and
 * hid it above 1280px.
 *
 * The hand-written `LinkBox`, its `translateY(-1px)` hover and its
 * "Fresh thoughts are on the way." filler excerpt are gone: hover depth belongs
 * to the pattern, and an invented excerpt is content the site never wrote.
 */

import { Heading, PostRow, Stack, hierarchyContext } from '../../../design-system'
import { useResolvedCoverMedia } from '../../media/useResolvedCoverImage'
import { toPostSummary } from '../postSummary.presentation'
import { BlogArchiveSummary } from '../blog.types'

/** `PostRow`'s own thumbnail track: 88px below `sm`, 144px above it. */
const COVER_SIZES = '(min-width: 480px) 144px, 88px'
const HEADING = 'More like this'

interface RelatedPostsProps {
  posts: BlogArchiveSummary[]
}

const RelatedPostRow = ({
  post,
  sectionLabels,
}: {
  post: BlogArchiveSummary
  sectionLabels: readonly string[]
}) => {
  const coverMedia = useResolvedCoverMedia(post.featuredImage)
  const summary = toPostSummary(post, coverMedia, { coverSizes: COVER_SIZES })

  return <PostRow post={summary} sectionLabels={sectionLabels} titleAs="h3" />
}

const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  if (posts.length === 0) {
    return null
  }

  const sectionLabels = hierarchyContext(HEADING)

  return (
    <Stack as="section" gap={4} aria-labelledby="related-posts-heading">
      <Heading id="related-posts-heading" as="h2" recipe="cardTitle">
        {HEADING}
      </Heading>

      <Stack as="ul" gap={2} listStyleType="none" margin={0} padding={0}>
        {posts.map((post) => (
          <li key={post.id}>
            <RelatedPostRow post={post} sectionLabels={sectionLabels} />
          </li>
        ))}
      </Stack>
    </Stack>
  )
}

export default RelatedPosts
