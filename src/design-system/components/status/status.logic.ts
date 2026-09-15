/**
 * Status and selection decisions.
 *
 * `dsv2.3.3` asks that status never be signalled by colour alone. That is not
 * something a component can be trusted to remember, so it is structural here:
 * every tone resolves to a colour *and* an icon, and there is no way to ask for
 * one without the other.
 */

import { componentTokens, radii, space, transitionFor } from '../../../theme/tokens'

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger'

/** Icon names, resolved to real components by the component layer. */
export type StatusIcon = 'info' | 'check' | 'warning' | 'error'

export interface StatusToneStyle {
  readonly bg: string
  readonly color: string
  readonly icon: StatusIcon
}

const tones = {
  neutral: {
    bg: componentTokens.feedback.neutralBg,
    color: componentTokens.feedback.neutralFg,
    icon: 'info',
  },
  success: {
    bg: componentTokens.feedback.successBg,
    color: componentTokens.feedback.successFg,
    icon: 'check',
  },
  warning: {
    bg: componentTokens.feedback.warningBg,
    color: componentTokens.feedback.warningFg,
    icon: 'warning',
  },
  danger: {
    bg: componentTokens.feedback.dangerBg,
    color: componentTokens.feedback.dangerFg,
    icon: 'error',
  },
} as const satisfies Record<StatusTone, StatusToneStyle>

export const statusTones = Object.keys(tones) as StatusTone[]

export function statusToneStyle(tone: StatusTone): StatusToneStyle {
  return tones[tone]
}

/**
 * A badge always carries text. The icon is a second channel on top of the
 * colour, and the text is the third - and the only one that survives being
 * printed in greyscale by someone who has never seen the app.
 */
export function statusBadgeIsColourOnly(label: string, hasIcon: boolean): boolean {
  return label.trim().length === 0 && !hasIcon
}

export interface ChipStateInput {
  readonly isSelected?: boolean
  readonly isDisabled?: boolean
  /** True when the chip has a click handler or a selection state. */
  readonly isInteractive?: boolean
}

export type ChipElement = 'button' | 'span'

export interface ChipStyle {
  readonly element: ChipElement
  readonly bg: string
  readonly color: string
  readonly borderColor: string
  readonly borderRadius: string
  readonly paddingX: string
  readonly minHeight: string
  readonly transition: string
  readonly 'aria-pressed': boolean | undefined
  /**
   * Native `disabled`, and only that. A chip has no loading state, so there is
   * no reason to keep a dead filter in the tab order - and emitting both
   * `disabled` and `aria-disabled` would state the same thing twice, in two
   * mechanisms that can drift apart.
   */
  readonly disabled: boolean
  /** Whether a tick is drawn, so selection is not carried by colour alone. */
  readonly showSelectedIcon: boolean
}

/**
 * A chip is a `button` when it does something and a `span` when it is a label.
 *
 * The distinction matters: a static topic tag that renders as a button appears
 * in the tab order and promises an action it will never take, and a filter
 * rendered as a span cannot be reached by keyboard at all.
 *
 * A selected chip shows a tick as well as the lime surface. The lime is the
 * strongest signal in the palette and the tick is the one that still works when
 * the surface is not visible.
 */
export function chipStyle({
  isSelected = false,
  isDisabled = false,
  isInteractive = false,
}: ChipStateInput): ChipStyle {
  const element: ChipElement = isInteractive ? 'button' : 'span'

  return {
    element,
    bg: isSelected ? componentTokens.feature.accent : componentTokens.card.hoverBg,
    color: isSelected ? componentTokens.feature.accentFg : componentTokens.control.quietFg,
    borderColor: isSelected ? componentTokens.feature.accent : componentTokens.card.border,
    borderRadius: radii.tag,
    paddingX: space[3],
    // Chips sit in dense filter rows, so they use the compact height. The row
    // itself is what has to stay thumb-reachable - see the gallery's touch pass.
    minHeight: space[8],
    transition: `${transitionFor('background-color', 'fast')}, ${transitionFor('color', 'fast')}`,
    'aria-pressed': isInteractive ? isSelected : undefined,
    disabled: isDisabled && isInteractive,
    showSelectedIcon: isSelected,
  }
}
