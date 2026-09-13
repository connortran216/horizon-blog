/**
 * One comment in the thread.
 *
 * An `article` with its own accessible name, the author identity the rest of
 * the site uses, and a body that wraps rather than widening the page - a pasted
 * URL with no spaces in it is the one piece of reader-written text that will
 * otherwise push a 375px screen sideways.
 *
 * Every decision about what this renders comes from the design system's
 * `conversation.logic`: the name a deleted account is given, the tombstone a
 * removed comment keeps, the timestamp and its `datetime` attribute, and the
 * indent, which stops growing at the depth the API models so the deepest reply
 * is still readable on a phone.
 */

import { ReactNode, useState } from 'react'
import { Box } from '@chakra-ui/react'

import {
  AuthorIdentity,
  Stack,
  Text,
  commentAuthorName,
  commentBody,
  commentTimestamp,
  threadIndent,
} from '../../../design-system'
import { componentTokens, space } from '../../../theme/tokens'
import { Comment } from '../comments.types'
import { toReaderComment } from '../comment.presentation'
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
  const reader = toReaderComment(comment)
  const authorName = commentAuthorName(reader.author)
  const body = commentBody(reader)
  const timestamp = commentTimestamp(reader)

  return (
    <Box
      as="article"
      aria-label={`Comment by ${authorName}`}
      paddingInlineStart={threadIndent(comment.depth)}
      borderInlineStartWidth={comment.depth > 0 ? '2px' : 0}
      borderInlineStartStyle="solid"
      borderInlineStartColor={componentTokens.card.border}
      paddingBlock={space[4]}
      minW={0}
    >
      <Stack gap={3}>
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={space[3]} minW={0}>
          <AuthorIdentity
            author={{ name: authorName, avatarUrl: reader.author?.avatarUrl }}
            size="sm"
          />
          {timestamp.label ? (
            <Box
              as="time"
              dateTime={timestamp.machine ?? undefined}
              textStyle="meta"
              color={componentTokens.reader.secondaryFg}
            >
              {timestamp.label}
            </Box>
          ) : null}
        </Box>

        <Text
          as="p"
          recipe="body"
          color={body.kind === 'removed' ? 'text.muted' : 'text.primary'}
          fontStyle={body.kind === 'removed' ? 'italic' : undefined}
          whiteSpace="pre-wrap"
          overflowWrap="anywhere"
        >
          {body.text}
        </Text>

        {body.kind === 'text' ? (
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
      </Stack>
    </Box>
  )
}

export default CommentItem
