import { describe, expect, it } from 'vitest'

import { componentTokens, semanticColors } from '../../../theme/tokens'
import {
  currentItemSignals,
  navItemElement,
  navItemState,
  nextThemeMode,
  railControlAria,
  themeToggleOptions,
} from './navigation.logic'

/**
 * dsv2.3.2 acceptance 1: "No interactive divs."
 *
 * The element choice is a pure function precisely so this can be asserted: a
 * nav item is a router link, an anchor or a button, and there is no fourth
 * branch for a handler-on-a-div to hide in.
 */
describe('navItemElement', () => {
  it('renders a route as a router link', () => {
    expect(navItemElement({ to: '/series' })).toBe('router-link')
  })

  it('renders an external destination as an anchor', () => {
    expect(navItemElement({ href: 'https://example.com' })).toBe('anchor')
  })

  it('renders a destination-less command as a button', () => {
    expect(navItemElement({})).toBe('button')
  })

  it('prefers the route when both a route and an href are given', () => {
    expect(navItemElement({ to: '/series', href: 'https://example.com' })).toBe('router-link')
  })

  it('only ever produces a natively interactive element', () => {
    const cases = [{ to: '/a' }, { href: '/b' }, {}]

    for (const input of cases) {
      expect(['router-link', 'anchor', 'button']).toContain(navItemElement(input))
    }
  })
})

/**
 * dsv2.3.2 acceptance 4: "Controls do not depend on hover for meaning", and the
 * brief's stronger form - a current nav item needs a persistent indicator.
 */
describe('navItemState', () => {
  it('marks the current item programmatically', () => {
    expect(navItemState({ isCurrent: true })['aria-current']).toBe('page')
    expect(navItemState({})['aria-current']).toBeUndefined()
  })

  it('carries a persistent indicator, not a hover-only one', () => {
    expect(navItemState({ isCurrent: true }).indicatorOpacity).toBe(1)
    expect(navItemState({}).indicatorOpacity).toBe(0)
  })

  it('marks the current item with more than one non-hover signal', () => {
    const signals = currentItemSignals(navItemState({ isCurrent: true }))

    expect(signals).toContain('aria-current')
    expect(signals).toContain('indicator')
    expect(signals.length).toBeGreaterThan(1)
  })

  it('gives a resting item no current signals at all', () => {
    expect(currentItemSignals(navItemState({}))).toEqual([])
  })

  it('shifts colour as a supporting cue on top of those signals', () => {
    expect(navItemState({ isCurrent: true }).color).toBe(componentTokens.header.itemActive)
    expect(navItemState({}).color).toBe(componentTokens.header.itemRest)
  })

  it('draws the indicator from the header action role, not a raw colour', () => {
    expect(navItemState({ isCurrent: true }).indicatorColor).toBe(
      componentTokens.header.itemIndicator,
    )
    expect(Object.keys(semanticColors)).toContain(navItemState({}).indicatorColor)
  })

  it('greys and marks a disabled item without dropping its indicator geometry', () => {
    const state = navItemState({ isDisabled: true, isCurrent: true })

    expect(state.color).toBe(componentTokens.control.disabledFg)
    expect(state['aria-disabled']).toBe(true)
    expect(state.indicatorOpacity).toBe(1)
  })

  it('animates only colour and opacity, so navigating never moves an item', () => {
    const properties = [...navItemState({}).transition.matchAll(/([a-z-]+)\s+\d+ms/g)].map(
      (match) => match[1],
    )

    expect(properties).toEqual(['color', 'opacity'])
  })
})

describe('themeToggleOptions', () => {
  it('offers both themes as named, pressable options', () => {
    const options = themeToggleOptions('light')

    expect(options.map((option) => option.value)).toEqual(['light', 'dark'])
    expect(options.every((option) => option.label.length > 0)).toBe(true)
  })

  it('presses exactly one option, whichever theme is active', () => {
    for (const mode of ['light', 'dark'] as const) {
      const pressed = themeToggleOptions(mode).filter((option) => option.isPressed)

      expect(pressed).toHaveLength(1)
      expect(pressed[0].value).toBe(mode)
    }
  })

  it('puts the state in aria-pressed, so it does not rely on which half looks lit', () => {
    expect(themeToggleOptions('dark')[1].isPressed).toBe(true)
    expect(themeToggleOptions('dark')[0].isPressed).toBe(false)
  })
})

describe('nextThemeMode', () => {
  it('alternates, and returns to the start in two steps', () => {
    expect(nextThemeMode('light')).toBe('dark')
    expect(nextThemeMode('dark')).toBe('light')
    expect(nextThemeMode(nextThemeMode('light'))).toBe('light')
  })
})

describe('railControlAria', () => {
  it('names both directions in words, not by icon alone', () => {
    expect(railControlAria('previous')['aria-label']).toBe('Previous items')
    expect(railControlAria('next')['aria-label']).toBe('Next items')
  })

  it('names what the rail holds when the caller says so', () => {
    expect(railControlAria('next', { itemLabel: 'parts' })['aria-label']).toBe('Next parts')
  })

  it('disables at the end of the rail rather than reporting it by opacity alone', () => {
    const aria = railControlAria('previous', { isDisabled: true })

    expect(aria.disabled).toBe(true)
    expect(aria['aria-disabled']).toBe(true)
  })

  it('reuses one icon by rotating it, rather than shipping a second asset', () => {
    expect(railControlAria('next').rotate).toBe('0deg')
    expect(railControlAria('previous').rotate).toBe('180deg')
  })
})
