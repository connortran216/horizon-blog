import { forwardRef, type ReactNode } from 'react'
import { Select as ChakraSelect, type SelectProps as ChakraSelectProps } from '@chakra-ui/react'

import { componentTokens } from '../../../theme/tokens'
import { controlSizing } from '../actions/control.logic'
import { fieldControlStyle } from './field.logic'
import { useFieldAria } from './FieldContext'

export interface SelectProps extends Omit<
  ChakraSelectProps,
  'size' | 'isInvalid' | 'isDisabled' | 'isReadOnly' | 'variant'
> {
  /** `option` elements. A select with no options is a disabled control. */
  children: ReactNode
  /** Shown as a disabled first option when nothing is chosen yet. */
  placeholder?: string
}

/**
 * A native `select`.
 *
 * Native on purpose: the platform picker is the one control that already works
 * with every screen reader, every mobile keyboard and every voice control
 * system, and a custom listbox that matches it is weeks of work. When a
 * requirement genuinely needs multi-select or search, that is a distinct pattern
 * built on a real combobox - not a prop on this one.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { children, ...props },
  ref,
) {
  const aria = useFieldAria()
  const style = fieldControlStyle(aria?.state ?? 'default')

  return (
    <ChakraSelect
      ref={ref}
      minH={controlSizing('md').minH}
      bg={style.bg}
      borderColor={style.borderColor}
      borderRadius={componentTokens.field.radius}
      transition={style.transition}
      {...(aria?.control ?? {})}
      {...props}
    >
      {children}
    </ChakraSelect>
  )
})
