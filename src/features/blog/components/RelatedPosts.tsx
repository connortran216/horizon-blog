import { Box, Heading, HStack, Image, LinkBox, LinkOverlay, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiClock } from 'react-icons/fi'
import { Icon } from '@chakra-ui/react'
import DefaultPostCover from '../../media/components/DefaultPostCover'
import { useResolvedCoverImage } from '../../media/useResolvedCoverImage'
import { BlogArchiveSummary } from '../blog.types'
import { formatArchiveDate } from '../blog.utils'

interface RelatedPostsProps {
  posts: BlogArchiveSummary[]
}

const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  if (posts.length === 0) {
    return null
  }

  return (
    <VStack align="stretch" spacing={4}>
      <Heading as="h2" size="sm" color="text.primary" lineHeight="1.2">
        More like this
      </Heading>
      <VStack align="stretch" spacing={3}>
        {posts.map((post) => (
          <RelatedPostCard key={post.id} post={post} />
        ))}
      </VStack>
    </VStack>
  )
}

interface RelatedPostCardProps {
  post: BlogArchiveSummary
}

const RelatedPostCard = ({ post }: RelatedPostCardProps) => {
  const coverImage = useResolvedCoverImage(post.featuredImage)

  return (
    <LinkBox
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="md"
      overflow="hidden"
      bg="bg.secondary"
      transition="border-color 0.2s ease, transform 0.2s ease"
      _hover={{ borderColor: 'action.primary', transform: 'translateY(-1px)' }}
    >
      <Box h="112px" overflow="hidden" bg="bg.tertiary">
        {coverImage ? (
          <Image src={coverImage} alt={post.title} w="full" h="full" objectFit="contain" />
        ) : (
          <DefaultPostCover title={post.title} eyebrow="" h="full" />
        )}
      </Box>

      <VStack align="stretch" spacing={3} p={4}>
        <LinkOverlay as={RouterLink} to={`/blog/${post.id}`}>
          <Heading size="sm" color="text.primary" lineHeight="1.25" noOfLines={2}>
            {post.title}
          </Heading>
        </LinkOverlay>

        <Text color="text.secondary" fontSize="sm" lineHeight="tall" noOfLines={2}>
          {post.excerpt || 'Fresh thoughts are on the way.'}
        </Text>

        <HStack spacing={2} color="text.tertiary" fontSize="xs" flexWrap="wrap">
          <Text>{formatArchiveDate(post.createdAt)}</Text>
          <Text>•</Text>
          <HStack spacing={1}>
            <Icon as={FiClock} />
            <Text>{post.readingTime || 1} min read</Text>
          </HStack>
        </HStack>
      </VStack>
    </LinkBox>
  )
}

export default RelatedPosts
