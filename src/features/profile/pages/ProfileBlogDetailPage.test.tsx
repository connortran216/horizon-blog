/**
 * An author reading their own draft.
 *
 * The draft marker used to be a yellow Chakra `Badge` - colour and nothing
 * else. It is a `StatusBadge` now, which is required to carry an icon and words
 * as well as a hue, so "draft" survives greyscale and a reader who cannot
 * separate two tones.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import theme from '../../../theme/horizon'
import ProfileBlogDetailPage from './ProfileBlogDetailPage'

const state = vi.hoisted(() => ({
  post: {
    id: 76,
    title: 'An unpublished draft',
    content_markdown: 'Draft body',
    content_json: '',
    status: 'draft',
    user_id: 1,
    created_at: '2026-06-06T00:00:00Z',
    updated_at: '2026-06-06T00:00:00Z',
    owner: { id: 1, name: 'Horizon Author' },
  } as unknown,
  loading: false,
}))

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, username: 'author' } }),
}))

vi.mock('../useOwnerBlogPostDetail', () => ({
  useOwnerBlogPostDetail: () => ({ post: state.post, loading: state.loading }),
}))

vi.mock('../../media/useResolvedMarkdown', () => ({
  useResolvedMarkdownMedia: () => ({ content: 'Draft body', sources: {} }),
}))

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={['/profile/author/blog/76']}>
      <ChakraProvider theme={theme}>
        <Routes>
          <Route path="/profile/:username/blog/:id" element={<ProfileBlogDetailPage />} />
        </Routes>
      </ChakraProvider>
    </MemoryRouter>,
  )

describe('ProfileBlogDetailPage', () => {
  beforeEach(() => {
    state.loading = false
  })

  it('marks a draft in words, not only in colour, and says the view is read-only', () => {
    const markup = render()

    expect(markup).toContain('An unpublished draft')
    expect(markup).toContain('Draft')
    expect(markup).toContain('This is a read-only view.')
  })

  it('shows a missing blog as missing rather than as a blank reading column', () => {
    state.post = null

    expect(render()).toContain('We could not find this blog.')
  })
})
