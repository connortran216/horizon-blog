import { describe, expect, it } from 'vitest'

import {
  ownerPostLabel,
  scheduleStatusPresentation,
  toOwnerPostPath,
  toOwnerPostSummary,
} from './profile.presentation'
import type { ProfileBlogPost } from './profile.types'

const blog = (overrides: Partial<ProfileBlogPost> = {}): ProfileBlogPost => ({
  id: '7',
  title: 'Chuỗi bài về kỹ thuật dữ liệu',
  createdAt: '2026-07-01T08:00:00Z',
  updatedAt: '2026-07-02T08:00:00Z',
  status: 'published',
  ...overrides,
})

describe('the owner route', () => {
  it('points at the owner view rather than the public permalink', () => {
    expect(toOwnerPostPath('owner', '7')).toBe('/profile/owner/blog/7')
  })
})

describe('the card label', () => {
  it('calls only a published post published', () => {
    expect(ownerPostLabel('published')).toBe('Published')
  })

  it('calls a scheduled post a draft, because that is what it is', () => {
    expect(ownerPostLabel('scheduled')).toBe('Draft')
    expect(ownerPostLabel('draft')).toBe('Draft')
  })
})

describe('an owner post as the post patterns need it', () => {
  it('carries no author, because it is always the person reading', () => {
    expect(toOwnerPostSummary(blog(), undefined, 'owner').metadata.author).toBeNull()
  })

  it('claims no reading time, because this endpoint does not report one', () => {
    expect(toOwnerPostSummary(blog(), undefined, 'owner').metadata.readingMinutes).toBeNull()
  })

  it('shows no excerpt rather than inventing one', () => {
    expect(toOwnerPostSummary(blog({ subtitle: '   ' }), undefined, 'owner').excerpt).toBeNull()
    expect(toOwnerPostSummary(blog(), undefined, 'owner').excerpt).toBeNull()
  })

  it('uses the subtitle the API returned when there is one', () => {
    expect(toOwnerPostSummary(blog({ subtitle: 'Real words' }), undefined, 'owner').excerpt).toBe(
      'Real words',
    )
  })

  it('reports no publication date for a draft, so the metadata falls back to the update', () => {
    const summary = toOwnerPostSummary(blog({ status: 'draft' }), undefined, 'owner')

    expect(summary.metadata.publishedAt).toBeNull()
    expect(summary.metadata.updatedAt).toBe('2026-07-02T08:00:00Z')
  })

  it('has no cover when the media never resolved', () => {
    expect(toOwnerPostSummary(blog(), undefined, 'owner').cover).toBeNull()
  })

  it('takes the widest resolved variant as a srcset candidate', () => {
    const summary = toOwnerPostSummary(
      blog(),
      {
        id: 'm1',
        url: 'https://media.example/cover.jpg',
        variants: [
          {
            url: 'https://media.example/cover-640.jpg',
            mimeType: 'image/jpeg',
            sizeBytes: 1024,
            width: 640,
            height: 360,
          },
          // No URL, so it cannot appear in a srcset: `0w` and an empty
          // candidate both make a browser discard the whole attribute.
          { url: '', mimeType: 'image/jpeg', sizeBytes: 2048, width: 1280, height: 720 },
        ],
      },
      'owner',
      '50vw',
    )

    expect(summary.cover?.sources).toEqual([
      { src: 'https://media.example/cover-640.jpg', width: 640 },
    ])
    expect(summary.cover?.alt).toBe(blog().title)
  })
})

describe('the scheduled status', () => {
  it('gives each state its own words', () => {
    expect(scheduleStatusPresentation('scheduled').label).toBe('Scheduled')
    expect(scheduleStatusPresentation('publishing').label).toBe('Publishing')
    expect(scheduleStatusPresentation('needs_attention').label).toBe('Needs attention')
  })

  it('gives each state its own tone, so none of the three is colour alone', () => {
    const tones = (['scheduled', 'publishing', 'needs_attention'] as const).map(
      (state) => scheduleStatusPresentation(state).tone,
    )

    expect(new Set(tones).size).toBe(3)
  })

  it('never calls a scheduled publication published', () => {
    const labels = (['scheduled', 'publishing', 'needs_attention'] as const).map(
      (state) => scheduleStatusPresentation(state).label,
    )

    expect(labels.some((label) => /publish(ed|)\b/i.test(label) && label !== 'Publishing')).toBe(
      false,
    )
  })
})
