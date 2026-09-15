import { describe, expect, it } from 'vitest'

import { componentTokens, radii, semanticColors } from '../../../theme/tokens'
import { chipStyle, statusBadgeIsColourOnly, statusToneStyle, statusTones } from './status.logic'

/** dsv2.3.3 acceptance 2: status is never signalled by colour alone. */
describe('status tones', () => {
  it('offers the four documented tones', () => {
    expect(statusTones).toEqual(['neutral', 'success', 'warning', 'danger'])
  })

  it('pairs every tone with an icon, so colour is never the only channel', () => {
    for (const tone of statusTones) {
      expect(statusToneStyle(tone).icon).toBeTruthy()
    }
  })

  it('gives each tone its own icon, so two states never look identical in mono', () => {
    const icons = statusTones.map((tone) => statusToneStyle(tone).icon)

    expect(new Set(icons).size).toBe(icons.length)
  })

  it('resolves every tone to paired semantic roles, never a raw value', () => {
    for (const tone of statusTones) {
      const style = statusToneStyle(tone)

      expect(Object.keys(semanticColors)).toContain(style.bg)
      expect(Object.keys(semanticColors)).toContain(style.color)
    }
  })

  it('pairs each status surface with the matching status text role', () => {
    expect(statusToneStyle('success').color).toBe(componentTokens.feedback.successFg)
    expect(statusToneStyle('success').bg).toBe(componentTokens.feedback.successBg)
    expect(statusToneStyle('danger').color).toBe(componentTokens.feedback.dangerFg)
    expect(statusToneStyle('danger').bg).toBe(componentTokens.feedback.dangerBg)
  })

  it('recognises a badge that would be colour only', () => {
    expect(statusBadgeIsColourOnly('', false)).toBe(true)
    expect(statusBadgeIsColourOnly('   ', false)).toBe(true)
    expect(statusBadgeIsColourOnly('Published', false)).toBe(false)
    expect(statusBadgeIsColourOnly('', true)).toBe(false)
  })
})

/** dsv2.3.2 acceptance 1: "No interactive divs." */
describe('chipStyle element', () => {
  it('is a button when it does something', () => {
    expect(chipStyle({ isInteractive: true }).element).toBe('button')
  })

  it('is a span when it is only a label', () => {
    expect(chipStyle({}).element).toBe('span')
  })

  it('never produces a third element', () => {
    const inputs = [{}, { isInteractive: true }, { isSelected: true, isInteractive: true }]

    for (const input of inputs) {
      expect(['button', 'span']).toContain(chipStyle(input).element)
    }
  })
})

describe('chip selection', () => {
  it('reports selection through aria-pressed on the interactive chip', () => {
    expect(chipStyle({ isSelected: true, isInteractive: true })['aria-pressed']).toBe(true)
    expect(chipStyle({ isSelected: false, isInteractive: true })['aria-pressed']).toBe(false)
  })

  it('leaves aria-pressed off a chip that is not a control', () => {
    expect(chipStyle({ isSelected: true })['aria-pressed']).toBeUndefined()
  })

  it('draws a tick as well as the accent surface, so selection is not colour alone', () => {
    expect(chipStyle({ isSelected: true, isInteractive: true }).showSelectedIcon).toBe(true)
    expect(chipStyle({ isInteractive: true }).showSelectedIcon).toBe(false)
  })

  it('uses the accent role for selection and its paired foreground', () => {
    const selected = chipStyle({ isSelected: true, isInteractive: true })

    expect(selected.bg).toBe(componentTokens.feature.accent)
    expect(selected.color).toBe(componentTokens.feature.accentFg)
  })

  it('resolves every chip colour to a paired semantic role', () => {
    for (const input of [{}, { isSelected: true, isInteractive: true }]) {
      const style = chipStyle(input)

      expect(Object.keys(semanticColors)).toContain(style.bg)
      expect(Object.keys(semanticColors)).toContain(style.color)
      expect(Object.keys(semanticColors)).toContain(style.borderColor)
    }
  })

  it('uses the pill radius token rather than a literal', () => {
    expect(chipStyle({}).borderRadius).toBe(radii.tag)
  })
})

describe('chip disabled state', () => {
  it('disables natively, and never states it twice', () => {
    const style = chipStyle({ isDisabled: true, isInteractive: true })

    expect(style.disabled).toBe(true)
    expect(Object.keys(style)).not.toContain('aria-disabled')
  })

  it('cannot disable a chip that is not a control', () => {
    expect(chipStyle({ isDisabled: true }).disabled).toBe(false)
  })
})

describe('chip motion', () => {
  it('animates only colour, so a filter row never reflows on hover', () => {
    const properties = [...chipStyle({}).transition.matchAll(/([a-z-]+)\s+\d+ms/g)].map(
      (match) => match[1],
    )

    expect(properties).toEqual(['background-color', 'color'])
  })
})
