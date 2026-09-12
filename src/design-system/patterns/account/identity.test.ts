import { describe, expect, it } from 'vitest'

import {
  avatarEditorState,
  avatarInitials,
  avatarRejection,
  bioPlaceholder,
  contactCardAction,
  contactHref,
  cvPrintStyle,
  profileHeaderState,
  readableLinkText,
} from './identity.logic'

describe('profile header state', () => {
  it('is loading until a profile arrives', () => {
    expect(profileHeaderState({ isLoading: true }).status).toBe('loading')
    expect(profileHeaderState({ hasProfile: false }).status).toBe('loading')
  })

  it('is ready when the profile has a biography', () => {
    const state = profileHeaderState({ hasProfile: true, hasBio: true })

    expect(state.status).toBe('ready')
    expect(state.usesBioPlaceholder).toBe(false)
  })

  it('treats a missing biography as empty, not as a failure', () => {
    const state = profileHeaderState({ hasProfile: true, hasBio: false })

    expect(state.status).toBe('empty')
    expect(state.showsIdentity).toBe(true)
    expect(state.usesBioPlaceholder).toBe(true)
  })

  it('prefers denial over "not found", because the client cannot tell them apart', () => {
    const state = profileHeaderState({
      deniedAction: 'view this profile',
      isMissing: true,
      hasProfile: true,
    })

    expect(state.status).toBe('denied')
    expect(state.showsIdentity).toBe(false)
  })

  it('reports missing when the feature actually looked and found nothing', () => {
    expect(profileHeaderState({ isMissing: true, hasProfile: true }).status).toBe('missing')
  })

  it('hides the owner action slot whenever the identity itself is hidden', () => {
    for (const state of [
      profileHeaderState({ deniedAction: 'edit this profile' }),
      profileHeaderState({ isMissing: true }),
      profileHeaderState({ isLoading: true }),
    ]) {
      expect(state.showsOwnerActions).toBe(false)
    }
  })

  it('describes the surface rather than inventing a personality', () => {
    expect(bioPlaceholder()).toBe('This profile has no biography yet.')
    expect(bioPlaceholder()).not.toMatch(/\bI\b|\bmy\b/)
  })
})

describe('avatar initials', () => {
  it('takes the first and last word, not the first two', () => {
    expect(avatarInitials('Nguyen Van An')).toBe('NA')
  })

  it('handles a single word', () => {
    expect(avatarInitials('Prince')).toBe('P')
  })

  it('handles non-ASCII names by code point, not by byte', () => {
    expect(avatarInitials('Đặng Thị Hằng')).toBe('ĐH')
  })

  it('returns nothing for a blank name, so the icon is used instead', () => {
    expect(avatarInitials('   ')).toBe('')
  })

  it('ignores runs of whitespace', () => {
    expect(avatarInitials('  Ada    Lovelace  ')).toBe('AL')
  })
})

describe('avatar editor state', () => {
  it('is empty with no source', () => {
    const state = avatarEditorState({})

    expect(state.status).toBe('empty')
    expect(state.showsFallback).toBe(true)
  })

  it('is ready with a source that loaded', () => {
    expect(avatarEditorState({ hasSource: true }).status).toBe('ready')
  })

  it('puts the upload above every question the old picture raised', () => {
    const state = avatarEditorState({
      hasSource: true,
      isUploading: true,
      uploadError: 'Too large.',
      imageFailed: true,
    })

    expect(state.status).toBe('uploading')
    expect(state.canChoose).toBe(false)
  })

  it('falls back to initials when the browser could not render the source', () => {
    const state = avatarEditorState({ hasSource: true, imageFailed: true })

    expect(state.status).toBe('imageFailed')
    expect(state.showsImage).toBe(false)
    expect(state.showsFallback).toBe(true)
  })

  it('offers a reload for a broken image and not for a rejected file', () => {
    expect(avatarEditorState({ hasSource: true, imageFailed: true }).canRetry).toBe(true)
    expect(avatarEditorState({ uploadError: 'That file is not an image.' }).canRetry).toBe(false)
  })

  it('stops the file picker when the whole editor is disabled', () => {
    expect(avatarEditorState({ isDisabled: true }).canChoose).toBe(false)
  })
})

describe('avatar rejection', () => {
  const limits = { allowedTypes: ['image/jpeg', 'image/png'], maxBytes: 5 * 1024 * 1024 }

  it('accepts a file inside both limits', () => {
    expect(avatarRejection({ mimeType: 'image/png', bytes: 1024 }, limits)).toBeNull()
  })

  it('names the formats that would work', () => {
    const message = avatarRejection({ mimeType: 'image/gif', bytes: 1024 }, limits)

    expect(message).toContain('JPEG')
    expect(message).toContain('PNG')
  })

  it('states the size limit the caller supplied rather than a baked-in one', () => {
    const message = avatarRejection(
      { mimeType: 'image/png', bytes: 3 * 1024 * 1024 },
      { ...limits, maxBytes: 2 * 1024 * 1024 },
    )

    expect(message).toContain('2MB')
  })

  it('accepts a file exactly on the limit', () => {
    expect(avatarRejection({ mimeType: 'image/png', bytes: limits.maxBytes }, limits)).toBeNull()
  })

  it('reports the type before the size, because the type is the harder fix', () => {
    const message = avatarRejection({ mimeType: 'application/pdf', bytes: 99e6 }, limits)

    expect(message).toContain('not an image')
  })
})

