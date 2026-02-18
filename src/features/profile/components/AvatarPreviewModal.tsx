import {
  Avatar,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'

interface AvatarPreviewModalProps {
  isOpen: boolean
  profileName: string
  avatarSrc?: string
  onClose: () => void
}

const AvatarPreviewModal = ({
  isOpen,
  profileName,
  avatarSrc,
  onClose,
}: AvatarPreviewModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Profile Avatar</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justify="center" py={4}>
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={`${profileName} avatar`}
                maxH="60vh"
                borderRadius="xl"
                objectFit="contain"
              />
            ) : (
              <Avatar size="2xl" name={profileName} />
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AvatarPreviewModal
