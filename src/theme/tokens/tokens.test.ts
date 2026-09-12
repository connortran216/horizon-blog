import { describe, expect, it } from 'vitest'

import { componentTokens } from './components'
import {
  approvedColorTokens,
  colorOrigin,
  derivedColorTokens,
  semanticColor,
  semanticColors,
  type SemanticColorToken,
} from './semantic'
import { duration, easing, transform, transitionFor } from './motion'
import { tokens } from './index'

const luminance = (hex: string) => {
  const channels = hex
    .match(/[0-9a-f]{2}/gi)!
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

const contrastRatio = (foreground: string, background: string) => {
  const foregroundLuminance = luminance(foreground)
  const backgroundLuminance = luminance(background)

  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  )
}

/**
 * An independent transcription of the signed-off Signal v0.2 table. It exists so
 * that editing `semantic.ts` alone cannot silently move an approved value - the
 * two copies have to be changed together, which is the point where someone has
 * to notice that a design decision is being reopened.
 */
const APPROVED_BASELINE: Record<string, { light: string; dark: string }> = {
  'bg.page': { light: '#F5F7FC', dark: '#0D1220' },
  'bg.surface': { light: '#FFFFFF', dark: '#151D2E' },
  'bg.subtle': { light: '#EDF1FA', dark: '#1A2438' },
  'bg.elevated': { light: '#FFFFFF', dark: '#1C2740' },
  'text.primary': { light: '#17213A', dark: '#E9EEFA' },
  'text.secondary': { light: '#53617A', dark: '#A7B4CC' },
  'text.muted': { light: '#5D6B82', dark: '#8B9AB5' },
  'action.primary': { light: '#3158D4', dark: '#8AA4FF' },
  'action.hover': { light: '#2648B6', dark: '#A4B8FF' },
  'text.onAction': { light: '#FFFFFF', dark: '#101A35' },
  'link.default': { light: '#294BC4', dark: '#A9BAFF' },
  'accent.lime': { light: '#DDF89A', dark: '#C5EC83' },
  'text.onAccent': { light: '#263A12', dark: '#1C2C0C' },
  'border.subtle': { light: '#DCE3EF', dark: '#2B3852' },
  'border.control': { light: '#7E8BA5', dark: '#697B9D' },
  'focus.ring': { light: '#3158D4', dark: '#ABC0FF' },
  'status.success': { light: '#206B43', dark: '#80D7A1' },
  'status.warning': { light: '#8A5300', dark: '#F1C36C' },
  'status.danger': { light: '#B42336', dark: '#FF929F' },
}

/**
 * Semantic roles describe purpose. A role named after a route would make the
 * system unmaintainable, so the prefix list is closed on purpose - widening it
 * is a design decision, not a refactor.
 */
const ALLOWED_PREFIXES = [
  'accent',
  'action',
  'bg',
  'border',
  'focus',
  'link',
  'loading',
  'media',
  'status',
  'text',
]

const PAGE_WORDS = [
  'home',
  'blog',
  'series',
  'about',
  'contact',
  'cv',
  'profile',
  'editor',
  'analytics',
  'auth',
  'login',
  'register',
  'reader',
  'admin',
  'access',
]

const modes = ['light', 'dark'] as const

