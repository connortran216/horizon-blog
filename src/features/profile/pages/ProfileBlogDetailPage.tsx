import { Badge, Heading, HStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useResolvedMarkdown } from '../../media/useResolvedMarkdown'
import BlogReaderFrame from '../../blog/components/BlogReaderFrame'
import { getPostAuthorName } from '../../blog/blog.utils'
import { useBlogPostDetail } from '../../blog/useBlogPostDetail'

const ProfileBlogDetailPage = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const redirectPath = `/profile/${username}`
  const { post, loading } = useBlogPostDetail({
    redirectPath,
    validatePost: (foundPost) => {
      if (getPostAuthorName(foundPost) !== username) {
        return 'This blog does not belong to this user.'
      }

      return null
    },
  })

  const resolvedContent = useResolvedMarkdown(post?.content_markdown || '', {
    postId: post?.id ?? null,
  })

  const isOwnProfile = user && username === user.username

  return (
    <BlogReaderFrame
      post={post}
      loading={loading}
      resolvedContent={resolvedContent}
      onBack={() => navigate(redirectPath)}
      backLabel="Back to Profile"
      emptyLabel="Blog not found"
      bottomPadding={false}
      titleSection={
        post ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <HStack justify="space-between" align="start">
              <Heading as="h1" size="2xl" color="text.primary" lineHeight="1.2">
                {post.title}
              </Heading>
              {post.status === 'draft' ? (
                <Badge colorScheme="yellow" fontSize="md" px={3} py={1}>
                  Draft
                </Badge>
              ) : null}
            </HStack>
          </motion.div>
        ) : null
      }
      helperSection={
        isOwnProfile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Text fontSize="sm" color="text.secondary" fontStyle="italic">
              This is a read-only view. To edit this blog, go back to your profile and use the Edit
              option from the menu.
            </Text>
          </motion.div>
        ) : null
      }
    />
  )
}

export default ProfileBlogDetailPage
