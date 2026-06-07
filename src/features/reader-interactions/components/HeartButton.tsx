import { Button, Icon, Text } from '@chakra-ui/react'
import { FiHeart } from 'react-icons/fi'

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
}: HeartButtonProps) => (
  <Button
    variant="ghost"
    minW={{ base: '44px', md: '52px' }}
    h={{ base: '52px', md: '56px' }}
    px={2}
    py={2}
    flexDirection="column"
    gap={1}
    borderRadius="full"
    color={viewerHasHearted ? 'red.500' : 'text.secondary'}
    _hover={{
      bg: 'action.subtle',
      color: viewerHasHearted ? 'red.600' : 'text.primary',
    }}
    isDisabled={!canHeart}
    isLoading={isLoading}
    onClick={onToggle}
    aria-label={viewerHasHearted ? 'Remove heart from this blog' : 'Heart this blog'}
  >
    <Icon
      as={FiHeart}
      boxSize={{ base: 6, md: 7 }}
      fill={viewerHasHearted ? 'currentColor' : 'none'}
      aria-hidden="true"
    />
    <Text as="span" fontSize="xs" lineHeight="1" color="text.tertiary">
      {heartCount}
    </Text>
  </Button>
)

export default HeartButton
