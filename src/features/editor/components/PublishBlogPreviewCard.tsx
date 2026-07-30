import { Avatar, Box, Flex, Heading, HStack, Icon, Image, Text, VStack } from '@chakra-ui/react'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { BlogPostSummary } from '../../../core'
import DefaultPostCover from '../../media/components/DefaultPostCover'
import { useResolvedCoverImage } from '../../media/useResolvedCoverImage'

interface PublishBlogPreviewCardProps {
  blog: BlogPostSummary
  publicationDate: string
}

const PublishBlogPreviewCard = ({
  blog,
  publicationDate,
}: PublishBlogPreviewCardProps) => {
  const cover = useResolvedCoverImage(blog.featuredImage)

  return (
    <Box
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      overflow="hidden"
      bg="bg.secondary"
      boxShadow="lg"
    >
      <Box h={{ base: '220px', xl: '320px' }} bg="bg.page">
        {cover ? (
          <Image src={cover} alt={blog.title} w="full" h="full" objectFit="cover" />
        ) : (
          <DefaultPostCover title={blog.title} eyebrow="Recent blog" h="full" />
        )}
      </Box>
      <VStack align="stretch" spacing={5} p={{ base: 6, xl: 8 }}>
        <Text
          alignSelf="flex-start"
          px={3}
          py={1}
          borderRadius="full"
          bg="bg.tertiary"
          color="text.secondary"
          fontSize="10px"
          fontWeight="semibold"
          letterSpacing="0.12em"
        >
          RECENT BLOG
        </Text>
        <Heading size="xl" color="text.primary" lineHeight="1.08" letterSpacing="-0.04em">
          {blog.title}
        </Heading>
        <Text color="text.secondary" lineHeight="tall" noOfLines={4}>
          {blog.excerpt || 'Fresh thoughts are on the way.'}
        </Text>
        <Flex
          pt={5}
          borderTop="1px solid"
          borderColor="border.subtle"
          justify="space-between"
          gap={4}
          wrap="wrap"
        >
          <HStack spacing={3} color="text.tertiary" flexWrap="wrap">
            <Avatar size="xs" name={blog.author.username} src={blog.author.avatar} />
            <Text color="text.secondary">{blog.author.username}</Text>
            <Text>{publicationDate}</Text>
            <HStack spacing={1.5}>
              <Icon as={FiClock} />
              <Text>{blog.readingTime || 1} min read</Text>
            </HStack>
          </HStack>
          <HStack color="action.primary" fontWeight="semibold">
            <Text>Read</Text>
            <Icon as={FiArrowRight} />
          </HStack>
        </Flex>
      </VStack>
    </Box>
  )
}

export default PublishBlogPreviewCard
