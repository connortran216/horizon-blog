/**
 * The discussion under an article.
 *
 * `useBlogComments` is untouched: the same cursor paging, the same idempotent
 * submission ids, the same optimistic reply counts, the same settings call.
 * What moved is which component decides what the reader sees, and the order the
 * states are considered in - `conversationStatus` in the design system fixes
 * that order, so a deployment without comments never shows a spinner for a
 * discussion that will never arrive, and a closed discussion with no comments
 * says it is closed rather than inviting a comment nobody can leave.
 *
 * `composerAvailability` answers the second question - may this reader write,
 * and what should they be told if not - so a signed-out reader gets a way in
 * rather than a disabled textarea sitting in the tab order.
 *
 * The five hand-built Chakra panels this used to carry (two `Alert`s and three
 * bordered boxes with their own radii) are now the system's feedback states.
 */

import { Box, Link as ChakraLink } from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'

import {
  Button,
  EmptyState,
  ErrorState,
  FeedbackSurface,
  Heading,
  PanelLoading,
  RetryAction,
  Stack,
  Text,
  commentCountLabel,
  composerAvailability,
  conversationStatus,
} from '../../../design-system'
import { space } from '../../../theme/tokens'
import { useAuth } from '../../../context/AuthContext'
import { useBlogComments } from '../useBlogComments'
import CommentComposer from './CommentComposer'
import CommentThread from './CommentThread'

interface CommentSectionProps {
  postId: number
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const location = useLocation()
  const { user } = useAuth()
  const comments = useBlogComments({ postId })
  const discussion = comments.discussion
  const returnPath = `${location.pathname}${location.search}#comments`

  const status = conversationStatus({
    available: discussion?.available !== false,
    commentsOpen: discussion?.commentsOpen !== false,
    isLoading: comments.topLevel.loading && comments.topLevel.items.length === 0,
    error: comments.topLevel.error,
    commentCount: comments.topLevel.items.length,
  })

  const composer = composerAvailability({
    canCreate: discussion?.canCreate ?? false,
    commentsOpen: discussion?.commentsOpen !== false,
    isAuthenticated: Boolean(user),
  })

  const countLabel =
    discussion?.available === false
      ? 'No discussion'
      : discussion
        ? commentCountLabel(discussion.commentCount)
        : 'Reader comments'

  return (
    <Box id="comments" as="section" scrollMarginTop={space[16]} aria-labelledby="comments-heading">
      <Stack gap={6}>
        <Stack
          direction="row"
          gap={4}
          align={{ base: 'start', sm: 'center' }}
          justify="space-between"
          wrap="wrap"
        >
          <Stack gap={1}>
            <Heading id="comments-heading" as="h2" recipe="sectionTitle">
              Discussion
            </Heading>
            <Text as="p" recipe="metadata">
              {countLabel}
            </Text>
          </Stack>

          {discussion?.canManageComments ? (
            <Button
              tone="secondary"
              size="sm"
              isLoading={comments.settingsLoading}
              loadingLabel="Updating the discussion settings"
              onClick={() => {
                void comments.updateSettings(!discussion.commentsOpen).catch(() => {})
              }}
            >
              {discussion.commentsOpen ? 'Close comments' : 'Open comments'}
            </Button>
          ) : null}
        </Stack>

        {comments.mutationError ? (
          <FeedbackSurface
            tone="error"
            headline="That comment could not be saved"
            detail="Nothing was lost - try again in a moment."
            align="start"
          />
        ) : null}

        {status === 'unavailable' ? (
          <FeedbackSurface
            tone="empty"
            headline="This article does not have a discussion yet"
            detail="You can keep reading - there is nothing else you need to do."
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
            <RetryAction failedAction="load the discussion" onRetry={comments.reload} />
          </ErrorState>
        ) : null}

        {status === 'ready' || status === 'empty' ? (
          composer.allowed ? (
            <CommentComposer
              label="Join the discussion"
              submitLabel="Post comment"
              onSubmit={async (content) => {
                await comments.createComment(content)
              }}
            />
          ) : composer.notice ? (
            <Text as="p" recipe="body">
              {user ? (
                composer.notice
              ) : (
                <>
                  <ChakraLink
                    as={RouterLink}
                    to="/login"
                    state={{ from: returnPath }}
                    color="link.default"
                    textDecoration="underline"
                    textUnderlineOffset={space[1]}
                  >
                    Sign in
                  </ChakraLink>{' '}
                  to join the discussion.
                </>
              )}
            </Text>
          ) : null
        ) : null}

        {status === 'empty' ? (
          <EmptyState
            subject="comments on this blog"
            nextAction="Be the first to share a thought or question."
            align="start"
          />
        ) : null}

        <CommentThread
          comments={comments.topLevel.items}
          replies={comments.replies}
          mutatingCommentId={comments.mutatingCommentId}
          onLoadReplies={comments.loadReplies}
          onLoadMoreReplies={comments.loadMoreReplies}
          onReply={(parentId, content) => comments.createComment(content, parentId).then(() => {})}
          onEdit={(commentId, content) => comments.updateComment(commentId, content).then(() => {})}
          onRemove={(commentId) => comments.removeComment(commentId).then(() => {})}
        />

        {comments.topLevel.hasMore ? (
          <Button
            alignSelf="flex-start"
            tone="secondary"
            isLoading={comments.topLevel.loading}
            loadingLabel="Loading more comments"
            onClick={comments.loadMore}
          >
            Load more comments
          </Button>
        ) : null}
      </Stack>
    </Box>
  )
}

export default CommentSection
