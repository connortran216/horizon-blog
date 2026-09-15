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
    /*
     * The chip itself must carry these three, not only the label inside it.
     * `minWidth: 0` overrides the flex-item default of `auto`, which would
     * otherwise floor the chip at the label's own content width regardless of
     * what the row has left. `maxWidth: '100%'` is the part that actually
     * does the clamping: the chip is `inline-flex`, an auto-width atomic box,
     * and shrink-to-fit sizing alone does not reliably cap such a box to its
     * container when the container is itself a plain (non-flex) parent such
     * as a bare `<li>` - a percentage `max-width` always resolves against the
     * containing block's width, in a flex item or a plain block alike, so the
     * chip can never render wider than the space it was actually given.
     * `overflow: hidden` then keeps that clamp from spilling visibly.
     */
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    ...rest,
  }

  /*
   * The label stays `nowrap` - a tag reads as one token, not a word-wrapped
   * sentence - but it must still be able to give way. `minWidth: 0` plus
   * `overflow: hidden` let this span shrink inside the chip instead of
   * forcing the chip (and everything above it) as wide as the label;
   * `textOverflow: ellipsis` turns that shrink into a truncation instead of a
   * silent clip, and `title` keeps the full label reachable for anyone who
   * cannot read the cut-off text from the pixels alone. Everyday tag text
   * ("Backend", "News") never reaches this path - it only fires once a label
   * is wider than the space a caller actually gives the chip.
   */
  const content = (
    <>
      {style.showSelectedIcon ? <Box as={FiCheck} aria-hidden="true" flexShrink={0} /> : null}
      <Box
        as="span"
        minWidth={0}
        overflow="hidden"
        textOverflow="ellipsis"
        title={typeof children === 'string' ? children : undefined}
      >
        {children}
      </Box>
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
