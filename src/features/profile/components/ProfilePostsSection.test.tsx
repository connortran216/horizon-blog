/**
 * What the migrated author workspace emits.
 *
 * The original claim - mutually exclusive counts, and a scheduled row that can
 * be managed - is kept and extended, because the recomposition is exactly where
 * a count or a schedule state could quietly change meaning.
 *
 * Two assertions are new and are the point of this release. A scheduled
 * publication is a draft with a timestamp, so nothing on the scheduled tab may
 * read as published; and the owner's cards link to the owner's own read-only
 * route, never to the public permalink, which for a draft does not exist.
 *
 * A `MemoryRouter` is needed now: `PostCard` links through React Router, where
 * the legacy grid used a `Box as={RouterLink}` that server-rendered the same way
 * but was not reachable from a static render without a router either.
 *
 * Rendered under `horizonTheme` - the theme production mounts since M1.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import type { ProfileBlogPost } from '../profile.types'
import ProfilePostsSection from './ProfilePostsSection'

const scheduled: ProfileBlogPost = {
  id: '91',
  title: 'Scheduled article',
  createdAt: '2026-08-20T08:00:00Z',
  updatedAt: '2026-08-21T09:00:00Z',
  scheduledPublishAt: '2026-08-27T01:50:00Z',
  status: 'draft',
}

const published: ProfileBlogPost = {
  id: '12',
  title: 'Một bài viết rất dài bằng tiếng Việt',
  subtitle: 'The subtitle the API really returned.',
  createdAt: '2026-07-01T08:00:00Z',
  updatedAt: '2026-07-02T08:00:00Z',
  publishedAt: '2026-07-01T09:00:00Z',
  status: 'published',
}

function render(options: { publishedBlogs?: ProfileBlogPost[]; postsLoading?: boolean } = {}) {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter>
        <ProfilePostsSection
          postsLoading={options.postsLoading ?? false}
          profileUsername="owner"
          publishedBlogs={options.publishedBlogs ?? []}
          scheduledBlogs={[scheduled]}
          draftBlogs={[]}
          publishedPagination={{ page: 1, limit: 9, total: 4 }}
          scheduledPagination={{ page: 1, limit: 9, total: 1 }}
          draftPagination={{ page: 1, limit: 9, total: 2 }}
          scheduleClock={new Date('2026-08-27T02:00:00Z')}
          onPublishedPageChange={vi.fn()}
          onScheduledPageChange={vi.fn()}
          onDraftPageChange={vi.fn()}
          onEdit={vi.fn()}
          onReschedule={vi.fn()}
          onPublishNow={vi.fn()}
          onCancelSchedule={vi.fn()}
          onDelete={vi.fn()}
        />
      </MemoryRouter>
    </ChakraProvider>,
  )
}

describe('ProfilePostsSection', () => {
  const markup = render()

  it('shows mutually exclusive owner counts and the scheduled management row', () => {
    expect(markup).toContain('Published (4)')
    expect(markup).toContain('Scheduled (1)')
    expect(markup).toContain('Drafts (2)')
    expect(markup).toContain('7 total blogs')
    expect(markup).toContain('Scheduled article')
    expect(markup).toContain('Needs attention')
    expect(markup).toContain('Manage')
  })

  it('never lets a scheduled publication read as live', () => {
    expect(markup).toContain('Every publication below is still a draft')
    expect(markup).toContain(
      'Still a draft. It becomes readable only once the server publishes it.',
    )
    expect(markup).not.toContain('Live on the blog')
  })

  it('says the schedule state in words, not only in a colour', () => {
    // `getScheduleDisplayState` puts this one past the five-minute grace window.
    expect(markup).toContain('Publication overdue')
  })

  it('offers a next action on every empty collection rather than a bare sentence', () => {
    expect(markup).toContain('No drafts yet')
    expect(markup).toContain('No published blogs yet')
  })

  it("links an owner's card to the owner's own route, never to a public permalink", () => {
    const withPost = render({ publishedBlogs: [published] })

    expect(withPost).toContain('href="/profile/owner/blog/12"')
    expect(withPost).not.toContain('href="/blog/12"')
  })

  it('shows the post its real subtitle instead of written-in filler', () => {
    const withPost = render({ publishedBlogs: [published] })

    expect(withPost).toContain('The subtitle the API really returned.')
    expect(withPost).not.toContain('Live on the blog and ready to revisit.')
    expect(withPost).not.toContain('Still being shaped before publication.')
  })

  it('names the loading state rather than showing a bare spinner', () => {
    expect(render({ postsLoading: true })).toContain('your blogs')
  })
})
