import { forwardRef, type MouseEvent } from 'react'
import { Box } from '@chakra-ui/react'
import { FiChevronRight } from 'react-icons/fi'

import { componentTokens, radii, transitionFor } from '../../../theme/tokens'
import { railControlAria, type RailDirection } from './navigation.logic'

export interface RailControlProps {
  direction: RailDirection
  onActivate: () => void
  isDisabled?: boolean
  /**
   * Plural noun for what the rail holds - "posts", "parts". It completes the
   * label: "Next posts".
   */
  itemLabel?: string
  /**
   * Hide the control where the pointer cannot hover. A touch rail already
   * scrolls with a finger, and an overlay button there only covers content.
   */
  hideWithoutPointer?: boolean
}

/**
 * An overlay control for a horizontal rail.
 *
 * It is an addition to native scrolling, never a replacement: the rail itself
 * stays scrollable by touch, trackpad and keyboard, and this control exists for
 * a mouse user who has neither of the first two. That is why it hides under
 * `(hover: none)` rather than being drawn everywhere.
 *
 * At the end of the rail it disables rather than disappears. A control that
 * vanished would let the rail's own layout shift under the pointer mid-gesture.
 */
export const RailControl = forwardRef<HTMLButtonElement, RailControlProps>(function RailControl(
  { direction, onActivate, isDisabled = false, itemLabel, hideWithoutPointer = true },
  ref,
) {
  const aria = railControlAria(direction, { isDisabled, itemLabel })

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault()

      return
    }

    onActivate()
  }

  return (
    <Box
      ref={ref}
      as="button"
      type="button"
      aria-label={aria['aria-label']}
      disabled={aria.disabled}
      onClick={handleClick}
      display={hideWithoutPointer ? { base: 'none', md: 'inline-grid' } : 'inline-grid'}
      sx={hideWithoutPointer ? { '@media (hover: none)': { display: 'none' } } : undefined}
      placeItems="center"
      minW={componentTokens.control.minTouchTarget}
      minH={componentTokens.control.minTouchTarget}
      borderRadius={radii.tag}
      borderWidth="1px"
      borderStyle="solid"
      borderColor="border.subtle"
      bg="bg.surface"
      color="text.secondary"
      boxShadow="card"
      transition={`${transitionFor('background-color', 'fast')}, ${transitionFor('color', 'fast')}`}
      _hover={{ bg: 'bg.subtle', color: 'text.primary' }}
      _disabled={{
        color: componentTokens.control.disabledFg,
        borderColor: 'border.disabled',
        cursor: 'not-allowed',
      }}
    >
      <Box as={FiChevronRight} aria-hidden="true" transform={`rotate(${aria.rotate})`} />
    </Box>
  )
})
