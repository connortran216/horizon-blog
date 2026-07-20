import {
  Avatar,
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { AnimatedCard, BlogPostSummary, extractPreviewText } from '../../../core'
import { useResolvedCoverImage } from '../../media/useResolvedCoverImage'
import DefaultPostCover from '../../media/components/DefaultPostCover'

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'

interface StoryCardProps {
  post: BlogPostSummary
  index: number
  formatDate: (dateString: string) => string
}

const StoryCard = ({ post, index, formatDate }: StoryCardProps) => {
  const coverImage = useResolvedCoverImage(post.featuredImage)
  const previewText =
    extractPreviewText(post.excerpt || post.subtitle || '') || 'A new blog from the site.'

  return (
    <Box
      as={RouterLink}
      to={`/blog/${post.id}`}
      display="block"
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'action.primary',
        outlineOffset: '2px',
        borderRadius: 'xl',
      }}
    >
      <AnimatedCard
        maxW="100%"
        overflow="hidden"
        intensity="light"
        staggerDelay={0.08}
        index={index}
        animation="fadeInUp"
      >
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={0} alignItems="center">
          <VStack align="stretch" spacing={4} p={6}>
            <HStack spacing={3} flexWrap="wrap">
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                bg="bg.tertiary"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing="0.12em"
                fontSize="10px"
              >
                {index === 0 ? 'Lead blog' : 'Recent blog'}
              </Badge>
              <Text fontSize="sm" color="text.tertiary">
                {formatDate(post.createdAt)}
              </Text>
            </HStack>

            <Heading
              size="lg"
              color="text.primary"
              lineHeight="1.08"
              letterSpacing="-0.03em"
              noOfLines={2}
            >
              {post.title}
            </Heading>

            <Text color="text.secondary" lineHeight="tall" noOfLines={4}>
              {previewText}
            </Text>
          </VStack>

          <Box p={{ base: 4, md: 5, lg: 6 }} w="full">
            <Box aspectRatio={16 / 9} w="full" overflow="hidden" borderRadius="lg" bg="bg.page">
              {coverImage ? (
                <Image src={coverImage} alt={post.title} w="full" h="full" objectFit="contain" />
              ) : (
                <DefaultPostCover
                  title={post.title}
                  eyebrow={index === 0 ? 'Lead blog' : 'Recent blog'}
                  w="full"
                  h="full"
                />
              )}
            </Box>
          </Box>
        </SimpleGrid>

        <Flex
          as="footer"
          px={6}
          py={4}
          borderTop="1px solid"
          borderColor="border.subtle"
          align="center"
          justify="space-between"
          gap={4}
          wrap="wrap"
        >
          <HStack spacing={3}>
            <Avatar size="2xs" src={post.author.avatar || DEFAULT_AVATAR} />
            <Text fontSize="sm" color="text.secondary">
              {post.author.username}
            </Text>
          </HStack>
          <HStack spacing={3} color="text.tertiary" fontSize="sm">
            <HStack spacing={1.5}>
              <Icon as={FiClock} />
              <Text>{post.readingTime || 1} min read</Text>
            </HStack>
            <HStack spacing={1.5} color="action.primary" fontWeight="semibold">
              <Text>Read</Text>
              <Icon as={FiArrowRight} />
            </HStack>
          </HStack>
        </Flex>
      </AnimatedCard>
    </Box>
  )
}

export default StoryCard
