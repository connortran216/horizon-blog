import { Button, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { IconType } from 'react-icons'
import { FiMessageCircle, FiMoreHorizontal, FiRepeat } from 'react-icons/fi'
import { ReaderInteractionState, ReaderShareMethod } from '../reader-interactions.types'
import HeartButton from './HeartButton'
import ShareButton from './ShareButton'

interface ReaderInteractionBarProps {
  state: ReaderInteractionState | null
  isHeartLoading?: boolean
  isShareLoading?: boolean
  onToggleHeart: () => void
  onShare: (method: ReaderShareMethod) => void
}

interface UnavailableIconActionProps {
  label: string
  icon: IconType
}

const UnavailableIconAction = ({ label, icon }: UnavailableIconActionProps) => (
  <Button
    variant="ghost"
    minW={{ base: '44px', md: '52px' }}
    h={{ base: '52px', md: '56px' }}
    px={2}
    py={2}
    borderRadius="full"
    color="text.tertiary"
    cursor="not-allowed"
    isDisabled
    aria-label={label}
    title={label}
    _disabled={{
      opacity: 0.62,
      cursor: 'not-allowed',
    }}
  >
    <Icon as={icon} boxSize={{ base: 6, md: 7 }} aria-hidden="true" />
  </Button>
)

const ReaderInteractionBar = ({
  state,
  isHeartLoading = false,
  isShareLoading = false,
  onToggleHeart,
  onShare,
}: ReaderInteractionBarProps) => (
  <VStack spacing={2} align="center" role="group" aria-label="Reader interactions">
    <HStack spacing={{ base: 6, md: 12 }} align="center" justify="center" w="full" flexWrap="wrap">
      {state ? (
        <HeartButton
          heartCount={state.heartCount}
          viewerHasHearted={state.viewerHasHearted}
          canHeart={state.canHeart}
          isLoading={isHeartLoading}
          onToggle={onToggleHeart}
        />
      ) : (
        <HeartButton
          heartCount={0}
          viewerHasHearted={false}
          canHeart={false}
          isLoading={isHeartLoading}
          onToggle={onToggleHeart}
        />
      )}
      <UnavailableIconAction label="Comments are not available yet" icon={FiMessageCircle} />
      <UnavailableIconAction label="Repost is not available yet" icon={FiRepeat} />
      <ShareButton isLoading={isShareLoading} onShare={onShare} />
      <UnavailableIconAction label="More actions are not available yet" icon={FiMoreHorizontal} />
    </HStack>
    {!state ? (
      <Text color="text.tertiary" fontSize="sm">
        Reactions unavailable
      </Text>
    ) : null}
  </VStack>
)

export default ReaderInteractionBar
