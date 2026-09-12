import { forwardRef, type ReactNode } from 'react'
import {
  Checkbox as ChakraCheckbox,
  type CheckboxProps as ChakraCheckboxProps,
} from '@chakra-ui/react'

import { componentTokens, space } from '../../../theme/tokens'
import { controlSizing } from '../actions/control.logic'
import { selectionControlAria } from './field.logic'
import { useFieldAria } from './FieldContext'

export interface CheckboxProps extends Omit<
  ChakraCheckboxProps,
  'isInvalid' | 'isDisabled' | 'children' | 'size'
> {
  /** The visible label. A checkbox with no label has no accessible name. */
  children: ReactNode
  isDisabled?: boolean
  isInvalid?: boolean
}

/**
 * A native checkbox with its label.
 *
 * Chakra renders a real `input[type=checkbox]` behind the drawn box, so the
 * space bar, form submission and every assistive technology work without help.
 * The label is the whole row, which is also what gives it a 44px tap target on
 * a phone even though the box itself is smaller.
 *
 * Inside a `Field` it inherits only the disabled and invalid state. It never
 * inherits the field's id: a field can hold ten checkboxes, and ten controls
 * sharing one id is ten broken labels.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { children, isDisabled, isInvalid, ...props },
  ref,
) {
  const field = useFieldAria()
  const inherited = selectionControlAria(field)

  return (
    <ChakraCheckbox
      ref={ref}
      isDisabled={isDisabled ?? inherited.disabled}
      isInvalid={isInvalid ?? inherited['aria-invalid'] === true}
      alignItems="center"
      minH={controlSizing('md').minH}
      gap={space[1]}
      textStyle="body"
      color={componentTokens.field.fg}
      sx={{
        // The label wraps rather than truncating: a long consent sentence must
        // stay readable at 375px.
        '& .chakra-checkbox__label': { marginInlineStart: 0 },
      }}
      {...props}
    >
      {children}
    </ChakraCheckbox>
  )
})
