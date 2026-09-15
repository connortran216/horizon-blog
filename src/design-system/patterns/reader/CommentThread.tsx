/**
 * Horizon Design System v2 - the threaded conversation.
 *
 * A recursive list. Each comment is an `article` with its own accessible name,
 * replies are a nested `ul`, and the nesting stops at the depth the API models -
 * so a reply control never appears where the server would refuse the reply.
 *
 * A removed comment keeps its place as a tombstone rather than disappearing.
 * Removing the node would re-parent its replies and silently change what the
 * people below it appear to be answering.
 *
 * Every state the thread can be in is covered here, because a discussion is the
 * part of a reading page most likely to be loading, failed, closed or empty at
 * the moment a reader arrives.
 */

import { type ReactNode } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { componentTokens, space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import {
  EmptyState,
  ErrorState,
  FeedbackSurface,
  PanelLoading,
  RetryAction,
} from '../../components/feedback'
import { Text } from '../../components/typography'
import { AuthorIdentity } from '../posts'
import {
  buildCommentTree,
  canReplyTo,
  commentAuthorName,
  commentBody,
  commentTimestamp,
  conversationStatus,
  replyToggleLabel,
  threadIndent,
  type CommentNode,
  type ConversationStatusInput,
  type ReaderComment,
} from './conversation.logic'

export interface CommentThreadProps
  extends Omit<BoxProps, 'children' | 'onSelect'>, ConversationStatusInput {
  comments: readonly ReaderComment[]
  /** Ids of the comments whose replies are currently expanded. */
  expandedIds?: readonly string[]
  onToggleReplies?: (id: string) => void
  onReply?: (id: string) => void
  onEdit?: (id: string) => void
  onRemove?: (id: string) => void
  onRetry?: () => void
  /** The composer, or the notice explaining why there is not one. */
  composer?: ReactNode
  label?: string
}

interface CommentEntryProps {
  node: CommentNode
  expandedIds: readonly string[]
  onToggleReplies?: (id: string) => void
  onReply?: (id: string) => void
  onEdit?: (id: string) => void
  onRemove?: (id: string) => void
}

function CommentEntry({
  node,
  expandedIds,
  onToggleReplies,
  onReply,
  onEdit,
  onRemove,
}: CommentEntryProps) {
  const { comment } = node
  const name = commentAuthorName(comment.author)
  const body = commentBody(comment)
  const timestamp = commentTimestamp(comment)
  const isExpanded = expandedIds.includes(comment.id)
  const hasReplies = node.replies.length > 0

  return (
    <Box
      as="li"
      paddingInlineStart={threadIndent(node.depth)}
      borderInlineStartWidth={node.depth > 0 ? '2px' : 0}
      borderInlineStartStyle="solid"
      borderInlineStartColor={componentTokens.card.border}
    >
      <Box
        as="article"
        aria-label={`Comment by ${name}`}
        display="flex"
        flexDirection="column"
        gap={space[2]}
        paddingBlock={space[4]}
      >
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={space[3]}>
          <AuthorIdentity author={{ name, avatarUrl: comment.author?.avatarUrl }} size="sm" />
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
          /* A comment is reader-written text: it wraps rather than widening the
             page, and a pasted URL with no spaces in it must not either. */
          whiteSpace="pre-wrap"
          overflowWrap="anywhere"
        >
          {body.text}
        </Text>

        {body.kind === 'text' ? (
          <Box display="flex" flexWrap="wrap" gap={space[1]}>
            {canReplyTo(comment) && onReply ? (
              <Button
                tone="quiet"
                size="sm"
                onClick={() => onReply(comment.id)}
                aria-label={`Reply to ${name}`}
              >
                Reply
              </Button>
            ) : null}
            {comment.canEdit && onEdit ? (
              <Button
                tone="quiet"
                size="sm"
                onClick={() => onEdit(comment.id)}
                aria-label={`Edit your comment`}
              >
                Edit
              </Button>
            ) : null}
            {comment.canRemove && onRemove ? (
              <Button
                tone="danger"
                size="sm"
                onClick={() => onRemove(comment.id)}
                aria-label={`Remove the comment by ${name}`}
              >
                Remove
              </Button>
            ) : null}
          </Box>
        ) : null}

        {comment.replyCount > 0 && onToggleReplies ? (
          <Box>
            <Button
              tone="link"
              size="sm"
              onClick={() => onToggleReplies(comment.id)}
              aria-expanded={isExpanded}
            >
              {replyToggleLabel(comment.replyCount, isExpanded)}
            </Button>
          </Box>
        ) : null}
      </Box>

      {hasReplies && isExpanded ? (
        <Box as="ul" listStyleType="none" margin={0} padding={0}>
          {node.replies.map((reply) => (
            <CommentEntry
              key={reply.comment.id}
              node={reply}
              expandedIds={expandedIds}
              onToggleReplies={onToggleReplies}
              onReply={onReply}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}

export function CommentThread({
  comments,
  expandedIds = [],
  onToggleReplies,
  onReply,
  onEdit,
  onRemove,
  onRetry,
  composer,
  label = 'Discussion',
  available,
  commentsOpen,
  isLoading,
  error,
  ...rest
}: CommentThreadProps) {
  const status = conversationStatus({
    available,
    commentsOpen,
    isLoading,
    error,
    commentCount: comments.length,
  })
  const tree = buildCommentTree(comments)

  return (
    <Box
      as="section"
      aria-label={label}
      display="flex"
      flexDirection="column"
      gap={space[4]}
      {...rest}
    >
      {status === 'unavailable' ? (
        <FeedbackSurface
          tone="empty"
          headline="Comments are not available on this blog"
          detail="Nothing to load here."
          align="start"
        />
      ) : null}

      {status === 'closed' ? (
        <FeedbackSurface
          tone="empty"
          headline="This discussion is closed"
          detail="You can still read what has already been said."
          align="start"
        />
      ) : null}

      {status === 'loading' ? <PanelLoading task="the discussion" /> : null}

      {status === 'error' ? (
        <ErrorState failedAction="load the discussion" align="start">
          {onRetry ? <RetryAction failedAction="load the discussion" onRetry={onRetry} /> : null}
        </ErrorState>
      ) : null}

      {status === 'ready' || status === 'empty' || status === 'closed' ? composer : null}

      {status === 'empty' ? (
        <EmptyState
          subject="comments on this blog"
          nextAction="Be the first to add to the conversation."
          align="start"
        />
      ) : null}

      {tree.length > 0 && status !== 'loading' && status !== 'error' ? (
        <Box as="ul" listStyleType="none" margin={0} padding={0}>
          {tree.map((node) => (
            <CommentEntry
              key={node.comment.id}
              node={node}
              expandedIds={expandedIds}
              onToggleReplies={onToggleReplies}
              onReply={onReply}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}
