import { Box, Button, Divider, Text, VStack } from '@chakra-ui/react'
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
}: CommentThreadProps) => (
  <VStack align="stretch" spacing={0} divider={<Divider borderColor="border.subtle" />}>
    {comments.map((comment) => {
      const childPage = replies[comment.id]
      return (
        <CommentItem
          key={comment.id}
          comment={comment}
          isLoading={mutatingCommentId === comment.id}
          onReply={(content) => onReply(comment.id, content)}
          onEdit={(content) => onEdit(comment.id, content)}
          onRemove={() => onRemove(comment.id)}
        >
          {comment.replyCount > 0 && !childPage ? (
            <Button
              alignSelf="flex-start"
              size="sm"
              variant="ghost"
              color="action.primary"
              onClick={() => onLoadReplies(comment.id)}
            >
              View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </Button>
          ) : null}

          {childPage?.error ? (
            <Box>
              <Text color="red.400" fontSize="sm">
                {childPage.error}
              </Text>
              <Button size="sm" variant="ghost" onClick={() => onLoadReplies(comment.id)}>
                Retry replies
              </Button>
            </Box>
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
            <Button
              alignSelf="flex-start"
              size="sm"
              variant="ghost"
              color="action.primary"
              isLoading={childPage.loading}
              onClick={() => onLoadMoreReplies(comment.id)}
            >
              Load more replies
            </Button>
          ) : null}
        </CommentItem>
      )
    })}
  </VStack>
)

export default CommentThread
