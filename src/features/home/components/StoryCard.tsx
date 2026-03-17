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
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { BlogPost } from '../../../core'
import { AnimatedCard } from '../../../core'
import { useResolvedCoverImage } from '../../media/useResolvedCoverImage'

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'

interface StoryCardProps {
  post: BlogPost
  index: number
  formatDate: (dateString: string) => string
}

const StoryCard = ({ post, index, formatDate }: StoryCardProps) => {
  const coverImage = useResolvedCoverImage(post.featuredImage)

  return (
    <Box as={RouterLink} to={`/blog/${post.id}`} display="block">
      <AnimatedCard
        maxW="100%"
        overflow="hidden"
        intensity="light"
        staggerDelay={0.08}
        index={index}
        animation="fadeInUp"
      >
        <SimpleGrid columns={{ base: 1, md: coverImage ? 2 : 1 }} spacing={0}>
          <VStack align="stretch" spacing={4} p={6} justify="space-between">
            <VStack align="stretch" spacing={4}>
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
                  {index === 0 ? 'Lead note' : 'Recent note'}
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
                {post.excerpt || post.subtitle || 'A new note from the archive.'}
              </Text>
            </VStack>

            <Flex
              pt={4}
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
                <HStack spacing={1.5} color="accent.primary" fontWeight="semibold">
                  <Text>Read</Text>
                  <Icon as={FiArrowRight} />
                </HStack>
              </HStack>
            </Flex>
          </VStack>

          {coverImage ? (
            <Box
              minH="260px"
              borderLeft={{ base: 'none', md: '1px solid' }}
              borderColor="border.subtle"
            >
              <Image src={coverImage} alt={post.title} w="full" h="full" objectFit="cover" />
            </Box>
          ) : (
            <Flex
              minH="220px"
              align="center"
              justify="center"
              bg="bg.tertiary"
              borderTop={{ base: '1px solid', md: 'none' }}
              borderLeft={{ base: 'none', md: '1px solid' }}
              borderColor="border.subtle"
            >
              <Tag size="lg" borderRadius="full" bg="bg.page" color="accent.primary">
                Quiet thinking, shipped clearly
              </Tag>
            </Flex>
          )}
        </SimpleGrid>
      </AnimatedCard>
    </Box>
  )
}

export default StoryCard
