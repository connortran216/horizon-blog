/**
 * What the migrated profile header emits.
 *
 * The claims worth protecting are the ones the recomposition could have moved
 * without anyone noticing: that "Write a blog" is still decided by
 * `can(profile.authorization, 'content:manage:own')` and by nothing else, that
 * the file input is in the accessibility tree with a name rather than
 * `display: none`, and that a failed upload is on the page rather than in a
 * toast that has already gone.
 *
 * Static markup proves what was emitted. Whether focus lands on the file input,
 * and what a screen reader says when it does, stay manual - see the Testing
 * section of `src/design-system/CONVENTIONS.md`.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import type { UserProfile } from '../../../core/types/profile.types'
import ProfileHeaderCard from './ProfileHeaderCard'

const profile: UserProfile = {
  id: 1,
  name: 'Trần Tuấn Cảnh',
  email: 'author@example.com',
  bio: 'Viết về kỹ thuật dữ liệu và những hệ thống chạy suốt đêm.',
  website: 'https://example.com',
  location: 'Vietnam',
  avatarUrl: 'https://media.example/avatar.jpg',
  authorization: { role: 'author', permissions: ['content:manage:own'] },
}

function render(overrides: Partial<Parameters<typeof ProfileHeaderCard>[0]> = {}): string {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter>
        <ProfileHeaderCard
          profile={profile}
          profileName={profile.name}
          avatarSrc={profile.avatarUrl}
          profileLoading={false}
          isUploadingAvatar={false}
          articleCount={4}
          draftCount={2}
          onOpenProfileEditor={vi.fn()}
          onOpenAvatarPreview={vi.fn()}
          onSelectAvatarFile={vi.fn()}
          {...overrides}
        />
      </MemoryRouter>
    </ChakraProvider>,
  )
}

describe('the author workspace header', () => {
  const markup = render()

  it('offers the write control only to a profile the server says may write', () => {
    expect(markup).toContain('Write a blog')

    const member = render({
      profile: { ...profile, authorization: { role: 'member', permissions: [] } },
    })

    expect(member).not.toContain('Write a blog')
    // Editing your own profile is not the same permission and is not gated on it.
    expect(member).toContain('Edit profile')
  })

  it('keeps the file input in the accessibility tree with a name of its own', () => {
    expect(markup).toContain('type="file"')
    expect(markup).toContain('aria-label="Choose a new profile picture for Trần Tuấn Cảnh"')
    expect(markup).toContain('accept="image/jpeg,image/png"')
  })

  it('states the two counts as term and description rather than as loose text', () => {
    expect(markup).toContain('<dt')
    expect(markup).toContain('<dd')
    expect(markup).toContain('Blogs')
    expect(markup).toContain('Drafts')
  })

  it('puts a failed upload on the page, where it stays', () => {
    const failed = render({ avatarUploadError: 'Max 5MB' })

    expect(failed).toContain('Max 5MB')
    expect(failed).toContain('role="alert"')
  })

  it('says the upload is in flight instead of leaving the control looking idle', () => {
    expect(render({ isUploadingAvatar: true })).toContain('Uploading your new profile picture')
  })

  it('cannot open the full-size view when there is no picture to open', () => {
    const withoutAvatar = render({ avatarSrc: undefined })

    expect(withoutAvatar).toMatch(/<button[^>]*disabled[^>]*>View full size<\/button>/)
  })

  it('names the profile while it is still loading rather than showing a bare spinner', () => {
    expect(render({ profileLoading: true })).toContain('the profile')
  })
})
