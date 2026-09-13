/**
 * The reaction control.
 *
 * The design system's `Button` in its quiet tone, with every decision about
 * what it says and whether it can be pressed taken by `reactionButtonState` -
 * the same function `ReactionBar` uses, so the reader page and the gallery
 * cannot drift apart on what "24 reactions" is called.
 *
 * Disabled rather than hidden for a reader who cannot react: the count is
 * content, and removing the control removes the number with it. The digits are
 * `aria-hidden` because the accessible name already carries the count in words
 * - hearing "24" on its own says nothing about what is being counted.
 *
 * The `red.500` / `red.600` pair this used to hard-code is gone. A reaction is
 * the action colour, like every other affirmative control in the system.
 */

import { Box } from '@chakra-ui/react'
import { FiHeart } from 'react-icons/fi'

import { Button, reactionButtonState } from '../../../design-system'

interface HeartButtonProps {
  heartCount: number
  viewerHasHearted: boolean
  canHeart: boolean
  isLoading?: boolean
  onToggle: () => void
}

const HeartButton = ({
  heartCount,
  viewerHasHearted,
  canHeart,
  isLoading = false,
  onToggle,
}: HeartButtonProps) => {
  const reaction = reactionButtonState({
    count: heartCount,
    viewerHasReacted: viewerHasHearted,
    canReact: canHeart,
    isLoading,
  })

  return (
    <Button
      tone="quiet"
      onClick={onToggle}
      isDisabled={reaction.isDisabled}
      isLoading={reaction.isLoading}
      loadingLabel="Saving your reaction"
      aria-label={viewerHasHearted ? 'Remove heart from this blog' : 'Heart this blog'}
      aria-pressed={reaction['aria-pressed']}
      iconStart={<FiHeart aria-hidden="true" fill={reaction.isFilled ? 'currentColor' : 'none'} />}
    >
      <Box as="span" aria-hidden="true">
        {reaction.countLabel}
      </Box>
    </Button>
  )
}

export default HeartButton
