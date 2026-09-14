import { describe, expect, it } from 'vitest'
import theme from './index'
import { contrastRatio } from './tokens'

describe('theme accessibility', () => {
  it('keeps light tertiary text readable on primary and secondary surfaces', () => {
    const tertiary = theme.colors.obsidian.text.lightTertiary

    expect(contrastRatio(tertiary, theme.colors.obsidian.light.bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(tertiary, theme.colors.obsidian.light.bgSecondary)).toBeGreaterThanOrEqual(
      4.5,
    )
  })
})
