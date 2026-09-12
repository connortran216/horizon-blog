import { forwardRef, type ReactNode } from 'react'
import { Radio as ChakraRadio, type RadioProps as ChakraRadioProps } from '@chakra-ui/react'

import { componentTokens, space } from '../../../theme/tokens'
import { controlSizing } from '../actions/control.logic'
import { selectionControlAria } from './field.logic'
import { useFieldAria } from './FieldContext'

export interface RadioProps extends Omit<
  ChakraRadioProps,
  'isInvalid' | 'isDisabled' | 'children' | 'size'
> {
  /** The visible label for this option. */
  children: ReactNode
  isDisabled?: boolean
  isInvalid?: boolean
}

/**
 * One option in a radio set.
 *
 * A radio only means something as part of a set, and the set is what needs the
 * name: wrap them in `<Field control="group">`, which supplies `role="group"`
 * and `aria-labelledby`, and in Chakra's `RadioGroup` for the shared `name` and
 * value. A lone Radio outside both is a checkbox with the wrong shape.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { children, isDisabled, isInvalid, ...props },
  ref,
) {
  const field = useFieldAria()
  const inherited = selectionControlAria(field)

  return (
    <ChakraRadio
      ref={ref}
      isDisabled={isDisabled ?? inherited.disabled}
      isInvalid={isInvalid ?? inherited['aria-invalid'] === true}
      alignItems="center"
      minH={controlSizing('md').minH}
      gap={space[1]}
      textStyle="body"
      color={componentTokens.field.fg}
      {...props}
    >
      {children}
    </ChakraRadio>
  )
})
