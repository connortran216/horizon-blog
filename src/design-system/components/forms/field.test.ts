import { describe, expect, it } from 'vitest'

import { componentTokens, semanticColors } from '../../../theme/tokens'
import {
  fieldAria,
  fieldControlStyle,
  fieldDescribedBy,
  fieldIds,
  fieldState,
  isFieldInvalid,
  selectionControlAria,
  type FieldState,
} from './field.logic'

/** dsv2.3.3 acceptance 1: "Every field has a programmatic label." */
describe('field labelling', () => {
  it('points the label at the control it names', () => {
    const aria = fieldAria({ id: 'email' })

    expect(aria.label.htmlFor).toBe('email')
    expect(aria.control.id).toBe('email')
  })

  it('gives the label an id, so a group can be named by it', () => {
    const aria = fieldAria({ id: 'delivery' })

    expect(aria.label.id).toBe('delivery-label')
    expect(aria.group['aria-labelledby']).toBe('delivery-label')
    expect(aria.group.role).toBe('group')
  })

  it('derives every id from the field id, so nothing can collide by accident', () => {
    expect(fieldIds('email')).toEqual({
      label: 'email-label',
      hint: 'email-hint',
      error: 'email-error',
      success: 'email-success',
    })
  })

  it('marks a required field in three ways, none of them the asterisk alone', () => {
    const aria = fieldAria({ id: 'email', isRequired: true })

    expect(aria.control.required).toBe(true)
    expect(aria.control['aria-required']).toBe(true)
    expect(aria.requiredIndicator).toEqual({ symbol: '*', text: '(required)' })
  })

  it('adds no required marker to an optional field', () => {
    expect(fieldAria({ id: 'email' }).requiredIndicator).toBeUndefined()
    expect(fieldAria({ id: 'email' }).control['aria-required']).toBeUndefined()
  })
})

/** dsv2.3.3 acceptance 2: "Errors are announced and not color-only." */
describe('field error wiring', () => {
  it('links the error message to the input', () => {
    const aria = fieldAria({ id: 'email', error: 'Enter an email address' })

    expect(aria.control['aria-describedby']).toBe('email-error')
    expect(aria.error?.id).toBe('email-error')
  })

  it('announces the error with role=alert rather than colour', () => {
    const aria = fieldAria({ id: 'email', error: 'Enter an email address' })

    expect(aria.error?.role).toBe('alert')
    expect(aria.error?.['aria-live']).toBe('assertive')
  })

  it('marks the control invalid whenever there is a message', () => {
    expect(fieldAria({ id: 'email', error: 'Required' }).control['aria-invalid']).toBe(true)
    expect(fieldAria({ id: 'email' }).control['aria-invalid']).toBeUndefined()
  })

  it('refuses to report a field valid while it is showing an error', () => {
    const aria = fieldAria({ id: 'email', error: 'Already registered', isInvalid: false })

    expect(aria.isInvalid).toBe(true)
    expect(aria.state).toBe('invalid')
  })

  it('allows an invalid state with no message, for a form-level failure', () => {
    const aria = fieldAria({ id: 'email', isInvalid: true })

    expect(aria.isInvalid).toBe(true)
    expect(aria.error).toBeUndefined()
    expect(aria.control['aria-describedby']).toBeUndefined()
  })

  it('pairs the invalid colour with an icon, so the state is never colour alone', () => {
    expect(fieldControlStyle('invalid').icon).toBe('error')
    expect(fieldControlStyle('success').icon).toBe('success')
  })

  it('keeps hint, error and success in reading order', () => {
    const describedBy = fieldDescribedBy({
      id: 'email',
      hint: 'We never share it',
      error: 'Already registered',
    })

    expect(describedBy).toBe('email-hint email-error')
  })

  it('describes with the hint alone when nothing has gone wrong', () => {
    expect(fieldDescribedBy({ id: 'email', hint: 'We never share it' })).toBe('email-hint')
  })

  it('leaves aria-describedby off entirely when there is nothing to describe', () => {
    expect(fieldDescribedBy({ id: 'email' })).toBeUndefined()
    expect(fieldAria({ id: 'email' }).control['aria-describedby']).toBeUndefined()
  })

  it('drops the success message while the field is invalid', () => {
    const aria = fieldAria({ id: 'name', error: 'Too short', successMessage: 'Name available' })

    expect(aria.success).toBeUndefined()
    expect(aria.control['aria-describedby']).toBe('name-error')
  })

  it('announces success politely rather than interrupting', () => {
    const aria = fieldAria({ id: 'name', successMessage: 'Name available' })

    expect(aria.success?.role).toBe('status')
    expect(aria.success?.['aria-live']).toBe('polite')
    expect(aria.control['aria-describedby']).toBe('name-success')
  })
})

