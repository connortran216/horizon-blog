import { forwardRef } from 'react'
import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
} from '@chakra-ui/react'

import { fieldControlStyle } from './field.logic'
import { useFieldAria } from './FieldContext'

export interface TextareaProps extends Omit<
  ChakraTextareaProps,
  'size' | 'isInvalid' | 'isDisabled' | 'isReadOnly' | 'variant' | 'resize'
> {
  /**
   * Vertical only. Horizontal resize lets a user drag a textarea wider than its
   * container and push the whole page sideways.
   */
  resize?: 'vertical' | 'none'
}

/**
 * A multi-line text input. Same context wiring as `Input`.
 *
 * It grows downward and never sideways, and it has no fixed height cap: a
 * comment box holding three paragraphs of Vietnamese should scroll inside
 * itself, not clip.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { resize = 'vertical', ...props },
  ref,
) {
  const aria = useFieldAria()
  const style = fieldControlStyle(aria?.state ?? 'default')

  return (
    <ChakraTextarea
      ref={ref}
      resize={resize}
      bg={style.bg}
      borderColor={style.borderColor}
      transition={style.transition}
      {...(aria?.control ?? {})}
      {...props}
    />
  )
})
