import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  HStack,
  Heading,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
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

  return (
    <Box id="comments" as="section" scrollMarginTop={24} aria-labelledby="comments-heading">
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" align={{ base: 'start', sm: 'center' }} flexWrap="wrap">
          <Box>
            <Heading id="comments-heading" size="lg" color="text.primary">
              Discussion
            </Heading>
            <Text color="text.secondary" mt={1}>
              {discussion?.available === false
                ? 'No discussion'
                : discussion
                  ? `${discussion.commentCount} ${
                      discussion.commentCount === 1 ? 'comment' : 'comments'
                    }`
                  : 'Reader comments'}
            </Text>
          </Box>
          {discussion?.canManageComments ? (
            <Button
              size="sm"
              variant="outline"
              borderColor="border.default"
              isLoading={comments.settingsLoading}
              onClick={() => {
                void comments.updateSettings(!discussion.commentsOpen).catch(() => {})
              }}
            >
              {discussion.commentsOpen ? 'Close comments' : 'Open comments'}
            </Button>
          ) : null}
        </HStack>

        {comments.mutationError ? (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <AlertDescription>{comments.mutationError}</AlertDescription>
          </Alert>
        ) : null}

        {discussion?.available === false ? (
          <Box bg="bg.tertiary" borderRadius="xl" px={5} py={6}>
            <Text color="text.primary" fontWeight="semibold">
              This article doesn’t have a discussion yet.
            </Text>
            <Text color="text.secondary" mt={1}>
              You can keep reading—there’s nothing else you need to do.
            </Text>
          </Box>
        ) : discussion?.commentsOpen ? (
          user && discussion.canCreate ? (
            <CommentComposer
              label="Join the discussion"
              submitLabel="Post comment"
              onSubmit={async (content) => {
                await comments.createComment(content)
              }}
            />
          ) : !user ? (
            <Box bg="bg.tertiary" borderRadius="xl" p={5}>
              <Text color="text.secondary">
                <Link
                  as={RouterLink}
                  to="/login"
                  state={{ from: returnPath }}
                  color="action.primary"
                  fontWeight="semibold"
                >
                  Sign in
                </Link>{' '}
                to join the discussion.
              </Text>
            </Box>
          ) : null
        ) : discussion ? (
          <Text color="text.secondary">
            Comments are closed, but the discussion remains readable.
          </Text>
        ) : null}

        {comments.topLevel.loading && comments.topLevel.items.length === 0 ? (
          <Text color="text.secondary">Loading discussion…</Text>
        ) : null}

        {comments.topLevel.error ? (
          <Alert status="warning" variant="subtle" borderRadius="xl" alignItems="flex-start">
            <AlertIcon mt={0.5} />
            <Box>
              <AlertDescription color="text.primary">
                Comments couldn’t load right now. The article is still available.
              </AlertDescription>
              <Button mt={3} size="sm" variant="outline" onClick={comments.reload}>
                Try comments again
              </Button>
            </Box>
          </Alert>
        ) : null}

        {!comments.topLevel.loading &&
        !comments.topLevel.error &&
        discussion?.available !== false &&
        comments.topLevel.items.length === 0 ? (
          <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" px={5} py={6}>
            <Text color="text.primary" fontWeight="semibold">
              No comments yet
            </Text>
            <Text color="text.secondary" mt={1}>
              Be the first to share a thought or question.
            </Text>
          </Box>
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
            variant="outline"
            borderColor="border.default"
            isLoading={comments.topLevel.loading}
            onClick={comments.loadMore}
          >
            Load more comments
          </Button>
        ) : null}
      </VStack>
    </Box>
  )
}

export default CommentSection
