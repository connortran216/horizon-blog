/**
 * The author archive's map onto the design system's post contract.
 *
 * The archive is served full post records rather than summaries, so the excerpt
 * has to be derived from the markdown and there is no cover field at all. Both
 * of those are decisions, not details, and they live here so the page can stay
 * composition.
 */

import { buildExcerptFromMarkdown, toPublicPostPath } from '../../core'
import type { PostSummary } from '../../design-system'
import type { BlogArchivePost } from '../blog/blog.types'
import type { AuthorArchiveUser } from './authors.types'

/** Excerpt length the archive list clamps to before the row does. */
const EXCERPT_LENGTH = 180

/**
 * The first paragraph of the post, or `null`.
 *
 * `buildExcerptFromMarkdown` takes a fallback string and the shared helper in
 * `blog.utils` passes "Fresh thoughts are on the way." An empty post has not
 * promised anything, so the fallback here is empty and the row simply shows no
 * excerpt - `DESIGN.md` forbids invented content, and a sentence nobody wrote
 * is invented content.
 */
export function authorPostExcerpt(post: Pick<BlogArchivePost, 'content_markdown'>): string | null {
  const excerpt = buildExcerptFromMarkdown(post.content_markdown ?? '', EXCERPT_LENGTH, '').trim()

  return excerpt.length > 0 ? excerpt : null
}

/**
 * One archived post as a row.
 *
 * The author is dropped: the page is that author's archive and their name is in
 * the heading beside the list, so repeating it on every row spends a line of
 * metadata saying something the reader already knows.
 *
 * The date is the update date, which is what this list has always shown - a
 * record with no `published_at` is still a post the reader can open, and the
 * design system labels an update date as one rather than passing it off as a
 * publication date.
 */
export function toAuthorPostSummary(post: BlogArchivePost): PostSummary {
  return {
    id: String(post.id),
    href: toPublicPostPath(post.id),
    title: post.title,
    excerpt: authorPostExcerpt(post),
    cover: null,
    tags: (post.tags ?? []).map((tag) => tag.name),
    metadata: {
      author: null,
      publishedAt: post.published_at ?? null,
      updatedAt: post.updated_at,
    },
  }
}

export interface AuthorArchiveFact {
  readonly kind: 'posts' | 'role'
  readonly label: string
}

/**
 * The facts under an author's name.
 *
 * The published count is omitted entirely while the list is loading or has
 * failed, rather than shown as "..." - an ellipsis where a number belongs reads
 * as a number the page is hiding, and a count that turns out to be wrong is
 * worse than a count that arrives a moment later.
 *
 * There are no follower or following counts. This page used to print "18.2k
 * followers" and "760 following" from two constants in its own source; Horizon
 * has no following feature, so those were not slow data, they were fiction.
 */
export function authorArchiveFacts(totalPosts: number | null): AuthorArchiveFact[] {
  const facts: AuthorArchiveFact[] = [{ kind: 'role', label: 'Public writer on Horizon' }]

  if (totalPosts !== null && Number.isFinite(totalPosts) && totalPosts >= 0) {
    facts.push({
      kind: 'posts',
      label: `${new Intl.NumberFormat('en-US').format(totalPosts)} ${
        totalPosts === 1 ? 'published blog' : 'published blogs'
      }`,
    })
  }

  return facts
}

/** The author, as the design system's identity contract sees them. */
export function toAuthorIdentity(author: AuthorArchiveUser) {
  return { name: author.name, avatarUrl: author.avatar_url ?? null }
}
