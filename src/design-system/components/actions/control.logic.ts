/**
 * The interaction contract every control in the system shares.
 *
 * `dsv2.3.2` names eight states - default, hover, press, focus, current,
 * disabled, loading and danger. Three of them are CSS and belong to the theme:
 * hover and press are variant pseudo-states, and focus is the global
 * `*:focus-visible` rule, which no component may override. The other five are
 * decisions about what to put in the DOM, and those live here.
 *
 * The rule this module encodes, and the reason it is a function rather than a
 * few ternaries in JSX: a control can be disabled and loading and current at the
 * same time, and the resulting attributes must not contradict each other.
 */

import { componentTokens, space } from '../../../theme/tokens'
import type { TextStyleToken } from '../typography/typography.logic'

export type ControlSize = 'sm' | 'md' | 'lg'

export interface ControlSizing {
  readonly minH: string
  readonly minW: string
  readonly px: string
  readonly gap: string
  readonly textStyle: TextStyleToken
}

/**
 * Three sizes, all measured off the spacing scale and the control alias.
 *
 * `md` is the default and is exactly the 44px touch target the accessibility
 * floor asks for. `sm` is 32px and deliberately below it: DESIGN.md says 44px
 * "where space permits", and a code-block toolbar or an inline table action is
 * where it does not. `meetsTouchTarget` below is what keeps that an explicit
 * choice instead of an accident.
 */
const sizes = {
  sm: {
    minH: space[8],
    minW: space[8],
    px: space[3],
    gap: space[2],
    textStyle: 'meta',
  },
  md: {
    minH: componentTokens.control.minTouchTarget,
    minW: componentTokens.control.minTouchTarget,
    px: componentTokens.control.paddingX,
    gap: space[2],
    textStyle: 'body',
  },
  lg: {
    minH: space[12],
    minW: space[12],
    px: space[6],
    gap: space[3],
    textStyle: 'body',
  },
} as const satisfies Record<ControlSize, ControlSizing>

export const controlSizes = Object.keys(sizes) as ControlSize[]

export function controlSizing(size: ControlSize): ControlSizing {
  return sizes[size]
}

/** Whether a size reaches the 44x44 floor without help from its surroundings. */
export function meetsTouchTarget(size: ControlSize): boolean {
  const sizing = sizes[size]
  const minimum = Number.parseInt(componentTokens.control.minTouchTarget, 10)

  return Number.parseInt(sizing.minH, 10) >= minimum && Number.parseInt(sizing.minW, 10) >= minimum
}

/**
 * What the action means, not what it looks like. The theme owns the appearance
 * of each variant; this is the one place that decides which variant a meaning
 * maps to, so retoning the system is a change here rather than at every call.
 */
export type ButtonTone = 'primary' | 'secondary' | 'quiet' | 'link' | 'danger'

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link' | 'danger'

const toneVariants = {
  primary: 'solid',
  secondary: 'outline',
  quiet: 'ghost',
  link: 'link',
  danger: 'danger',
} as const satisfies Record<ButtonTone, ButtonVariant>

export const buttonTones = Object.keys(toneVariants) as ButtonTone[]

export function buttonVariant(tone: ButtonTone): ButtonVariant {
  return toneVariants[tone]
}

export interface ControlStateInput {
  readonly isDisabled?: boolean
  readonly isLoading?: boolean
  readonly isCurrent?: boolean
}

/** The single state a control is in, after precedence has been applied. */
export type ControlState = 'disabled' | 'loading' | 'current' | 'default'

export interface ControlStateOutput {
  readonly state: ControlState
  /**
   * Native `disabled`. Only a genuinely disabled control gets it, because a
   * disabled element drops out of the tab order - and a control that took focus
   * a moment ago and then started loading would silently throw that focus back
   * to the document.
   */
  readonly disabled: boolean
  /** `aria-disabled` marks a loading control unavailable while keeping focus. */
  readonly 'aria-disabled': true | undefined
  readonly 'aria-busy': true | undefined
  readonly 'aria-current': 'page' | undefined
  /** False when a click must be swallowed rather than dispatched. */
  readonly isActivatable: boolean
}

/**
 * Precedence: disabled beats loading beats current.
 *
 * Disabled first because it is the only state that says the action cannot
 * happen at all; a disabled control that also spelled itself busy would be
 * announcing work that will never finish. Current last because it describes
 * where the user is, not whether the control can be used.
 */
export function controlState({
  isDisabled = false,
  isLoading = false,
  isCurrent = false,
}: ControlStateInput): ControlStateOutput {
  if (isDisabled) {
    return {
      state: 'disabled',
      disabled: true,
      'aria-disabled': undefined,
      'aria-busy': undefined,
      'aria-current': isCurrent ? 'page' : undefined,
      isActivatable: false,
    }
  }

  if (isLoading) {
    return {
      state: 'loading',
      disabled: false,
      'aria-disabled': true,
      'aria-busy': true,
      'aria-current': isCurrent ? 'page' : undefined,
      isActivatable: false,
    }
  }

  if (isCurrent) {
    return {
      state: 'current',
      disabled: false,
      'aria-disabled': undefined,
      'aria-busy': undefined,
      'aria-current': 'page',
      isActivatable: true,
    }
  }

  return {
    state: 'default',
    disabled: false,
    'aria-disabled': undefined,
    'aria-busy': undefined,
    'aria-current': undefined,
    isActivatable: true,
  }
}

/**
 * The accessible name of a control that is loading.
 *
 * A spinner replacing a label leaves a button with no name at all, and a label
 * that never changes leaves the state unannounced. Both halves are returned:
 * the visible text stays put, and the busy text is what a live region says.
 */
export function loadingAnnouncement(label: string | undefined, isLoading: boolean) {
  if (!isLoading) {
    return { announcement: undefined, role: undefined } as const
  }

  return { announcement: label ?? 'Working', role: 'status' } as const
}
