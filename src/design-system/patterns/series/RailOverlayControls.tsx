/**
 * Horizon Design System v2 - the rail's overlay arrows.
 *
 * `dsv2.5.2` acceptance 2: circular and translucent.
 *
 * The accessibility contract is not reinvented here - `railControlAria` from
 * the navigation primitives supplies the label, the disabled state and the
 * glyph rotation, exactly as `RailControl` uses it. What differs is the surface:
 * `RailControl` is an opaque button that sits beside a rail, and these sit *on*
 * one, over the cards, which is why they tint rather than cover. The style is
 * `railOverlayControlStyle`, and `rail.test.ts` derives the translucency from
 * the token rather than trusting the name.
 *
 * They hide where there is no hover-capable pointer. A touch rail already
 * scrolls with a finger, and two discs floating over the first and last card
 * there would cover content to offer something the reader already has.
 */

import { type MouseEvent, type PointerEvent } from 'react'
import { Box } from '@chakra-ui/react'
import { FiChevronRight } from 'react-icons/fi'

import { transitionFor } from '../../../theme/tokens'
import { railControlAria, type RailDirection } from '../../components/navigation'
import { railOverlayControlStyle } from './rail.logic'

export interface RailOverlayControlsProps {
  onPrevious: () => void
  onNext: () => void
  canScrollPrevious: boolean
  canScrollNext: boolean
  /** Plural noun completing the label: "Next Series". */
  itemLabel?: string
}

interface OverlayArrowProps {
  direction: RailDirection
  onActivate: () => void
  isDisabled: boolean
  itemLabel?: string
}

function OverlayArrow({ direction, onActivate, isDisabled, itemLabel }: OverlayArrowProps) {
  const aria = railControlAria(direction, { isDisabled, itemLabel })
  const style = railOverlayControlStyle()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault()

      return
    }

    onActivate()
  }

  return (
    <Box
      as="button"
      type="button"
      aria-label={aria['aria-label']}
      disabled={aria.disabled}
      onClick={handleClick}
      display="inline-grid"
      placeItems="center"
      width={style.size}
      height={style.size}
      borderRadius={style.borderRadius}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={style.borderColor}
      bg={style.bg}
      color={style.color}
      transition={`${transitionFor('background-color', 'fast')}, ${transitionFor('color', 'fast')}`}
      _hover={{ bg: style.hoverBg }}
      _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
      /*
       * The arrows sit above the rail's cards, so they need to be out of the
       * drag gesture's way: a press that starts on an arrow is a press on a
       * button, not the beginning of a throw.
       */
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => event.stopPropagation()}
    >
      <Box as={FiChevronRight} aria-hidden="true" transform={`rotate(${aria.rotate})`} />
    </Box>
  )
}

/**
 * The pair, positioned over the rail's leading and trailing edges.
 *
 * Neither arrow disappears at the end of the rail; they disable. A control that
 * vanished would move the other one under the pointer mid-gesture, which is the
 * one thing a rail control must never do.
 */
export function RailOverlayControls({
  onPrevious,
  onNext,
  canScrollPrevious,
  canScrollNext,
  itemLabel,
}: RailOverlayControlsProps) {
  return (
    <Box
      aria-hidden={false}
      position="absolute"
      inset={0}
      display={{ base: 'none', md: 'flex' }}
      sx={{ '@media (hover: none)': { display: 'none' } }}
      alignItems="center"
      justifyContent="space-between"
      pointerEvents="none"
    >
      <Box pointerEvents="auto">
        <OverlayArrow
          direction="previous"
          onActivate={onPrevious}
          isDisabled={!canScrollPrevious}
          itemLabel={itemLabel}
        />
      </Box>
      <Box pointerEvents="auto">
        <OverlayArrow
          direction="next"
          onActivate={onNext}
          isDisabled={!canScrollNext}
          itemLabel={itemLabel}
        />
      </Box>
    </Box>
  )
}
