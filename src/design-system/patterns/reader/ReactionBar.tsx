/**
 * Horizon Design System v2 - what the reader thought.
 *
 * The reaction, a jump to the discussion, and the share menu, in one row under
 * the article.
 *
 * Under the article, and nowhere else. `dsv2.5.3` acceptance 3 and
 * `readerSlotFor` in `reader.logic.ts` both say so, and the reason is worth
 * repeating here because this is the component somebody will one day be asked
 * to move: the opening metadata answers "should I read this?" and a reader who
 * has not read the article has no reaction to give.
 *
 * A reader who cannot react still sees the count. Hiding the control from a
 * signed-out reader would hide the number with it, and the number is content.
 */

import { Box, VisuallyHidden, type BoxProps } from '@chakra-ui/react'
import { FiHeart, FiMessageCircle } from 'react-icons/fi'

import { componentTokens, space } from '../../../theme/tokens'
import { ActionLink, Button } from '../../components/actions'
import { Text } from '../../components/typography'
import { ShareAction, type ShareActionProps } from './ShareAction'
import { reactionButtonState, reactionUnavailableNotice } from './reaction.logic'

export interface ReactionBarProps extends Omit<BoxProps, 'children' | 'onSelect'> {
  reactionCount: number
  viewerHasReacted: boolean
  canReact: boolean
  isReacting?: boolean
  onToggleReaction: () => void
  /** Whether a signed-out reader is being shown why the control is dead. */
  isAuthenticated?: boolean
  /** Number of comments, for the jump link. Omit to hide the link. */
  commentCount?: number | null
  /** Anchor of the discussion section on this page. */
  discussionHref?: string
  share?: Pick<ShareActionProps, 'url' | 'title' | 'onShare' | 'writeToClipboard'>
}

export function ReactionBar({
  reactionCount,
  viewerHasReacted,
  canReact,
  isReacting = false,
  onToggleReaction,
  isAuthenticated = false,
  commentCount = null,
  discussionHref = '#discussion',
  share,
  ...rest
}: ReactionBarProps) {
  const reaction = reactionButtonState({
    count: reactionCount,
    viewerHasReacted,
    canReact,
    isLoading: isReacting,
  })

  return (
    <Box
      as="section"
      aria-label="Reader feedback"
      display="flex"
      flexDirection="column"
      gap={space[2]}
      paddingBlock={space[6]}
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor={componentTokens.card.border}
      {...rest}
    >
      <Box display="flex" flexWrap="wrap" alignItems="center" gap={space[4]}>
        <Button
          tone="quiet"
          onClick={onToggleReaction}
          isDisabled={reaction.isDisabled}
          isLoading={reaction.isLoading}
          loadingLabel="Saving your reaction"
          aria-label={reaction['aria-label']}
          aria-pressed={reaction['aria-pressed']}
          iconStart={
            <FiHeart aria-hidden="true" fill={reaction.isFilled ? 'currentColor' : 'none'} />
          }
        >
          {/* The digits are decoration: the accessible name already carries the
              count in words, and hearing "24" on its own says nothing. */}
          <Box as="span" aria-hidden="true">
            {reaction.countLabel}
          </Box>
        </Button>

        {commentCount != null ? (
          <ActionLink
            href={discussionHref}
            underline="hover"
            iconStart={<FiMessageCircle aria-hidden="true" />}
            aria-label={`Go to the discussion, ${commentCount} so far`}
            color="text.secondary"
          >
            <Box as="span" aria-hidden="true">
              {commentCount}
            </Box>
          </ActionLink>
        ) : null}

        {share ? <ShareAction {...share} /> : null}
      </Box>

      {reaction.isDisabled ? (
        <Text as="p" recipe="metadata">
          {reactionUnavailableNotice(isAuthenticated)}
        </Text>
      ) : (
        <VisuallyHidden>{reaction.countAnnouncement}</VisuallyHidden>
      )}
    </Box>
  )
}
