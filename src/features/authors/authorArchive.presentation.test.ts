import { describe, expect, it } from 'vitest'

import { toPublicPostPath } from '../../core'
import type { BlogArchivePost } from '../blog/blog.types'
import {
  authorArchiveFacts,
  authorPostExcerpt,
  toAuthorIdentity,
  toAuthorPostSummary,
} from './authorArchive.presentation'

const post: BlogArchivePost = {
  id: 42,
  title: 'Indexes first',
  content_markdown: '# Indexes first\n\nStart with the read path.',
  content_json: '',
  status: 'published',
  user_id: 7,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-02T00:00:00Z',
  published_at: '2026-06-01T00:00:00Z',
  tags: [{ id: 1, name: 'database' }],
}

describe('authorPostExcerpt', () => {
  it('derives the excerpt from the markdown body', () => {
    expect(authorPostExcerpt(post)).toContain('Start with the read path.')
  })

  it('invents nothing for an empty post', () => {
    expect(authorPostExcerpt({ content_markdown: '' })).toBeNull()
    expect(authorPostExcerpt({ content_markdown: '   ' })).toBeNull()
  })
})

describe('toAuthorPostSummary', () => {
  it('maps the record onto a row that names no author', () => {
    const summary = toAuthorPostSummary(post)

    expect(summary.id).toBe('42')
    expect(summary.href).toBe(toPublicPostPath(42))
    expect(summary.title).toBe('Indexes first')
    expect(summary.cover).toBeNull()
    expect(summary.tags).toEqual(['database'])
    // The page is this author's archive; the row does not repeat their name.
    expect(summary.metadata.author).toBeNull()
    expect(summary.metadata.publishedAt).toBe('2026-06-01T00:00:00Z')
    expect(summary.metadata.updatedAt).toBe('2026-06-02T00:00:00Z')
  })

  it('falls back to the update date when the post was never published', () => {
    const summary = toAuthorPostSummary({ ...post, published_at: null })

    expect(summary.metadata.publishedAt).toBeNull()
    expect(summary.metadata.updatedAt).toBe('2026-06-02T00:00:00Z')
  })
})

describe('authorArchiveFacts', () => {
  it('omits the count entirely until it is known', () => {
    expect(authorArchiveFacts(null)).toEqual([{ kind: 'role', label: 'Public writer on Horizon' }])
  })

  it('pluralises the published count', () => {
    expect(authorArchiveFacts(1)[1].label).toBe('1 published blog')
    expect(authorArchiveFacts(12)[1].label).toBe('12 published blogs')
    expect(authorArchiveFacts(1200)[1].label).toBe('1,200 published blogs')
  })

  it('states zero rather than hiding it', () => {
    expect(authorArchiveFacts(0)[1].label).toBe('0 published blogs')
  })

  it('invents no follower or following counts', () => {
    expect(authorArchiveFacts(12).map((fact) => fact.kind)).toEqual(['role', 'posts'])
  })
})

describe('toAuthorIdentity', () => {
  it('carries the picture when there is one, and null when there is not', () => {
    expect(toAuthorIdentity({ id: 7, name: 'Connor Tran', avatar_url: 'https://x/a.png' })).toEqual(
      {
        name: 'Connor Tran',
        avatarUrl: 'https://x/a.png',
      },
    )
    expect(toAuthorIdentity({ id: 7, name: 'Connor Tran' })).toEqual({
      name: 'Connor Tran',
      avatarUrl: null,
    })
  })
})
