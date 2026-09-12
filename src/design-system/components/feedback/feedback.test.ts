import { describe, expect, it } from 'vitest'

import { componentTokens, space } from '../../../theme/tokens'
import {
  emptyMessage,
  failureMessage,
  feedbackToneTokens,
  feedbackTones,
  liveRegionFor,
  loadingLayoutFor,
  loadingMessage,
  missingMessage,
  namedSubject,
  offlineMessage,
  permissionMessage,
  retryAvailable,
  retryHint,
  retryLabel,
  retryingMessage,
  successMessage,
  vagueFailurePhrases,
  type FeedbackTone,
  type LoadingScope,
} from './feedback.logic'

describe('live regions', () => {
  // Acceptance criterion 4.2: live regions are polite. There is no tone that
  // interrupts, and this is the assertion that keeps it that way.
  it('is polite for every tone, with no assertive escape hatch', () => {
    feedbackTones.forEach((tone) => {
      const region = liveRegionFor(tone)

      expect(region['aria-live']).toBe('polite')
      expect(region.role).toBe('status')
      expect(region['aria-atomic']).toBe(true)
    })
  })

  it('marks only the loading tone as busy', () => {
    expect(liveRegionFor('loading')['aria-busy']).toBe(true)

    feedbackTones
      .filter((tone) => tone !== 'loading')
      .forEach((tone) => {
        expect(liveRegionFor(tone)['aria-busy']).toBeUndefined()
      })
  })
})

describe('tone tokens', () => {
  const feedbackTokenValues = new Set<string>(Object.values(componentTokens.feedback))

  it('maps every tone to a feedback token, never a raw value', () => {
    feedbackTones.forEach((tone) => {
      const { bg, fg } = feedbackToneTokens(tone)

      expect(feedbackTokenValues.has(bg)).toBe(true)
      expect(feedbackTokenValues.has(fg)).toBe(true)
    })
  })

  it('does not dress absence as failure', () => {
    const empty = feedbackToneTokens('empty')
    const error = feedbackToneTokens('error')

    expect(empty).toEqual(feedbackToneTokens('missing'))
    expect(empty.bg).not.toBe(error.bg)
    expect(error.fg).toBe(componentTokens.feedback.dangerFg)
  })

  it('separates a refused action from a failed one', () => {
    expect(feedbackToneTokens('permission').fg).toBe(componentTokens.feedback.warningFg)
    expect(feedbackToneTokens('offline').fg).toBe(componentTokens.feedback.warningFg)
    expect(feedbackToneTokens('permission').fg).not.toBe(feedbackToneTokens('error').fg)
  })
})

describe('copy', () => {
  const builders: Array<[string, (value: string) => string, string]> = [
    ['loading', loadingMessage, 'the article'],
    ['failure', failureMessage, 'load the article'],
    ['retry label', retryLabel, 'load the article'],
    ['retrying', retryingMessage, 'load the article'],
    ['empty', emptyMessage, 'published posts'],
    ['permission', permissionMessage, 'edit this article'],
    ['missing', missingMessage, 'that Series'],
    ['offline', offlineMessage, 'save your draft'],
    ['success', successMessage, 'publish the article'],
  ]

  it('names the task or the failed action in every message', () => {
    builders.forEach(([label, build, subject]) => {
      expect(build(subject), label).toContain(subject)
    })
  })

  it('never produces a vague failure phrase', () => {
    builders.forEach(([label, build, subject]) => {
      const message = build(subject).toLowerCase()

      vagueFailurePhrases.forEach((phrase) => {
        expect(message.includes(phrase), `${label} / ${phrase}`).toBe(false)
      })
    })
  })

  it('rejects a blank subject rather than rendering an empty surface', () => {
    builders.forEach(([label, build]) => {
      expect(() => build(''), label).toThrow(TypeError)
      expect(() => build('   '), label).toThrow(TypeError)
    })
  })

  it('trims surrounding whitespace', () => {
    expect(namedSubject('  the article  ', 'task')).toBe('the article')
    expect(loadingMessage('  the article ')).toBe('Loading the article')
  })

  it('builds the sentences the content voice asks for', () => {
    expect(failureMessage('load the article')).toBe('We could not load the article.')
    expect(emptyMessage('published posts')).toBe('No published posts yet.')
    expect(retryLabel('load the article')).toBe('Try to load the article again')
  })
})

describe('retry availability', () => {
  it('allows unlimited manual retries when no cap is set', () => {
    expect(retryAvailable({ attempt: 12, maxAttempts: 0 })).toBe(true)
    expect(retryHint({ attempt: 12, maxAttempts: 0 })).toBeNull()
  })

  it('stops offering a retry once the attempts are spent', () => {
    expect(retryAvailable({ attempt: 2, maxAttempts: 3 })).toBe(true)
    expect(retryAvailable({ attempt: 3, maxAttempts: 3 })).toBe(false)
    expect(retryAvailable({ attempt: 4, maxAttempts: 3 })).toBe(false)
  })

  it('shows the counter only once a retry has been spent', () => {
    expect(retryHint({ attempt: 0, maxAttempts: 3 })).toBeNull()
    expect(retryHint({ attempt: 1, maxAttempts: 3 })).toBe('Attempt 1 of 3')
    expect(retryHint({ attempt: 9, maxAttempts: 3 })).toBe('Attempt 3 of 3')
  })
})

describe('loading scope', () => {
  const scopes: LoadingScope[] = ['route', 'panel', 'inline']

  it('keeps route, panel and inline loading distinct', () => {
    const heights = scopes.map((scope) => loadingLayoutFor(scope).minHeight)

    expect(new Set(heights).size).toBe(scopes.length)
  })

  it('reserves space for the two blocking scopes and none for inline', () => {
    expect(loadingLayoutFor('route').blocking).toBe(true)
    expect(loadingLayoutFor('panel').blocking).toBe(true)
    expect(loadingLayoutFor('panel').minHeight).toBe(space[24])

    expect(loadingLayoutFor('inline').blocking).toBe(false)
    expect(loadingLayoutFor('inline').minHeight).toBe('auto')
  })

  it('takes its gaps from the spacing scale', () => {
    const scale = new Set<string>(Object.values(space))

    scopes.forEach((scope) => {
      expect(scale.has(loadingLayoutFor(scope).gap)).toBe(true)
    })
  })
})

describe('the tone list', () => {
  it('covers every state the design contract names', () => {
    const expected: FeedbackTone[] = [
      'loading',
      'empty',
      'error',
      'permission',
      'missing',
      'offline',
      'success',
    ]

    expect([...feedbackTones].sort()).toEqual([...expected].sort())
  })
})
