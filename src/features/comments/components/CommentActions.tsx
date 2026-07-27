import { useRef } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  HStack,
  useDisclosure,
} from '@chakra-ui/react'
import { Comment } from '../comments.types'

interface CommentActionsProps {
  comment: Comment
  isLoading: boolean
  onReply: () => void
  onEdit: () => void
  onRemove: () => Promise<void>
}

const CommentActions = ({
  comment,
  isLoading,
  onReply,
  onEdit,
  onRemove,
}: CommentActionsProps) => {
  const dialog = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)

  const handleRemove = async () => {
    try {
      await onRemove()
      dialog.onClose()
    } catch {
      // The parent keeps the dialog open and renders the mutation error.
    }
  }

  return (
    <>
      <HStack spacing={1} mt={2}>
        {comment.canReply ? (
          <Button size="sm" variant="ghost" color="text.secondary" onClick={onReply}>
            Reply
          </Button>
        ) : null}
        {comment.canEdit ? (
          <Button size="sm" variant="ghost" color="text.secondary" onClick={onEdit}>
            Edit
          </Button>
        ) : null}
        {comment.canRemove ? (
          <Button
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={dialog.onOpen}
            isDisabled={isLoading}
          >
            Remove
          </Button>
        ) : null}
      </HStack>

      <AlertDialog
        isOpen={dialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={dialog.onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="bg.elevated">
            <AlertDialogHeader>Remove this comment?</AlertDialogHeader>
            <AlertDialogBody>
              Its text will no longer be visible. Replies remain in context when needed.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={dialog.onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" ml={3} onClick={handleRemove} isLoading={isLoading}>
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default CommentActions
