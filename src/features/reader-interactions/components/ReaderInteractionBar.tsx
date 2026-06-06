import { HStack, Text } from '@chakra-ui/react'
import { ReaderInteractionState } from '../reader-interactions.types'
import HeartButton from './HeartButton'
import ShareButton from './ShareButton'

interface ReaderInteractionBarProps {
  state: ReaderInteractionState | null
  isHeartLoading?: boolean
  isShareLoading?: boolean
  onToggleHeart: () => void
  onShare: () => void
}

const ReaderInteractionBar = ({
  state,
  isHeartLoading = false,
  isShareLoading = false,
  onToggleHeart,
  onShare,
}: ReaderInteractionBarProps) => (
  <HStack spacing={3} align="center" flexWrap="wrap" role="group" aria-label="Reader interactions">
    {state ? (
      <HeartButton
        heartCount={state.heartCount}
        viewerHasHearted={state.viewerHasHearted}
        canHeart={state.canHeart}
        isLoading={isHeartLoading}
        onToggle={onToggleHeart}
      />
    ) : (
      <Text color="text.tertiary" fontSize="sm">
        Reactions unavailable
      </Text>
    )}
    <ShareButton isLoading={isShareLoading} onShare={onShare} />
  </HStack>
)

export default ReaderInteractionBar
