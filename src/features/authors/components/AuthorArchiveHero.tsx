/**
 * Who an author is, beside their archive.
 *
 * The design system's `ProfileHeader`: portrait, name, biography and the counts
 * that describe the writing underneath. The public archive and the owner's own
 * profile are the same identity block wearing a different eyebrow, so they are
 * one pattern rather than two hand-drawn cards that drift apart.
 *
 * The follower and following counts are gone. They were two constants in this
 * file - "18.2k" and "760" - printed as if they were data; Horizon has no
 * following feature, so they were not slow numbers, they were fiction, and
 * `DESIGN.md` forbids invented content.
 */

import { FiArrowRight } from 'react-icons/fi'

import { ActionLink, ProfileHeader, type ProfileStat } from '../../../design-system'
import { authorArchiveFacts, toAuthorIdentity } from '../authorArchive.presentation'
import { AuthorArchiveUser } from '../authors.types'

interface AuthorArchiveHeroProps {
  author: AuthorArchiveUser
  /** `null` while the post list is loading or has failed; the count is then omitted. */
  totalPosts: number | null
}

const AuthorArchiveHero = ({ author, totalPosts }: AuthorArchiveHeroProps) => {
  /*
   * The count is omitted entirely until it is known rather than shown as "...".
   * An ellipsis where a number belongs reads as a number the page is hiding.
   */
  const published = authorArchiveFacts(totalPosts).find((fact) => fact.kind === 'posts')
  const stats: ProfileStat[] | undefined = published
    ? [{ label: 'Published', value: published.label }]
    : undefined

  return (
    <ProfileHeader
      profile={{
        name: author.name,
        avatarUrl: toAuthorIdentity(author).avatarUrl,
        bio: author.bio?.trim() || undefined,
      }}
      eyebrow="Author"
      stats={stats}
      actions={
        <ActionLink
          to="/blog"
          underline="hover"
          iconEnd={<FiArrowRight aria-hidden="true" />}
          color="action.primary"
          fontWeight="semibold"
        >
          Browse all blogs
        </ActionLink>
      }
    />
  )
}

export default AuthorArchiveHero
