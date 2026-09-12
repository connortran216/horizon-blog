import { forwardRef, useId, type ReactNode } from 'react'
import {
  Box,
  Switch as ChakraSwitch,
  type SwitchProps as ChakraSwitchProps,
} from '@chakra-ui/react'

import { componentTokens, space } from '../../../theme/tokens'
import { controlSizing } from '../actions/control.logic'
import { selectionControlAria } from './field.logic'
import { useFieldAria } from './FieldContext'

export interface SwitchProps extends Omit<
  ChakraSwitchProps,
  'isInvalid' | 'isDisabled' | 'children' | 'size' | 'id'
> {
  /** The visible label. It names the setting, not the state: "Public profile". */
  label: ReactNode
  /** Short description of what the setting does, under the label. */
  hint?: ReactNode
  id?: string
  isDisabled?: boolean
}

/**
 * An immediate on/off setting.
 *
 * A switch applies as soon as it is flipped. A checkbox waits for a submit
 * button. Choosing between them by which one looks nicer is how a settings page
 * ends up saving on one row and not on the next.
 *
 * The label names the setting rather than the state - "Public profile", never
 * "Make profile public" - so it reads correctly in both positions. The state
 * itself is carried by the control, not by the wording.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, hint, id, isDisabled, ...props },
  ref,
) {
  const generatedId = useId()
  const switchId = id ?? generatedId
  const hintId = `${switchId}-hint`
  const field = useFieldAria()
  const inherited = selectionControlAria(field)

  return (
    <Box display="flex" alignItems="flex-start" gap={space[3]} minH={controlSizing('md').minH}>
      <ChakraSwitch
        ref={ref}
        id={switchId}
        isDisabled={isDisabled ?? inherited.disabled}
        aria-describedby={hint === undefined ? undefined : hintId}
        mt={space[1]}
        {...props}
      />
      <Box display="flex" flexDirection="column" gap={space[1]} minW="0">
        <Box
          as="label"
          htmlFor={switchId}
          textStyle="body"
          color={componentTokens.field.fg}
          cursor="pointer"
        >
          {label}
        </Box>
        {hint === undefined ? null : (
          <Box id={hintId} textStyle="meta" color={componentTokens.field.hint}>
            {hint}
          </Box>
        )}
      </Box>
    </Box>
  )
})
