import { describe, expect, it } from 'vitest'

import { componentTokens, semanticColors, space } from '../../../theme/tokens'
import {
  buttonTones,
  buttonVariant,
  controlSizes,
  controlSizing,
  controlState,
  loadingAnnouncement,
  meetsTouchTarget,
  type ButtonTone,
  iconButtonDisplay,
} from './control.logic'

/**
 * dsv2.3.2: "Define default, hover, press, focus, current, disabled, loading,
 * and danger states."
 *
 * Hover, press and focus are CSS - the theme's variant pseudo-states and the
 * global `*:focus-visible` rule - and are verified by eye in the B6 gallery.
 * The five states that are DOM attributes are verified here.
 */
describe('controlState', () => {
  it('leaves a resting control with no state attributes at all', () => {
    expect(controlState({})).toMatchObject({
      state: 'default',
      disabled: false,
      'aria-disabled': undefined,
      'aria-busy': undefined,
      'aria-current': undefined,
      isActivatable: true,
    })
  })

  it('disables natively, so a disabled control leaves the tab order', () => {
    const state = controlState({ isDisabled: true })

    expect(state.state).toBe('disabled')
    expect(state.disabled).toBe(true)
    expect(state.isActivatable).toBe(false)
  })

  it('keeps a loading control focusable and marks it busy', () => {
    const state = controlState({ isLoading: true })

    expect(state.state).toBe('loading')
    expect(state.disabled).toBe(false)
    expect(state['aria-disabled']).toBe(true)
    expect(state['aria-busy']).toBe(true)
    expect(state.isActivatable).toBe(false)
  })

  it('marks the current control programmatically, not only visually', () => {
    expect(controlState({ isCurrent: true })['aria-current']).toBe('page')
  })

  it('lets disabled win over loading, and never announces both', () => {
    const state = controlState({ isDisabled: true, isLoading: true })

    expect(state.state).toBe('disabled')
    expect(state['aria-busy']).toBeUndefined()
    expect(state['aria-disabled']).toBeUndefined()
    expect(state.disabled).toBe(true)
  })

  it('lets loading win over current while keeping the current marker', () => {
    const state = controlState({ isLoading: true, isCurrent: true })

    expect(state.state).toBe('loading')
    expect(state['aria-current']).toBe('page')
    expect(state['aria-busy']).toBe(true)
  })

  it('keeps the current marker on a disabled control', () => {
    expect(controlState({ isDisabled: true, isCurrent: true })['aria-current']).toBe('page')
  })

  it('refuses activation in every state that is not default or current', () => {
    expect(controlState({ isDisabled: true }).isActivatable).toBe(false)
    expect(controlState({ isLoading: true }).isActivatable).toBe(false)
    expect(controlState({ isCurrent: true }).isActivatable).toBe(true)
    expect(controlState({}).isActivatable).toBe(true)
  })

  it('never emits native disabled and aria-disabled at the same time', () => {
    const inputs = [
      { isDisabled: true },
      { isLoading: true },
      { isDisabled: true, isLoading: true },
      { isCurrent: true },
      {},
    ]

    for (const input of inputs) {
      const state = controlState(input)

      expect(state.disabled && state['aria-disabled'] === true).toBe(false)
    }
  })
})

/** dsv2.3.3 acceptance 3 and the accessibility floor: 44x44 where space permits. */
describe('control sizing', () => {
  it('meets the 44px touch target at the default size and above', () => {
    expect(meetsTouchTarget('md')).toBe(true)
    expect(meetsTouchTarget('lg')).toBe(true)
  })

  it('records that the compact size is below the floor, rather than hiding it', () => {
    expect(meetsTouchTarget('sm')).toBe(false)
  })

  it('takes the default size straight from the control alias', () => {
    expect(controlSizing('md').minH).toBe(componentTokens.control.minTouchTarget)
    expect(controlSizing('md').px).toBe(componentTokens.control.paddingX)
  })

  it('takes every other measurement from the spacing scale', () => {
    const scale = Object.values(space)

    for (const size of controlSizes) {
      const sizing = controlSizing(size)

      for (const value of [sizing.minH, sizing.minW, sizing.px, sizing.gap]) {
        expect([
          ...scale,
          componentTokens.control.minTouchTarget,
          componentTokens.control.paddingX,
        ]).toContain(value)
      }
    }
  })

  it('grows monotonically from sm to lg', () => {
    const heights = controlSizes.map((size) => Number.parseInt(controlSizing(size).minH, 10))

    expect(heights).toEqual([...heights].sort((first, second) => first - second))
  })

  it('keeps every size square-capable, so an icon button is never a slot', () => {
    for (const size of controlSizes) {
      expect(controlSizing(size).minH).toBe(controlSizing(size).minW)
    }
  })
})

describe('buttonVariant', () => {
  it('maps each meaning onto exactly one theme variant', () => {
    expect(buttonVariant('primary')).toBe('solid')
    expect(buttonVariant('secondary')).toBe('outline')
    expect(buttonVariant('quiet')).toBe('ghost')
    expect(buttonVariant('link')).toBe('link')
  })

  it('gives the destructive tone its own variant', () => {
    expect(buttonVariant('danger')).toBe('danger')
    for (const tone of buttonTones.filter((candidate) => candidate !== 'danger')) {
      expect(buttonVariant(tone)).not.toBe('danger')
    }
  })

  it('offers the five documented tones and no more', () => {
    expect(buttonTones).toEqual(['primary', 'secondary', 'quiet', 'link', 'danger'])
  })

  it('never produces two meanings that share a variant', () => {
    const variants = buttonTones.map((tone: ButtonTone) => buttonVariant(tone))

    expect(new Set(variants).size).toBe(variants.length)
  })

  it('draws the danger tone from a status role that has a text pair', () => {
    expect(Object.keys(semanticColors)).toContain(componentTokens.control.dangerFg)
    expect(Object.keys(semanticColors)).toContain(componentTokens.control.dangerSurface)
  })
})

describe('loadingAnnouncement', () => {
  it('says nothing while the control is at rest', () => {
    expect(loadingAnnouncement('Publishing post', false).announcement).toBeUndefined()
  })

  it('announces the task the caller named', () => {
    expect(loadingAnnouncement('Publishing post', true)).toEqual({
      announcement: 'Publishing post',
      role: 'status',
    })
  })

  it('falls back to a generic announcement rather than to silence', () => {
    expect(loadingAnnouncement(undefined, true).announcement).toBe('Working')
  })
})

describe('iconButtonDisplay', () => {
  it('keeps the icon centred where a responsive value only hides the button', () => {
    expect(iconButtonDisplay({ sm: 'none' })).toEqual({ base: 'inline-flex', sm: 'none' })
  })

  it('leaves a value that names every width alone', () => {
    expect(iconButtonDisplay({ base: 'none', md: 'inline-flex' })).toEqual({
      base: 'none',
      md: 'inline-flex',
    })
    expect(iconButtonDisplay('none')).toBe('none')
    expect(iconButtonDisplay(undefined)).toBeUndefined()
  })
})
