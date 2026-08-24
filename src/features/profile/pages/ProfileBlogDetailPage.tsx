import { Badge, Heading, HStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useResolvedMarkdownMedia } from '../../media/useResolvedMarkdown'
import BlogReaderFrame from '../../blog/components/BlogReaderFrame'
import { useOwnerBlogPostDetail } from '../useOwnerBlogPostDetail'

const ProfileBlogDetailPage = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const redirectPath = user?.username ? `/profile/${user.username}` : `/profile/${username}`

  const { post, loading } = useOwnerBlogPostDetail({
    redirectPath,
    routeUsername: username,
    authenticatedUserId: user?.id,
    authenticatedUsername: user?.username,
  })

  const resolvedMedia = useResolvedMarkdownMedia(post?.content_markdown || '')

  const isOwnProfile = user && username === user.username

  return (
    <BlogReaderFrame
      post={post}
      loading={loading}
      resolvedContent={resolvedMedia.content}
      resolvedMedia={resolvedMedia.sources}
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
