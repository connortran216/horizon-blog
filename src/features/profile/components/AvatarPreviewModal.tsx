/**
 * The avatar at full size.
 *
 * Chakra's `Modal` again - there is no dialog primitive in the design system -
 * with the picture inside it drawn by `ResponsiveImage`, so a source that fails
 * here reports the failure and offers a retry rather than collapsing to a broken
 * image icon. `contain` because this is the whole picture being looked at, not
 * a cover filling a frame.
 *
 * There is nothing to preview when there is no picture, so the dialog cannot be
 * opened without one; the caller disables the control that opens it. The
 * fallback portrait is kept for the case where the source disappears between the
 * two.
 */

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'

import { Avatar, ResponsiveImage, Stack } from '../../../design-system'
import { space } from '../../../theme/tokens'

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
        <ModalHeader>Profile picture</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack gap={4} alignItems="center" paddingBlock={space[4]}>
            {avatarSrc ? (
              <ResponsiveImage
                aspectRatio="1 / 1"
                fit="contain"
                src={avatarSrc}
                alt={`${profileName}'s profile picture`}
                task="the profile picture"
                loading="eager"
              />
            ) : (
              <Avatar name={profileName} size="lg" />
            )}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AvatarPreviewModal
