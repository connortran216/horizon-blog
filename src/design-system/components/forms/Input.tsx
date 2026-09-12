import { forwardRef } from 'react'
import { Input as ChakraInput, type InputProps as ChakraInputProps } from '@chakra-ui/react'

import { controlSizing } from '../actions/control.logic'
import { fieldControlStyle } from './field.logic'
import { useFieldAria } from './FieldContext'

export interface InputProps extends Omit<
  ChakraInputProps,
  'size' | 'isInvalid' | 'isDisabled' | 'isReadOnly' | 'variant'
> {
  /**
   * Only for an input used outside a `Field`. Inside one, the label, the id and
   * every state come from the Field and this is ignored.
   */
  'aria-label'?: string
}

/**
 * A single-line text input.
 *
 * Inside a `Field` it takes its id, description, required flag, invalid flag and
 * disabled/read-only state from context - so the wiring is done once, in one
 * place, for every field in the app. Outside a Field it is a bare Chakra input
 * and the caller owns its labelling.
 *
 * The minimum height is the 44px touch target, which also gives a comfortable
 * tap area on a 375px screen where fields run the full width.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const aria = useFieldAria()
  const style = fieldControlStyle(aria?.state ?? 'default')

  return (
    <ChakraInput
      ref={ref}
      minH={controlSizing('md').minH}
      bg={style.bg}
      borderColor={style.borderColor}
      transition={style.transition}
      {...(aria?.control ?? {})}
      {...props}
    />
  )
})
