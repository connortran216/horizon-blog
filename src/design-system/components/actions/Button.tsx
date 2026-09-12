import { forwardRef, type MouseEvent, type ReactElement } from 'react'
import { Button as ChakraButton, Spinner, VisuallyHidden } from '@chakra-ui/react'
import type { ButtonProps as ChakraButtonProps } from '@chakra-ui/react'

import { transform } from '../../../theme/tokens'
import {
  buttonVariant,
  controlSizing,
  controlState,
  loadingAnnouncement,
  type ButtonTone,
  type ControlSize,
} from './control.logic'

export interface ButtonProps extends Omit<
  ChakraButtonProps,
  'variant' | 'size' | 'isLoading' | 'isDisabled' | 'isActive' | 'loadingText' | 'spinner'
> {
  /** What the action means. `danger` is the destructive tone. */
  tone?: ButtonTone
  size?: ControlSize
  isDisabled?: boolean
  /** Work is in flight. The button keeps focus and stops accepting clicks. */
  isLoading?: boolean
  /** Announced while loading. Name the task: "Publishing post". */
  loadingLabel?: string
  iconStart?: ReactElement
  iconEnd?: ReactElement
}

/**
 * The system's button. Always a native `button` - `ChakraButton` renders one,
 * and the `as` prop is not exposed, so a Button cannot become a div or quietly
 * become a link. A link that looks like a button is `ActionLink`.
 *
 * Loading is not the same thing as disabled. A disabled button is removed from
 * the tab order, which is correct for an action that cannot be taken and wrong
 * for one that is in progress: the user pressed it a moment ago, so focus is on
 * it, and taking that focus away drops them back to the top of the document.
 * A loading button therefore stays focusable, marks itself `aria-disabled` and
 * `aria-busy`, and swallows its own clicks.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    tone = 'primary',
    size = 'md',
    isDisabled = false,
    isLoading = false,
    loadingLabel,
    iconStart,
    iconEnd,
    onClick,
    children,
    ...rest
  },
  ref,
) {
  const state = controlState({ isDisabled, isLoading })
  const sizing = controlSizing(size)
  const { announcement, role } = loadingAnnouncement(loadingLabel, isLoading)

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
      variant={buttonVariant(tone)}
      minH={sizing.minH}
      px={tone === 'link' ? undefined : sizing.px}
      gap={sizing.gap}
      textStyle={sizing.textStyle}
      disabled={state.disabled}
      aria-disabled={state['aria-disabled']}
      aria-busy={state['aria-busy']}
      onClick={handleClick}
      /*
       * Hover lift is transform-only and capped by the motion token, so a row of
       * buttons does not reflow when the pointer crosses one. Press returns to
       * rest; the theme's own `_active` supplies the 1px push.
       */
      _hover={state.isActivatable ? { transform: `translateY(${transform.hoverLift})` } : {}}
      {...rest}
    >
      {iconStart}
      {children}
      {/* No `speed`: the token source has no spin duration, and inventing one
          here would be a raw value. Chakra's default stands until B1 adds one. */}
      {isLoading ? <Spinner size="sm" aria-hidden="true" /> : iconEnd}
      {announcement === undefined ? null : (
        <VisuallyHidden role={role} aria-live="polite">
          {announcement}
        </VisuallyHidden>
      )}
    </ChakraButton>
  )
})
