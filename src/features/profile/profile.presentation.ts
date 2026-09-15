/**
 * The profile feature's map from an owner's blog record to the design system's
 * post contract.
 *
 * The same job `postSummary.presentation.ts` does for the public blog, and it
 * exists separately for one reason: an owner's list is not a public list. The
 * destination is the owner's own read-only route rather than the public
 * permalink, the author is never shown (it is always the person reading), and a
 * draft has no publication date at all.
 *
 * Pure on purpose. Cover resolution is a hook, so the resolved media arrives as
 * an argument, which keeps every decision here testable without a DOM.
 */

import type { PostSummary, StatusTone } from '../../design-system'
import { postCoverFrom } from '../blog/postSummary.presentation'
import type { ResolvedMediaSource } from '../media/media.api'
import type { ProfileBlogPost, ScheduleDisplayState } from './profile.types'

/**
 * The owner's route to one of their own blogs.
 *
 * Not the public permalink. A draft has no public URL, and a scheduled post's
 * public URL does not resolve until the worker publishes it, so linking a row
 * to `/blog/:id` would hand the author a 404 for two of the three tabs.
 */
export function toOwnerPostPath(username: string, blogId: string): string {
  return `/profile/${username}/blog/${blogId}`
}

/**
 * The eyebrow above an owner's card.
 *
 * Only `published` means live. Everything else - draft, scheduled, anything the
 * backend adds later - is a draft, which is what `schedule-display.utils.ts`
 * already encodes: a scheduled publication is a draft with a timestamp on it.
 */
export function ownerPostLabel(status: string): string {
  return status === 'published' ? 'Published' : 'Draft'
}

/**
 * One owner blog as the post patterns need it.
 *
 * Two facts are allowed to be absent rather than guessed. There is no reading
 * estimate on this endpoint, so no reading time is claimed; and the two
 * sentences the legacy grid printed under every title - "Live on the blog and
 * ready to revisit", "Still being shaped before publication" - were written
 * copy standing in for an excerpt, so they are gone. The post's own subtitle is
 * the excerpt when there is one, and there is none when there is not.
 */
export function toOwnerPostSummary(
  blog: ProfileBlogPost,
  media: ResolvedMediaSource | undefined,
  username: string,
  coverSizes?: string,
): PostSummary {
  const excerpt = (blog.subtitle ?? '').trim()

  return {
    id: blog.id,
    href: toOwnerPostPath(username, blog.id),
    title: blog.title,
    excerpt: excerpt.length > 0 ? excerpt : null,
    cover: postCoverFrom(media, blog.title, coverSizes),
    tags: [],
    metadata: {
      // Always the person reading the page. Naming them on their own cards is
      // noise a screen reader has to hear once per card.
      author: null,
      /*
       * `publishedAt` only when the server has one. `PostMetadata` falls back
       * to `updatedAt` and says so, which is the truth for a draft - where the
       * legacy grid printed `createdAt` under every card and called it a date.
       */
      publishedAt: blog.publishedAt ?? null,
      updatedAt: blog.updatedAt,
      readingMinutes: null,
      series: null,
    },
  }
}

export interface ScheduleStatusPresentation {
  readonly label: string
  readonly tone: StatusTone
}

/**
 * The scheduled row's status, in words and in a tone.
 *
 * `getScheduleDisplayState` decides which of the three it is; this only says
 * how it is painted and what it is called. None of the three words claims the
 * post is readable: "Publishing" is the grace window in which the worker is
 * expected to act, not a report that it has.
 */
export function scheduleStatusPresentation(
  state: ScheduleDisplayState,
): ScheduleStatusPresentation {
  switch (state) {
    case 'scheduled':
      return { label: 'Scheduled', tone: 'neutral' }
    case 'publishing':
      return { label: 'Publishing', tone: 'warning' }
    default:
      return { label: 'Needs attention', tone: 'danger' }
  }
}
