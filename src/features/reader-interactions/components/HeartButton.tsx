import { Button } from '@chakra-ui/react'

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
    size="sm"
    variant={viewerHasHearted ? 'solid' : 'outline'}
    colorScheme={viewerHasHearted ? 'red' : undefined}
    borderColor="border.subtle"
    bg={viewerHasHearted ? 'red.500' : 'bg.secondary'}
    color={viewerHasHearted ? 'white' : 'text.primary'}
    _hover={{
      bg: viewerHasHearted ? 'red.600' : 'action.subtle',
      borderColor: 'action.primary',
    }}
    isDisabled={!canHeart}
    isLoading={isLoading}
    onClick={onToggle}
    aria-label={viewerHasHearted ? 'Remove heart from this blog' : 'Heart this blog'}
    leftIcon={<span aria-hidden="true">{viewerHasHearted ? '♥' : '♡'}</span>}
  >
    {heartCount}
  </Button>
)

export default HeartButton
