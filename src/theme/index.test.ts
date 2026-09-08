import { describe, expect, it } from 'vitest'
import theme from './index'
import { signalColors } from './signal'

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

describe('theme accessibility', () => {
  it('keeps light tertiary text readable on primary and secondary surfaces', () => {
    const tertiary = theme.colors.obsidian.text.lightTertiary

    expect(contrastRatio(tertiary, theme.colors.obsidian.light.bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(tertiary, theme.colors.obsidian.light.bgSecondary)).toBeGreaterThanOrEqual(
      4.5,
    )
  })
})

describe('Signal semantic theme', () => {
  it.each(['default', '_dark'] as const)(
    'keeps normal text and action labels readable in %s',
    (mode) => {
      for (const surface of ['bg.page', 'bg.surface', 'bg.elevated'] as const) {
        for (const text of ['text.primary', 'text.secondary', 'text.muted'] as const) {
          expect(
            contrastRatio(signalColors[text][mode], signalColors[surface][mode]),
          ).toBeGreaterThanOrEqual(4.5)
        }
      }
      for (const action of ['action.primary', 'action.hover'] as const) {
        expect(
          contrastRatio(signalColors['text.onAction'][mode], signalColors[action][mode]),
        ).toBeGreaterThanOrEqual(4.5)
      }
      expect(
        contrastRatio(signalColors['focus.ring'][mode], signalColors['bg.surface'][mode]),
      ).toBeGreaterThanOrEqual(3)
    },
  )
  it('preserves existing consumers through semantic aliases', () => {
    expect(signalColors['bg.secondary']).toEqual(signalColors['bg.surface'])
    expect(signalColors['bg.tertiary']).toEqual(signalColors['bg.subtle'])
    expect(signalColors['text.tertiary']).toEqual(signalColors['text.muted'])
    const solid = theme.components.Button.variants.solid({
      theme,
      colorMode: 'dark',
      colorScheme: 'gray',
    })
    expect(solid.color).toBe('text.onAction')
    expect(theme.fonts.body).toContain('Be Vietnam Pro')
  })
})
