/**
 * The threaded conversation.
 *
 * A recursive list of `CommentItem`s, keeping the cursor-paged reply lifecycle
 * `useBlogComments` owns: replies are fetched on demand, a failed page can be
 * retried on its own, and "Load more replies" walks the cursor. That lifecycle
 * is why this is not the design system's `CommentThread` pattern, which takes
 * one flat page of comments, has no per-parent paging and offers a single
 * thread-level composer rather than the inline reply and edit boxes this
 * feature has. Adopting it would remove working behaviour; the decisions it
 * owns - tree shape, depth cap, tombstones, indent, labels - are imported
 * instead. Reported as a gap.
 *
 * The list is a real `ul`, so a screen reader is told how many comments there
 * are and how deep a reply sits.
 */

import { Box } from '@chakra-ui/react'

import { Button, ErrorState, RetryAction, replyToggleLabel } from '../../../design-system'
import { Comment, SiblingPageState } from '../comments.types'
import CommentItem from './CommentItem'

interface CommentThreadProps {
  comments: Comment[]
  replies: Record<number, SiblingPageState>
  mutatingCommentId: number | null
  onLoadReplies: (commentId: number) => void
  onLoadMoreReplies: (commentId: number) => void
  onReply: (parentId: number, content: string) => Promise<void>
  onEdit: (commentId: number, content: string) => Promise<void>
  onRemove: (commentId: number) => Promise<void>
}

const CommentThread = ({
  comments,
  replies,
  mutatingCommentId,
  onLoadReplies,
  onLoadMoreReplies,
  onReply,
  onEdit,
  onRemove,
}: CommentThreadProps) => {
  if (comments.length === 0) {
    return null
  }

  return (
    <Box as="ul" listStyleType="none" margin={0} padding={0} minW={0}>
      {comments.map((comment) => {
        const childPage = replies[comment.id]
        const isOpen = Boolean(childPage)

        return (
          <Box as="li" key={comment.id} minW={0}>
            <CommentItem
              comment={comment}
              isLoading={mutatingCommentId === comment.id}
              onReply={(content) => onReply(comment.id, content)}
              onEdit={(content) => onEdit(comment.id, content)}
              onRemove={() => onRemove(comment.id)}
            >
              {comment.replyCount > 0 && !isOpen ? (
                <Box>
                  <Button
                    tone="link"
                    size="sm"
                    aria-expanded={false}
                    onClick={() => onLoadReplies(comment.id)}
                  >
                    {replyToggleLabel(comment.replyCount, false)}
                  </Button>
                </Box>
              ) : null}

              {childPage?.error ? (
                <ErrorState failedAction="load the replies" align="start">
                  <RetryAction
                    failedAction="load the replies"
                    onRetry={() => onLoadReplies(comment.id)}
                    retrying={childPage.loading}
                  />
                </ErrorState>
              ) : null}

              {childPage?.items.length ? (
                <CommentThread
                  comments={childPage.items}
                  replies={replies}
                  mutatingCommentId={mutatingCommentId}
                  onLoadReplies={onLoadReplies}
                  onLoadMoreReplies={onLoadMoreReplies}
                  onReply={onReply}
                  onEdit={onEdit}
                  onRemove={onRemove}
                />
              ) : null}

              {childPage?.hasMore ? (
                <Box>
                  <Button
                    tone="link"
                    size="sm"
                    isLoading={childPage.loading}
                    loadingLabel="Loading more replies"
                    onClick={() => onLoadMoreReplies(comment.id)}
                  >
                    Load more replies
                  </Button>
                </Box>
              ) : null}
            </CommentItem>
          </Box>
        )
      })}
    </Box>
  )
}

export default CommentThread