describe('contact destinations', () => {
  it('builds a mailto for an address', () => {
    expect(contactHref('email', 'sample@example.com').href).toBe('mailto:sample@example.com')
  })

  it('strips formatting out of a telephone number', () => {
    expect(contactHref('phone', '+84 90 123 45 67').href).toBe('tel:+84901234567')
  })

  it('keeps every digit, including a parenthesised trunk prefix', () => {
    // Dropping the `0` would be a telephony assumption, and the wrong one in
    // several dialling plans. Punctuation goes; digits are the owner's.
    expect(contactHref('phone', '+84 (0) 90 123 4567').href).toBe('tel:+840901234567')
  })

  it('gives a location no destination at all', () => {
    expect(contactHref('location', 'Sample City').href).toBeUndefined()
  })

  it('marks an absolute URL as leaving the site', () => {
    expect(contactHref('link', 'https://example.com/profile').leavesSite).toBe(true)
  })

  it('does not treat a mail client as leaving the site', () => {
    expect(contactHref('email', 'sample@example.com').leavesSite).toBe(false)
  })

  it('returns nothing for a blank value rather than an empty mailto', () => {
    expect(contactHref('email', '   ').href).toBeUndefined()
  })
})

describe('the action a contact card offers', () => {
  it('builds a mailto for an email channel', () => {
    expect(
      contactCardAction({
        channel: 'email',
        value: 'sample.author@example.com',
        label: 'Email directly',
      }),
    ).toEqual({
      href: 'mailto:sample.author@example.com',
      label: 'Email directly',
      leavesSite: false,
    })
  })

  it('builds a tel for a phone channel, with the spacing stripped out', () => {
    expect(
      contactCardAction({ channel: 'phone', value: '+84 90 123 45 67', label: 'Call' }),
    ).toEqual({
      href: 'tel:+84901234567',
      label: 'Call',
      leavesSite: false,
    })
  })

  it('offers no action for a postal address, however it is labelled', () => {
    expect(
      contactCardAction({
        channel: 'location',
        value: 'Sample City, Example Country',
        label: 'Open the map',
      }),
    ).toBeNull()
  })

  it('keeps an absolute profile link as it is, and marks that it leaves the site', () => {
    expect(
      contactCardAction({
        channel: 'link',
        value: 'https://example.com/sample-author',
        label: 'Open the profile',
      }),
    ).toEqual({
      href: 'https://example.com/sample-author',
      label: 'Open the profile',
      leavesSite: true,
    })
  })

  it('does not treat an in-site path as leaving the site', () => {
    expect(contactCardAction({ channel: 'link', value: '/cv', label: 'View CV' })?.leavesSite).toBe(
      false,
    )
  })

  it('offers no action for a blank value', () => {
    expect(
      contactCardAction({ channel: 'email', value: '   ', label: 'Email directly' }),
    ).toBeNull()
  })

  it('offers no action when the page named no verb for it', () => {
    expect(contactCardAction({ channel: 'phone', value: '+84 90 123 45 67' })).toBeNull()
    expect(
      contactCardAction({ channel: 'phone', value: '+84 90 123 45 67', label: ' ' }),
    ).toBeNull()
  })
})

describe('CV print behaviour', () => {
  it('writes the destination out, so a printed link is usable', () => {
    expect(readableLinkText('https://example.com/sample-account/sample-project')).toBe(
      'example.com/sample-account/sample-project',
    )
  })

  it('drops the scheme and the trailing slash', () => {
    expect(readableLinkText('https://example.com/')).toBe('example.com')
  })

  it('decodes an escaped path, because %C3%A0 is not readable on paper', () => {
    expect(readableLinkText('https://example.com/b%C3%A0i-vi%E1%BA%BFt')).toBe(
      'example.com/bài-viết',
    )
  })

  it('degrades to the raw value when the href is not a URL', () => {
    expect(readableLinkText('example.com/sample')).toBe('example.com/sample')
  })

  it('keeps an entry on one sheet of paper', () => {
    expect(cvPrintStyle().breakInside).toBe('avoid')
  })

  it('gives up the surface, because a printer discards backgrounds', () => {
    const style = cvPrintStyle()

    expect(style.background).toBe('transparent')
    expect(style.boxShadow).toBe('none')
  })
})
