/**
 * Reply, edit and remove on one comment.
 *
 * Which controls exist is the API's decision and stays the API's decision -
 * `canReply`, `canEdit`, `canRemove` - with one addition the design system
 * supplies: `canReplyTo` also drops the reply control at the depth limit, so a
 * reader is never offered a reply the server would refuse to store.
 *
 * Removal keeps its confirmation. The dialog is still Chakra's `AlertDialog`:
 * the design system has no dialog primitive, so what this file owns is the
 * surface and the control tones, not a hand-rolled modal. Reported as a gap.
 */

import { useRef } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'

import { Button, Stack, canReplyTo } from '../../../design-system'
import { componentTokens, space } from '../../../theme/tokens'
import { Comment } from '../comments.types'
import { toReaderComment } from '../comment.presentation'

interface CommentActionsProps {
  comment: Comment
  isLoading: boolean
  onReply: () => void
  onEdit: () => void
  onRemove: () => Promise<void>
}

const CommentActions = ({ comment, isLoading, onReply, onEdit, onRemove }: CommentActionsProps) => {
  const dialog = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const reader = toReaderComment(comment)

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
      <Stack direction="row" collapseAt={undefined} gap={1} wrap="wrap">
        {canReplyTo(reader) ? (
          <Button tone="quiet" size="sm" onClick={onReply}>
            Reply
          </Button>
        ) : null}
        {comment.canEdit ? (
          <Button tone="quiet" size="sm" onClick={onEdit}>
            Edit
          </Button>
        ) : null}
        {comment.canRemove ? (
          <Button tone="danger" size="sm" onClick={dialog.onOpen} isDisabled={isLoading}>
            Remove
          </Button>
        ) : null}
      </Stack>

      <AlertDialog
        isOpen={dialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={dialog.onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            bg={componentTokens.overlay.bg}
            borderColor={componentTokens.overlay.border}
            borderRadius={componentTokens.overlay.radius}
            color="text.primary"
          >
            <AlertDialogHeader>Remove this comment?</AlertDialogHeader>
            <AlertDialogBody>
              Its text will no longer be visible. Replies remain in context when needed.
            </AlertDialogBody>
            <AlertDialogFooter gap={space[2]}>
              <Button ref={cancelRef} tone="secondary" onClick={dialog.onClose}>
                Cancel
              </Button>
              <Button
                tone="danger"
                onClick={handleRemove}
                isLoading={isLoading}
                loadingLabel="Removing the comment"
              >
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
