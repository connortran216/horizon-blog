/**
 * What the reader thought, under the article.
 *
 * Under it, and nowhere else - `readerSlotFor` in the design system's
 * `reader.logic.ts` resolves reactions and sharing to the `feedback` region,
 * and `ReaderFrame` has no slot between the opening metadata and the prose that
 * this row could be passed into. A reader who has not read the article has no
 * reaction to give.
 *
 * The row is the shape `ReactionBar` draws - a bordered feedback section, the
 * reaction, the jump to the discussion, sharing - built here rather than from
 * that pattern because the share control has to keep the feature's single
 * `onShare` contract. See `ShareButton` for why.
 *
 * The two forthcoming actions stay, disabled and named: they are the product's
 * statement about what is coming. What changed is that they no longer carry
 * hand-written `44px`/`52px` boxes and an invented `0.62` disabled opacity, and
 * that a reader who cannot react is now told why rather than being handed a
 * dead control with no explanation.
 */

import { Box } from '@chakra-ui/react'
import { IconType } from 'react-icons'
import { FiMessageCircle, FiMoreHorizontal, FiRepeat } from 'react-icons/fi'

import { ActionLink, IconButton, Text, reactionUnavailableNotice } from '../../../design-system'
import { componentTokens, space } from '../../../theme/tokens'
import { ReaderInteractionState, ReaderShareMethod } from '../reader-interactions.types'
import HeartButton from './HeartButton'
import ShareButton from './ShareButton'

interface ReaderInteractionBarProps {
  state: ReaderInteractionState | null
  isHeartLoading?: boolean
  isShareLoading?: boolean
  /** Whether a reader who cannot react is told to sign in or told it is off. */
  isAuthenticated?: boolean
  onToggleHeart: () => void
  onShare: (method: ReaderShareMethod) => void
}

interface UnavailableIconActionProps {
  label: string
  icon: IconType
}

const UnavailableIconAction = ({ label, icon: Icon }: UnavailableIconActionProps) => (
  <IconButton label={label} icon={<Icon />} isDisabled />
)

const ReaderInteractionBar = ({
  state,
  isHeartLoading = false,
  isShareLoading = false,
  isAuthenticated = false,
  onToggleHeart,
  onShare,
}: ReaderInteractionBarProps) => {
  const canHeart = state?.canHeart ?? false

  return (
    <Box
      as="section"
      aria-label="Reader interactions"
      display="flex"
      flexDirection="column"
      gap={space[2]}
      paddingBlock={space[6]}
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor={componentTokens.card.border}
    >
      <Box display="flex" flexWrap="wrap" alignItems="center" gap={space[4]}>
        <HeartButton
          heartCount={state?.heartCount ?? 0}
          viewerHasHearted={state?.viewerHasHearted ?? false}
          canHeart={canHeart}
          isLoading={isHeartLoading}
          onToggle={onToggleHeart}
        />

        <ActionLink
          href="#comments"
          underline="hover"
          iconStart={<FiMessageCircle aria-hidden="true" />}
          aria-label="Go to comments"
          color="text.secondary"
        >
          Comments
        </ActionLink>

        <UnavailableIconAction label="Repost is not available yet" icon={FiRepeat} />
        <ShareButton isLoading={isShareLoading} onShare={onShare} />
        <UnavailableIconAction label="More actions are not available yet" icon={FiMoreHorizontal} />
      </Box>

      {!canHeart ? (
        <Text as="p" recipe="metadata">
          {reactionUnavailableNotice(isAuthenticated)}
        </Text>
      ) : null}
    </Box>
  )
}

export default ReaderInteractionBar
