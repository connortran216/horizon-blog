import { Button } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

interface ShareButtonProps {
  isLoading?: boolean
  onShare: () => void
}

const ShareButton = ({ isLoading = false, onShare }: ShareButtonProps) => (
  <Button
    size="sm"
    variant="outline"
    borderColor="border.subtle"
    bg="bg.secondary"
    color="text.primary"
    _hover={{ bg: 'action.subtle', borderColor: 'action.primary' }}
    isLoading={isLoading}
    onClick={onShare}
    aria-label="Share this blog"
    leftIcon={<ExternalLinkIcon />}
  >
    Share
  </Button>
)

export default ShareButton
