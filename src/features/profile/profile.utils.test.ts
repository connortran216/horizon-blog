import { describe, expect, it } from 'vitest'
import { BlogPostSummary } from '../../core/types/blog.types'
import { mapBlogSummaryToProfilePost } from './profile.utils'

describe('profile post mapping', () => {
  it('preserves owner publication timestamps for schedule management', () => {
    const summary: BlogPostSummary = {
      id: '91',
      title: 'Scheduled article',
      excerpt: 'A scheduled draft.',
      author: { id: 1, username: 'Owner' },
      createdAt: '2026-08-20T08:00:00Z',
      updatedAt: '2026-08-21T09:00:00Z',
      readingTime: 2,
      tags: [],
      status: 'draft',
      slug: '91',
      scheduledPublishAt: '2026-08-28T02:00:00Z',
      publishedAt: null,
    }

    expect(mapBlogSummaryToProfilePost(summary)).toMatchObject({
      id: '91',
      updatedAt: '2026-08-21T09:00:00Z',
      scheduledPublishAt: '2026-08-28T02:00:00Z',
      publishedAt: null,
    })
  })
})
