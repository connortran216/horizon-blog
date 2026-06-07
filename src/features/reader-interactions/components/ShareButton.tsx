import { Button, Icon, Menu, MenuButton, MenuItem, MenuList, Portal, Text } from '@chakra-ui/react'
import { FiShare2 } from 'react-icons/fi'
import { ReaderShareMethod } from '../reader-interactions.types'

interface ShareButtonProps {
  isLoading?: boolean
  onShare: (method: ReaderShareMethod) => void
}

const shareOptions: Array<{ method: ReaderShareMethod; label: string }> = [
  { method: 'facebook', label: 'Facebook' },
  { method: 'x', label: 'X' },
  { method: 'linkedin', label: 'LinkedIn' },
  { method: 'copy_link', label: 'Copy link' },
]

const ShareButton = ({ isLoading = false, onShare }: ShareButtonProps) => (
  <Menu placement="top" isLazy>
    <MenuButton
      as={Button}
      variant="ghost"
      minW={{ base: '44px', md: '52px' }}
      h={{ base: '52px', md: '56px' }}
      px={2}
      py={2}
      borderRadius="full"
      color="text.secondary"
      _hover={{ bg: 'action.subtle', color: 'text.primary' }}
      isLoading={isLoading}
      aria-label="Share this blog"
    >
      <Icon as={FiShare2} boxSize={{ base: 6, md: 7 }} aria-hidden="true" />
    </MenuButton>
    <Portal>
      <MenuList bg="bg.elevated" borderColor="border.subtle" boxShadow="xl" py={2}>
        {shareOptions.map((option) => (
          <MenuItem
            key={option.method}
            bg="transparent"
            color="text.primary"
            _hover={{ bg: 'action.subtle' }}
            _focus={{ bg: 'action.subtle' }}
            onClick={() => onShare(option.method)}
          >
            <Text>{option.label}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Portal>
  </Menu>
)

export default ShareButton
