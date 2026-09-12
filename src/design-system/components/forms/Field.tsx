import { useId, type ReactNode } from 'react'
import { Box, VisuallyHidden } from '@chakra-ui/react'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

import { componentTokens, space } from '../../../theme/tokens'
import { fieldAria, type FieldAriaInput } from './field.logic'
import { FieldContext } from './FieldContext'

export interface FieldProps extends Omit<FieldAriaInput, 'id'> {
  /**
   * The visible label. Required - a field without one has no name, and making
   * that a type error is cheaper than finding it in an audit.
   */
  label: string
  /**
   * Hide the label visually while keeping it in the accessibility tree. For a
   * search box whose purpose is obvious from context, not as a layout shortcut.
   */
  labelHidden?: boolean
  /** Supply an id to match an existing form; one is generated otherwise. */
  id?: string
  /**
   * `single` wraps one native control and labels it with `label for`. `group`
   * wraps a set - radios, a row of checkboxes - where there is no single control
   * to point at, and labels the set with `role="group"` plus `aria-labelledby`.
   */
  control?: 'single' | 'group'
  children: ReactNode
}

/**
 * Label, hint, validation message and the control they describe.
 *
 * The control is a child, and it picks the wiring up from context rather than
 * from props, so `aria-describedby` and `aria-invalid` cannot be attached to one
 * control in a form and forgotten on the next.
 *
 * Errors are announced, not merely shown: the message carries `role="alert"`, so
 * it interrupts when it appears. It is also never colour alone - the message is
 * text, it is preceded by an icon, and the control is marked `aria-invalid`.
 */
export function Field({
  label,
  labelHidden = false,
  id,
  control = 'single',
  hint,
  error,
  successMessage,
  isRequired,
  isDisabled,
  isReadOnly,
  isInvalid,
  isLoading,
  children,
}: FieldProps) {
  const generatedId = useId()
  const aria = fieldAria({
    id: id ?? generatedId,
    hint,
    error,
    successMessage,
    isRequired,
    isDisabled,
    isReadOnly,
    isInvalid,
    isLoading,
  })

  /*
   * A group label is a `span`, not a `label`: `label for` may only point at a
   * form control, and a set of radios is not one. The set is named through
   * `role="group"` and `aria-labelledby` instead.
   */
  const labelStyle = {
    id: aria.label.id,
    display: 'inline-flex',
    alignItems: 'center',
    gap: space[1],
    textStyle: 'meta',
    color: componentTokens.field.label,
  } as const

  const labelText = (
    <>
      {label}
      {aria.requiredIndicator === undefined ? null : (
        <>
          <Box as="span" aria-hidden="true" color={componentTokens.field.invalidText}>
            {aria.requiredIndicator.symbol}
          </Box>
          <VisuallyHidden>{aria.requiredIndicator.text}</VisuallyHidden>
        </>
      )}
    </>
  )

  const labelNode =
    control === 'group' ? (
      <Box as="span" {...labelStyle}>
        {labelText}
      </Box>
    ) : (
      <Box as="label" htmlFor={aria.label.htmlFor} {...labelStyle}>
        {labelText}
      </Box>
    )

  return (
    <FieldContext.Provider value={aria}>
      <Box display="flex" flexDirection="column" gap={space[2]} minW="0">
        {labelHidden ? <VisuallyHidden>{labelNode}</VisuallyHidden> : labelNode}

        {control === 'group' ? (
          <Box
            role={aria.group.role}
            aria-labelledby={aria.group['aria-labelledby']}
            aria-describedby={aria.group['aria-describedby']}
            display="flex"
            flexDirection="column"
            gap={space[2]}
          >
            {children}
          </Box>
        ) : (
          children
        )}

        {aria.hint === undefined ? null : (
          <Box id={aria.hint.id} textStyle="meta" color={componentTokens.field.hint}>
            {hint}
          </Box>
        )}

        {aria.error === undefined ? null : (
          <Box
            id={aria.error.id}
            role={aria.error.role}
            aria-live={aria.error['aria-live']}
            display="flex"
            alignItems="flex-start"
            gap={space[2]}
            textStyle="meta"
            color={componentTokens.field.invalidText}
          >
            <Box as={FiAlertCircle} aria-hidden="true" flexShrink={0} mt={space[1]} />
            {error}
          </Box>
        )}

        {aria.success === undefined ? null : (
          <Box
            id={aria.success.id}
            role={aria.success.role}
            aria-live={aria.success['aria-live']}
            display="flex"
            alignItems="flex-start"
            gap={space[2]}
            textStyle="meta"
            color={componentTokens.feedback.successFg}
          >
            <Box as={FiCheckCircle} aria-hidden="true" flexShrink={0} mt={space[1]} />
            {successMessage}
          </Box>
        )}
      </Box>
    </FieldContext.Provider>
  )
}
