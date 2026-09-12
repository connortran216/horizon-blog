import { forwardRef, type MouseEvent, type ReactNode } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { FiCheck } from 'react-icons/fi'

import { componentTokens, space } from '../../../theme/tokens'
import { chipStyle } from './status.logic'

export interface ChipProps extends Omit<BoxProps, 'onClick' | 'children'> {
  children: ReactNode
  /** Selection state. Supplying it makes the chip a toggle button. */
  isSelected?: boolean
  isDisabled?: boolean
  /** Supplying a handler makes the chip a button. */
  onClick?: (event: MouseEvent<HTMLElement>) => void
}

/**
 * A compact tag or filter.
 *
 * With `onClick` or `isSelected` it is a real `button` carrying `aria-pressed`.
 * Without either it is a `span` - a topic label on a card is not a control, and
 * putting it in the tab order costs a keyboard user a stop for nothing.
 *
 * A selected chip shows a tick as well as the lime surface, so the selection
 * survives greyscale, a hostile display and a reader who cannot separate the
 * two hues.
 */
export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(
  { children, isSelected, isDisabled = false, onClick, ...rest },
  ref,
) {
  const isInteractive = onClick !== undefined || isSelected !== undefined
  const style = chipStyle({ isSelected, isDisabled, isInteractive })

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      event.preventDefault()

      return
    }

    onClick?.(event)
  }

  const shared: BoxProps = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space[1],
    px: style.paddingX,
    minH: style.minHeight,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: style.borderColor,
    borderRadius: style.borderRadius,
    bg: style.bg,
    color: style.color,
    textStyle: 'meta',
    whiteSpace: 'nowrap',
    transition: style.transition,
    ...rest,
  }

  const content = (
    <>
      {style.showSelectedIcon ? <Box as={FiCheck} aria-hidden="true" flexShrink={0} /> : null}
      {children}
    </>
  )

  if (style.element === 'span') {
    return (
      <Box ref={ref} as="span" {...shared}>
        {content}
      </Box>
    )
  }

  return (
    <Box
      ref={ref}
      as="button"
      type="button"
      aria-pressed={style['aria-pressed']}
      disabled={style.disabled}
      onClick={handleClick}
      _hover={isDisabled ? {} : { borderColor: componentTokens.field.hoverBorder }}
      {...shared}
    >
      {content}
    </Box>
  )
})
