/**
 * Field wiring.
 *
 * `dsv2.3.3` asks for two things that are entirely decidable without a DOM:
 * every field has a programmatic label, and errors are announced rather than
 * shown in red. Both come down to which ids exist and which attributes point at
 * them, so both live in this function and are asserted in `field.test.ts`.
 *
 * What this cannot prove, and what the B6 gallery and the manual accessibility
 * matrix therefore own: that a screen reader actually reads the description in
 * the order given, that `role="alert"` interrupts at the moment the error
 * appears, and that focus lands on the first invalid control on submit.
 */

import { componentTokens, transitionFor } from '../../../theme/tokens'

export type FieldState = 'disabled' | 'readOnly' | 'invalid' | 'loading' | 'success' | 'default'

export interface FieldAriaInput {
  /** Stable id for the field. Everything else is derived from it. */
  readonly id: string
  /** Help text shown before the user has done anything wrong. */
  readonly hint?: string
  /** Validation message. Its presence is what makes a field invalid. */
  readonly error?: string
  /** Confirmation after a successful async check ("Username available"). */
  readonly successMessage?: string
  readonly isRequired?: boolean
  readonly isDisabled?: boolean
  readonly isReadOnly?: boolean
  /** Force the invalid state without a message. Rarely what you want. */
  readonly isInvalid?: boolean
  readonly isLoading?: boolean
}

export interface FieldIds {
  readonly label: string
  readonly hint: string
  readonly error: string
  readonly success: string
}

export interface FieldControlAria {
  readonly id: string
  readonly 'aria-describedby': string | undefined
  readonly 'aria-invalid': true | undefined
  readonly 'aria-required': true | undefined
  readonly 'aria-busy': true | undefined
  readonly required: boolean
  readonly disabled: boolean
  readonly readOnly: boolean
}

export interface FieldMessageAria {
  readonly id: string
  readonly role: 'alert' | 'status'
  readonly 'aria-live': 'assertive' | 'polite'
}

export interface FieldAriaOutput {
  readonly state: FieldState
  readonly isInvalid: boolean
  readonly ids: FieldIds
  readonly control: FieldControlAria
  readonly label: { readonly id: string; readonly htmlFor: string }
  /**
   * For a control that is not a single native input - a radio set, a group of
   * checkboxes - where `label for` has nothing to point at.
   */
  readonly group: {
    readonly role: 'group'
    readonly 'aria-labelledby': string
    readonly 'aria-describedby': string | undefined
  }
  readonly hint: { readonly id: string } | undefined
  readonly error: FieldMessageAria | undefined
  readonly success: FieldMessageAria | undefined
  /**
   * A required field needs a marker a screen reader can read. The asterisk is
   * decoration; the text is the actual announcement, and `aria-required` is the
   * machine-readable form. Never the asterisk alone.
   */
  readonly requiredIndicator: { readonly symbol: string; readonly text: string } | undefined
}

export function fieldIds(id: string): FieldIds {
  return {
    label: `${id}-label`,
    hint: `${id}-hint`,
    error: `${id}-error`,
    success: `${id}-success`,
  }
}

/**
 * Which single state the field is in.
 *
 * Precedence, strongest first: disabled, read-only, invalid, loading, success.
 * Disabled and read-only come first because a field the user cannot change has
 * no useful validity to report. Invalid beats loading because it blocks
 * submission and loading does not. Success is last: it is the state a field
 * falls back to when nothing more urgent is true.
 */
export function fieldState(input: FieldAriaInput): FieldState {
  if (input.isDisabled === true) {
    return 'disabled'
  }

  if (input.isReadOnly === true) {
    return 'readOnly'
  }

  if (isFieldInvalid(input)) {
    return 'invalid'
  }

  if (input.isLoading === true) {
    return 'loading'
  }

  if (input.successMessage !== undefined) {
    return 'success'
  }

  return 'default'
}

/**
 * A message present means the field is invalid. `isInvalid` can force the state
 * without a message, but it cannot clear one: a field showing "Email is already
 * registered" while reporting itself valid is a worse defect than a redundant
 * flag.
 */
export function isFieldInvalid({ error, isInvalid }: FieldAriaInput): boolean {
  return error !== undefined || isInvalid === true
}

/**
 * The description order is hint, then error, then success, and it is the order a
 * screen reader will read them in. Help before the correction, correction before
 * the confirmation.
 */
