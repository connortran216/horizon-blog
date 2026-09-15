/**
 * One blog in an author's archive.
 *
 * The design system's `PostRow`: the dense listing form, separated from its
 * siblings by a rule rather than boxed. It shows no thumbnail because the
 * author archive is served full post records and those carry no cover field -
 * a row of placeholder plates would be furniture standing in for data that does
 * not exist.
 */

import { PostRow } from '../../../design-system'
import { toAuthorPostSummary } from '../authorArchive.presentation'
import { BlogArchivePost } from '../../blog/blog.types'

interface AuthorArchiveStoryListItemProps {
  post: BlogArchivePost
}

const AuthorArchiveStoryListItem = ({ post }: AuthorArchiveStoryListItemProps) => (
  <PostRow post={toAuthorPostSummary(post)} showCover={false} titleAs="h3" />
)

export default AuthorArchiveStoryListItem
