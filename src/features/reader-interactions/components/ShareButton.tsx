import { Button, Icon } from '@chakra-ui/react'
import { FiShare2 } from 'react-icons/fi'

interface ShareButtonProps {
  isLoading?: boolean
  onShare: () => void
}

const ShareButton = ({ isLoading = false, onShare }: ShareButtonProps) => (
  <Button
    variant="ghost"
    minW={{ base: '44px', md: '52px' }}
    h={{ base: '52px', md: '56px' }}
    px={2}
    py={2}
    borderRadius="full"
    color="text.secondary"
    _hover={{ bg: 'action.subtle', color: 'text.primary' }}
    isLoading={isLoading}
    onClick={onShare}
    aria-label="Share this blog"
  >
    <Icon as={FiShare2} boxSize={{ base: 6, md: 7 }} aria-hidden="true" />
  </Button>
)

export default ShareButton
