import { describe, expect, it } from 'vitest'

import {
  idleShareState,
  reactionButtonState,
  reactionUnavailableNotice,
  shareAnnouncement,
  shareHref,
  shareLiveRegion,
  shareReducer,
  shareTargets,
} from './reaction.logic'

describe('reactionButtonState', () => {
  const base = { count: 24, viewerHasReacted: false, canReact: true }

  it('says both the action and the count in its accessible name', () => {
    expect(reactionButtonState(base)['aria-label']).toBe('React to this blog, 24 reactions so far')
  })

  it('changes the verb once the reader has reacted', () => {
    expect(reactionButtonState({ ...base, viewerHasReacted: true })['aria-label']).toContain(
      'Remove your reaction',
    )
  })

  it('reports the toggle state through aria-pressed', () => {
    expect(reactionButtonState(base)['aria-pressed']).toBe(false)
    expect(reactionButtonState({ ...base, viewerHasReacted: true })['aria-pressed']).toBe(true)
  })

  it('never says "1 reactions"', () => {
    expect(reactionButtonState({ ...base, count: 1 })['aria-label']).toContain('1 reaction so far')
  })

  it('keeps the count visible to a reader who cannot react', () => {
    const state = reactionButtonState({ ...base, canReact: false })

    expect(state.isDisabled).toBe(true)
    expect(state.countLabel).toBe('24')
  })

  it('survives a nonsense count from the wire', () => {
    expect(reactionButtonState({ ...base, count: -3 }).countLabel).toBe('0')
    expect(reactionButtonState({ ...base, count: Number.NaN }).countLabel).toBe('0')
  })

  it('fills the glyph only when the reader has reacted', () => {
    expect(reactionButtonState(base).isFilled).toBe(false)
    expect(reactionButtonState({ ...base, viewerHasReacted: true }).isFilled).toBe(true)
  })
})

describe('reactionUnavailableNotice', () => {
  it('tells a signed-out reader what would let them react', () => {
    expect(reactionUnavailableNotice(false)).toContain('Sign in')
  })

  it('does not tell a signed-in reader to sign in', () => {
    expect(reactionUnavailableNotice(true)).not.toContain('Sign in')
  })
})

describe('shareTargets', () => {
  it('offers the four methods the API already accepts', () => {
    expect(shareTargets().map((target) => target.method)).toEqual([
      'facebook',
      'x',
      'linkedin',
      'copy_link',
    ])
  })

  it('marks exactly one target as acting on this page', () => {
    expect(shareTargets().filter((target) => target.isLocal)).toHaveLength(1)
  })

  it('names each destination, so no target is a bare icon', () => {
    for (const target of shareTargets()) {
      expect(target.label.length).toBeGreaterThan(0)
    }
  })
})

describe('shareHref', () => {
  const url = 'https://example.invalid/blog/1?a=b&c=d'
  const title = 'Sample & sample'

  it('gives every remote target a real destination', () => {
    for (const method of ['facebook', 'x', 'linkedin'] as const) {
      expect(shareHref(method, url, title)).toMatch(/^https:\/\//)
    }
  })

  it('encodes the url once, so an ampersand cannot truncate the share', () => {
    expect(shareHref('facebook', url, title)).toContain(encodeURIComponent(url))
    expect(shareHref('facebook', url, title)).not.toContain('?a=b&c=d')
  })

  it('encodes the title too', () => {
    expect(shareHref('x', url, title)).toContain(encodeURIComponent(title))
  })

  it('has no href for the local target', () => {
    expect(shareHref('copy_link', url, title)).toBeNull()
  })
})

describe('share state', () => {
  it('runs the same three-state machine as copying code', () => {
    const copying = shareReducer(idleShareState, { type: 'copy' })

    expect(copying.status).toBe('copying')
    expect(shareReducer(copying, { type: 'succeeded' }).status).toBe('copied')
    expect(shareReducer(copying, { type: 'failed' }).status).toBe('failed')
  })

  it('announces the outcome, and says what to do instead on a failure', () => {
    expect(shareAnnouncement('idle')).toBeNull()
    expect(shareAnnouncement('copied')).toContain('clipboard')
    expect(shareAnnouncement('failed')).toContain('address bar')
  })

  it('interrupts for a failure and stays polite for a success', () => {
    expect(shareLiveRegion('failed').role).toBe('alert')
    expect(shareLiveRegion('copied').role).toBe('status')
  })
})
