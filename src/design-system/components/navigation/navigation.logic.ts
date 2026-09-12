/**
 * Navigation state decisions.
 *
 * The rule this module exists to enforce: `DESIGN.md` says "no meaning depends
 * on hover", and CONVENTIONS.md spells out the consequence - "a current nav item
 * needs a persistent indicator, not just a hover underline". So the current item
 * carries three signals that survive with the pointer nowhere near it:
 * `aria-current`, a weight and colour change, and a visible indicator bar. Hover
 * changes only the background tint, which means nothing on its own.
 */

import { componentTokens, transitionFor } from '../../../theme/tokens'

export interface NavItemStateInput {
  readonly isCurrent?: boolean
  readonly isDisabled?: boolean
}

export interface NavItemStateStyle {
  readonly color: string
  /** 1 for the current item, 0 otherwise. Never keyed off hover. */
  readonly indicatorOpacity: number
  readonly indicatorColor: string
  readonly 'aria-current': 'page' | undefined
  readonly 'aria-disabled': true | undefined
  readonly transition: string
}

export function navItemState({
  isCurrent = false,
  isDisabled = false,
}: NavItemStateInput): NavItemStateStyle {
  return {
    color: isDisabled
      ? componentTokens.control.disabledFg
      : isCurrent
        ? componentTokens.header.itemActive
        : componentTokens.header.itemRest,
    indicatorOpacity: isCurrent ? 1 : 0,
    indicatorColor: componentTokens.header.itemIndicator,
    'aria-current': isCurrent ? 'page' : undefined,
    'aria-disabled': isDisabled ? true : undefined,
    transition: `${transitionFor('color', 'fast')}, ${transitionFor('opacity', 'navigation')}`,
  }
}

/**
 * The signals that mark the current item, excluding hover and excluding colour.
 *
 * Font weight is deliberately not one of them: a horizontal nav whose current
 * item got heavier would rewrap every item beside it on each navigation, and
 * DESIGN.md does not trade layout stability for a redundant cue. What is left is
 * the programmatic `aria-current` and the always-present indicator bar - the
 * colour shift rides along on top of those, never alone.
 */
export function currentItemSignals(state: NavItemStateStyle): string[] {
  const signals: string[] = []

  if (state['aria-current'] === 'page') {
    signals.push('aria-current')
  }

  if (state.indicatorOpacity === 1) {
    signals.push('indicator')
  }

  return signals
}

export type NavItemElement = 'router-link' | 'anchor' | 'button'

/**
 * Which element a nav item renders. Never a div: a route is a link, an in-page
 * command is a button, and there is no third case.
 */
export function navItemElement({ to, href }: { to?: string; href?: string }): NavItemElement {
  if (to !== undefined) {
    return 'router-link'
  }

  if (href !== undefined) {
    return 'anchor'
  }

  return 'button'
}

export type ThemeMode = 'light' | 'dark'

export interface ThemeToggleOption {
  readonly value: ThemeMode
  /** Full sentence name: an icon-only control has no other text. */
  readonly label: string
  /** `aria-pressed`. Persistent, and independent of colour. */
  readonly isPressed: boolean
}

/**
 * A two-button group rather than a switch, because the state is a choice between
 * two named themes and not an on/off. Both buttons carry `aria-pressed`, so the
 * current theme is announced even when the visual difference between the
 * pressed and unpressed surfaces is the only thing on screen.
 */
export function themeToggleOptions(mode: ThemeMode): ThemeToggleOption[] {
  return [
    { value: 'light', label: 'Light theme', isPressed: mode === 'light' },
    { value: 'dark', label: 'Dark theme', isPressed: mode === 'dark' },
  ]
}

/** The mode a toggle moves to. Kept pure so the transition is testable. */
export function nextThemeMode(mode: ThemeMode): ThemeMode {
  return mode === 'light' ? 'dark' : 'light'
}

export type RailDirection = 'previous' | 'next'

export interface RailControlAria {
  readonly 'aria-label': string
  readonly 'aria-disabled': true | undefined
  readonly disabled: boolean
  readonly rotate: string
}

/**
 * Rail controls are supplementary. The rail itself scrolls natively with touch
 * and with the keyboard, so a control that has run out of items is disabled
 * rather than hidden - a control that disappears takes the layout with it and
 * moves everything beside it.
 */
export function railControlAria(
  direction: RailDirection,
  { isDisabled = false, itemLabel = 'items' } = {},
): RailControlAria {
  return {
    'aria-label': direction === 'previous' ? `Previous ${itemLabel}` : `Next ${itemLabel}`,
    'aria-disabled': isDisabled ? true : undefined,
    disabled: isDisabled,
    rotate: direction === 'previous' ? '180deg' : '0deg',
  }
}