describe('fieldState precedence', () => {
  const cases: Array<[string, Parameters<typeof fieldState>[0], FieldState]> = [
    ['nothing set', { id: 'f' }, 'default'],
    [
      'disabled beats everything',
      { id: 'f', isDisabled: true, error: 'x', isLoading: true },
      'disabled',
    ],
    ['read-only beats invalid', { id: 'f', isReadOnly: true, error: 'x' }, 'readOnly'],
    ['invalid beats loading', { id: 'f', error: 'x', isLoading: true }, 'invalid'],
    ['loading beats success', { id: 'f', isLoading: true, successMessage: 'ok' }, 'loading'],
    ['success is the weakest state', { id: 'f', successMessage: 'ok' }, 'success'],
  ]

  for (const [name, input, expected] of cases) {
    it(name, () => {
      expect(fieldState(input)).toBe(expected)
    })
  }

  it('reports a disabled field as disabled, not as busy', () => {
    const aria = fieldAria({ id: 'f', isDisabled: true, isLoading: true })

    expect(aria.control.disabled).toBe(true)
    expect(aria.control['aria-busy']).toBeUndefined()
  })

  it('marks a loading field busy without disabling it', () => {
    const aria = fieldAria({ id: 'f', isLoading: true })

    expect(aria.control['aria-busy']).toBe(true)
    expect(aria.control.disabled).toBe(false)
  })

  it('keeps a read-only field editable to the keyboard but not to the caret', () => {
    const aria = fieldAria({ id: 'f', isReadOnly: true })

    expect(aria.control.readOnly).toBe(true)
    expect(aria.control.disabled).toBe(false)
  })

  it('never derives invalid from disabled or read-only', () => {
    expect(isFieldInvalid({ id: 'f', isDisabled: true })).toBe(false)
    expect(isFieldInvalid({ id: 'f', isReadOnly: true })).toBe(false)
  })
})

describe('fieldControlStyle', () => {
  const states: FieldState[] = ['default', 'disabled', 'readOnly', 'invalid', 'loading', 'success']

  it('resolves every state to paired semantic roles, never a raw value', () => {
    for (const state of states) {
      const style = fieldControlStyle(state)

      expect(Object.keys(semanticColors)).toContain(style.bg)
      expect(Object.keys(semanticColors)).toContain(style.borderColor)
      expect(Object.keys(semanticColors)).toContain(style.color)
    }
  })

  it('shows an icon for exactly the two states that carry a verdict', () => {
    const withIcon = states.filter((state) => fieldControlStyle(state).icon !== 'none')

    expect(withIcon).toEqual(['invalid', 'success'])
  })

  it('dims a disabled field and keeps a read-only one legible', () => {
    expect(fieldControlStyle('disabled').color).toBe(componentTokens.field.disabledFg)
    expect(fieldControlStyle('readOnly').color).toBe(componentTokens.field.fg)
  })

  it('leaves a loading field looking exactly like a resting one', () => {
    expect(fieldControlStyle('loading')).toEqual(fieldControlStyle('default'))
  })

  it('uses the field invalid border, which the theme also keys _invalid off', () => {
    expect(fieldControlStyle('invalid').borderColor).toBe(componentTokens.field.invalidBorder)
  })
})

describe('selectionControlAria', () => {
  it('gives a standalone control nothing to inherit', () => {
    expect(selectionControlAria(undefined)).toEqual({
      disabled: false,
      'aria-invalid': undefined,
      state: 'default',
    })
  })

  it('passes down the disabled and invalid state of the surrounding field', () => {
    const inherited = selectionControlAria(fieldAria({ id: 'topics', error: 'Pick one' }))

    expect(inherited['aria-invalid']).toBe(true)
    expect(inherited.state).toBe('invalid')
  })

  it('never passes down the field id, so a set of radios keeps distinct ids', () => {
    const inherited = selectionControlAria(fieldAria({ id: 'topics', hint: 'Pick any' }))

    expect(Object.keys(inherited)).toEqual(['disabled', 'aria-invalid', 'state'])
  })

  it('never passes down aria-describedby, which belongs on the group', () => {
    const aria = fieldAria({ id: 'topics', hint: 'Pick any' })

    expect(Object.keys(selectionControlAria(aria))).not.toContain('aria-describedby')
    expect(aria.group['aria-describedby']).toBe('topics-hint')
  })
})

/**
 * Long labels and small screens: neither is provable without a DOM. What is
 * provable is that nothing in the wiring depends on the label being short - no
 * id is derived from the label text, and no truncation decision is made here.
 * The visual pass at 375px belongs to the B6 gallery.
 */
describe('long content', () => {
  it('derives ids from the field id, never from the label text', () => {
    const long = 'Your full legal name exactly as it appears on the identity document issued to you'
    const aria = fieldAria({ id: 'full-name', hint: long, error: long })

    expect(aria.control['aria-describedby']).toBe('full-name-hint full-name-error')
  })
})