describe('semantic colour roles', () => {
  it('pairs every role across both themes', () => {
    for (const token of Object.keys(semanticColors) as SemanticColorToken[]) {
      for (const mode of modes) {
        const value = semanticColor(token, mode)

        expect(value, `${token} is missing a ${mode} value`).toBeTruthy()
        expect(value, `${token} ${mode} is not a colour`).toMatch(/^(#|rgb)/)
      }
    }
  })

  it('keeps the approved baseline values byte for byte', () => {
    expect(approvedColorTokens.length).toBe(Object.keys(APPROVED_BASELINE).length)

    for (const [token, expected] of Object.entries(APPROVED_BASELINE)) {
      expect(semanticColor(token as SemanticColorToken, 'light')).toBe(expected.light)
      expect(semanticColor(token as SemanticColorToken, 'dark')).toBe(expected.dark)
      expect(colorOrigin(token as SemanticColorToken)).toBe('approved')
    }
  })

  it('marks every non-baseline role as derived', () => {
    for (const token of derivedColorTokens) {
      expect(colorOrigin(token)).toBe('derived')
      expect(APPROVED_BASELINE[token]).toBeUndefined()
    }
  })

  it('introduces no page-specific token', () => {
    for (const token of Object.keys(semanticColors)) {
      const [prefix] = token.split('.')

      expect(ALLOWED_PREFIXES, `${token} uses an unknown family`).toContain(prefix)

      const lowered = token.toLowerCase()
      const pageWord = PAGE_WORDS.find((word) => lowered.includes(word))

      expect(pageWord, `${token} is named after a page`).toBeUndefined()
    }
  })
})

describe('approved contrast', () => {
  const surfaces = ['bg.page', 'bg.surface', 'bg.subtle', 'bg.elevated'] as const
  const readingText = [
    'text.primary',
    'text.secondary',
    'text.muted',
    'link.default',
    'status.success',
    'status.warning',
    'status.danger',
  ] as const

  it('keeps reading text at AA on every surface in both themes', () => {
    for (const mode of modes) {
      for (const text of readingText) {
        for (const surface of surfaces) {
          const ratio = contrastRatio(semanticColor(text, mode), semanticColor(surface, mode))

          expect(ratio, `${text} on ${surface} (${mode})`).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })

  it('keeps primary action labels readable on the action fill', () => {
    for (const mode of modes) {
      const ratio = contrastRatio(
        semanticColor('text.onAction', mode),
        semanticColor('action.primary', mode),
      )

      expect(ratio, `action label (${mode})`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps accent labels readable on the lime accent', () => {
    for (const mode of modes) {
      const ratio = contrastRatio(
        semanticColor('text.onAccent', mode),
        semanticColor('accent.lime', mode),
      )

      expect(ratio, `accent label (${mode})`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps control boundaries visible on every surface', () => {
    for (const mode of modes) {
      for (const surface of surfaces) {
        const ratio = contrastRatio(
          semanticColor('border.control', mode),
          semanticColor(surface, mode),
        )

        expect(ratio, `control border on ${surface} (${mode})`).toBeGreaterThanOrEqual(3)
      }
    }
  })
})

describe('component aliases', () => {
  const isColourAlias = (value: unknown): value is string =>
    typeof value === 'string' &&
    value.includes('.') &&
    ALLOWED_PREFIXES.includes(value.split('.')[0])

  it('only points at roles that exist', () => {
    for (const [family, aliases] of Object.entries(componentTokens)) {
      for (const [name, value] of Object.entries(aliases)) {
        if (!isColourAlias(value)) continue

        expect(semanticColors, `${family}.${name} -> ${value}`).toHaveProperty(value)
      }
    }
  })

  it('only names durations the motion contract defines', () => {
    for (const [family, aliases] of Object.entries(componentTokens)) {
      const transition = (aliases as Record<string, unknown>).transition

      if (transition === undefined) continue

      expect(duration, `${family}.transition -> ${String(transition)}`).toHaveProperty(
        String(transition),
      )
    }
  })
})

describe('motion contract', () => {
  it('keeps approved durations and easing', () => {
    expect(duration.fast).toBe('120ms')
    expect(duration.normal).toBe('200ms')
    expect(duration.enter).toBe('320ms')
    expect(easing.standard).toBe('cubic-bezier(0.22, 1, 0.36, 1)')
    expect(transform.hoverLift).toBe('-2px')
    expect(transform.revealDistance).toBe('8px')
  })

  it('builds transitions from the shared curve', () => {
    expect(transitionFor('color', 'fast')).toBe('color 120ms cubic-bezier(0.22, 1, 0.36, 1)')
    expect(transitionFor('opacity')).toBe('opacity 200ms cubic-bezier(0.22, 1, 0.36, 1)')
  })
})

describe('token names', () => {
  it('rejects a name the system does not define', () => {
    // @ts-expect-error 'bg.paper' is not a semantic role
    expect(() => semanticColor('bg.paper', 'light')).toThrowError()
  })

  it('exposes the whole system as one value', () => {
    expect(tokens.version).toBe('2.0.0')
    expect(Object.keys(tokens.semantic.colors)).toEqual(Object.keys(semanticColors))
    expect(Object.keys(tokens.components)).toEqual(Object.keys(componentTokens))
  })
})
