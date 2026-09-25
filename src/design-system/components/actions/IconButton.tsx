import { forwardRef, type MouseEvent, type ReactElement } from 'react'
import { Button as ChakraButton, Spinner, VisuallyHidden } from '@chakra-ui/react'
import type { ButtonProps as ChakraButtonProps } from '@chakra-ui/react'

import {
  buttonVariant,
  controlSizing,
  controlState,
  iconButtonDisplay,
  type DisplayValue,
  type ButtonTone,
  type ControlSize,
} from './control.logic'

export interface IconButtonProps extends Omit<
  ChakraButtonProps,
  | 'variant'
  | 'size'
  | 'isLoading'
  | 'isDisabled'
  | 'isActive'
  | 'loadingText'
  | 'spinner'
  | 'children'
  | 'aria-label'
> {
  /**
   * The accessible name. Required, and a real verb phrase - "Copy code", not
   * "copy". An icon has no text, so this is the entire name of the control.
   */
  label: string
  icon: ReactElement
  tone?: ButtonTone
  size?: ControlSize
  isDisabled?: boolean
  isLoading?: boolean
  /** Pressed state for a toggle. Leave undefined for a plain action. */
  isPressed?: boolean
}

/**
 * A square button whose only content is an icon.
 *
 * `label` is a required prop rather than an optional `aria-label`, which is the
 * whole point: an icon button with no accessible name is announced as "button"
 * and is unusable, and that failure is a type error here rather than an audit
 * finding later. The icon itself is hidden from assistive technology, because
 * the label already says what the control does.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    label,
    icon,
    tone = 'quiet',
    size = 'md',
    isDisabled = false,
    isLoading = false,
    isPressed,
    onClick,
    ...rest
  },
  ref,
) {
  const state = controlState({ isDisabled, isLoading })
  const sizing = controlSizing(size)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!state.isActivatable) {
      event.preventDefault()

      return
    }

    onClick?.(event)
  }

  return (
    <ChakraButton
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={isPressed}
      variant={buttonVariant(tone)}
      minH={sizing.minH}
      minW={sizing.minW}
      w={sizing.minW}
      h={sizing.minH}
      px="0"
      disabled={state.disabled}
      aria-disabled={state['aria-disabled']}
      aria-busy={state['aria-busy']}
      onClick={handleClick}
      /* Same rule as `Button`, and for the same reason: hover belongs to a
         control that can be pressed, and its appearance belongs to the theme. */
      {...(state.isActivatable ? {} : { _hover: {} })}
      {...rest}
      display={iconButtonDisplay(rest.display as DisplayValue) as ChakraButtonProps['display']}
    >
      {isLoading ? (
        <Spinner size="sm" aria-hidden="true" />
      ) : (
        <span aria-hidden="true">{icon}</span>
      )}
      {isLoading ? (
        <VisuallyHidden role="status" aria-live="polite">
          {label}
        </VisuallyHidden>
      ) : null}
    </ChakraButton>
  )
})
