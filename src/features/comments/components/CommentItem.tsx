import { ReactNode, useState } from 'react'
import { Avatar, Box, HStack, Text, VStack } from '@chakra-ui/react'
import { Comment } from '../comments.types'
import CommentActions from './CommentActions'
import CommentComposer from './CommentComposer'

interface CommentItemProps {
  comment: Comment
  isLoading: boolean
  children?: ReactNode
  onReply: (content: string) => Promise<void>
  onEdit: (content: string) => Promise<void>
  onRemove: () => Promise<void>
}

const CommentItem = ({
  comment,
  isLoading,
  children,
  onReply,
  onEdit,
  onRemove,
}: CommentItemProps) => {
  const [mode, setMode] = useState<'idle' | 'reply' | 'edit'>('idle')
  const authorName = comment.author?.name ?? 'Deleted reader'

  return (
    <Box
      as="article"
      aria-label={`Comment by ${authorName}`}
      borderLeftWidth={comment.depth > 0 ? '2px' : 0}
      borderColor="border.subtle"
      pl={comment.depth > 0 ? { base: 3, md: 5 } : 0}
      py={4}
    >
      <VStack align="stretch" spacing={3}>
        <HStack spacing={3} align="start">
          <Avatar size="sm" name={authorName} src={comment.author?.avatarUrl} />
          <Box minW={0}>
            <Text fontWeight="semibold" color="text.primary">
              {authorName}
            </Text>
            <Text fontSize="sm" color="text.tertiary">
              {new Date(comment.createdAt).toLocaleString()}
              {comment.editedAt ? ' · edited' : ''}
            </Text>
          </Box>
        </HStack>

        {comment.isRemoved ? (
          <Text color="text.tertiary" fontStyle="italic">
            Comment removed
          </Text>
        ) : (
          <Text color="text.primary" whiteSpace="pre-wrap" overflowWrap="anywhere">
            {comment.content}
          </Text>
        )}

        {!comment.isRemoved ? (
          <CommentActions
            comment={comment}
            isLoading={isLoading}
            onReply={() => setMode('reply')}
            onEdit={() => setMode('edit')}
            onRemove={onRemove}
          />
        ) : null}

        {mode === 'reply' ? (
          <CommentComposer
            label={`Reply to ${authorName}`}
            submitLabel="Post reply"
            autoFocus
            onCancel={() => setMode('idle')}
            onSubmit={async (content) => {
              await onReply(content)
              setMode('idle')
            }}
          />
        ) : null}

        {mode === 'edit' && comment.content ? (
          <CommentComposer
            label="Edit comment"
            submitLabel="Save"
            initialContent={comment.content}
            autoFocus
            onCancel={() => setMode('idle')}
            onSubmit={async (content) => {
              await onEdit(content)
              setMode('idle')
            }}
          />
        ) : null}

        {children}
      </VStack>
    </Box>
  )
}

export default CommentItem