export function fieldDescribedBy(input: FieldAriaInput): string | undefined {
  const ids = fieldIds(input.id)
  const parts: string[] = []

  if (input.hint !== undefined) {
    parts.push(ids.hint)
  }

  if (isFieldInvalid(input) && input.error !== undefined) {
    parts.push(ids.error)
  }

  if (input.successMessage !== undefined && !isFieldInvalid(input)) {
    parts.push(ids.success)
  }

  return parts.length === 0 ? undefined : parts.join(' ')
}

export function fieldAria(input: FieldAriaInput): FieldAriaOutput {
  const ids = fieldIds(input.id)
  const state = fieldState(input)
  const invalid = isFieldInvalid(input)
  const describedBy = fieldDescribedBy(input)
  const disabled = input.isDisabled === true
  const readOnly = input.isReadOnly === true
  const required = input.isRequired === true

  return {
    state,
    isInvalid: invalid,
    ids,
    control: {
      id: input.id,
      'aria-describedby': describedBy,
      'aria-invalid': invalid ? true : undefined,
      'aria-required': required ? true : undefined,
      'aria-busy': state === 'loading' ? true : undefined,
      required,
      disabled,
      readOnly,
    },
    label: { id: ids.label, htmlFor: input.id },
    group: {
      role: 'group',
      'aria-labelledby': ids.label,
      'aria-describedby': describedBy,
    },
    hint: input.hint === undefined ? undefined : { id: ids.hint },
    /*
     * `role="alert"` on the error, `role="status"` on the confirmation. An error
     * has to interrupt - the user is about to submit something that will fail -
     * while a success message can wait for a pause.
     */
    error:
      invalid && input.error !== undefined
        ? { id: ids.error, role: 'alert', 'aria-live': 'assertive' }
        : undefined,
    success:
      !invalid && input.successMessage !== undefined
        ? { id: ids.success, role: 'status', 'aria-live': 'polite' }
        : undefined,
    requiredIndicator: required ? { symbol: '*', text: '(required)' } : undefined,
  }
}

/**
 * The visual half of a field state.
 *
 * Every state that carries meaning carries it twice: a colour and something
 * else. Invalid is a red border *and* an icon *and* a message; success is a
 * green border *and* a tick *and* a message; disabled is a dimmed surface *and*
 * the native `disabled` attribute. The `icon` field is what makes the "and" a
 * decision this module owns rather than something a component might forget.
 */
export type FieldStatusIcon = 'error' | 'success' | 'none'

export interface FieldControlStyle {
  readonly bg: string
  readonly borderColor: string
  readonly color: string
  readonly icon: FieldStatusIcon
  readonly transition: string
}

export function fieldControlStyle(state: FieldState): FieldControlStyle {
  const transition = transitionFor('border-color', 'fast')

  switch (state) {
    case 'disabled':
      return {
        bg: componentTokens.field.disabledBg,
        borderColor: componentTokens.field.disabledBorder,
        color: componentTokens.field.disabledFg,
        icon: 'none',
        transition,
      }
    case 'readOnly':
      /*
       * Read-only is not disabled: the value is still selectable, copyable and
       * focusable, so it keeps normal text colour and only loses the editable
       * surface.
       */
      return {
        bg: componentTokens.workspace.toolbarBg,
        borderColor: componentTokens.field.border,
        color: componentTokens.field.fg,
        icon: 'none',
        transition,
      }
    case 'invalid':
      return {
        bg: componentTokens.field.bg,
        borderColor: componentTokens.field.invalidBorder,
        color: componentTokens.field.fg,
        icon: 'error',
        transition,
      }
    case 'success':
      return {
        bg: componentTokens.field.bg,
        borderColor: componentTokens.feedback.successFg,
        color: componentTokens.field.fg,
        icon: 'success',
        transition,
      }
    case 'loading':
    case 'default':
    default:
      return {
        bg: componentTokens.field.bg,
        borderColor: componentTokens.field.border,
        color: componentTokens.field.fg,
        icon: 'none',
        transition,
      }
  }
}

/**
 * What a checkbox, radio or switch inherits from the `Field` around it.
 *
 * Deliberately not the id, and not `aria-describedby`. A field can hold several
 * selection controls, and handing each of them the field's id would produce
 * duplicate ids and a label pointing at whichever one the browser found first.
 * The set is described once, on the group wrapper; each control keeps its own
 * label and its own generated id.
 */
export function selectionControlAria(aria: FieldAriaOutput | undefined) {
  if (aria === undefined) {
    return { disabled: false, 'aria-invalid': undefined, state: 'default' } as const
  }

  return {
    disabled: aria.control.disabled,
    'aria-invalid': aria.control['aria-invalid'],
    state: aria.state,
  } as const
}
