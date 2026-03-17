import {
  Avatar,
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { AnimatedCard } from '../../../core'
import { useResolvedCoverImage } from '../../media/useResolvedCoverImage'
import { BlogArchivePost } from '../blog.types'
import {
  extractFirstImageUrl,
  formatArchiveDate,
  getExcerpt,
  getPostEyebrow,
  getReadingTime,
} from '../blog.utils'

interface EditorialCardProps {
  post: BlogArchivePost
  index: number
}

const EditorialCard = ({ post, index }: EditorialCardProps) => {
  const coverImage = useResolvedCoverImage(extractFirstImageUrl(post.content_markdown))

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
        <Box position="relative" h="240px" overflow="hidden">
          {coverImage ? (
            <>
              <Image
                src={coverImage}
                alt={post.title}
                w="full"
                h="full"
                objectFit="cover"
                transition="transform 0.35s ease"
              />
              <Box position="absolute" inset={0} bg="blackAlpha.300" />
            </>
          ) : (
            <Flex
              h="full"
              bg="bg.tertiary"
              align="center"
              justify="center"
              borderBottom="1px solid"
              borderColor="border.subtle"
            >
              <Box
                px={5}
                py={4}
                borderRadius="2xl"
                border="1px solid"
                borderColor="border.subtle"
                bg="bg.page"
              >
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  letterSpacing="-0.04em"
                  color="accent.primary"
                >
                  {post.title.substring(0, 2).toUpperCase()}
                </Text>
              </Box>
            </Flex>
          )}

          <HStack position="absolute" top={4} left={4} spacing={2}>
            <Badge
              px={3}
              py={1}
              borderRadius="full"
              bg="bg.page"
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing="0.12em"
              fontSize="10px"
            >
              {getPostEyebrow(index)}
            </Badge>
            <Badge
              px={3}
              py={1}
              borderRadius="full"
              bg="accent.primary"
              color="white"
              textTransform="uppercase"
              letterSpacing="0.12em"
              fontSize="10px"
            >
              {post.status}
            </Badge>
          </HStack>
        </Box>

        <VStack align="stretch" spacing={5} p={6}>
          <HStack spacing={3} color="text.tertiary" fontSize="sm" flexWrap="wrap">
            <HStack spacing={2}>
              <Avatar size="2xs" name={post.user?.name || 'Anonymous'} />
              <Text color="text.secondary">{post.user?.name || 'Anonymous'}</Text>
            </HStack>
            <Text>•</Text>
            <Text>{formatArchiveDate(post.created_at)}</Text>
            <Text>•</Text>
            <HStack spacing={1.5}>
              <Icon as={FiClock} />
              <Text>{getReadingTime(post.content_markdown)} min read</Text>
            </HStack>
          </HStack>

          <VStack align="stretch" spacing={3}>
            <Heading
              size="lg"
              color="text.primary"
              lineHeight="1.1"
              letterSpacing="-0.03em"
              noOfLines={2}
            >
              {post.title}
            </Heading>
            <Text color="text.secondary" lineHeight="tall" noOfLines={4}>
              {getExcerpt(post.content_markdown)}
            </Text>
          </VStack>

          <Flex
            pt={4}
            borderTop="1px solid"
            borderColor="border.subtle"
            align="center"
            justify="space-between"
          >
            <Tag size="sm" borderRadius="full" bg="bg.tertiary" color="text.secondary">
              Notebook entry
            </Tag>
            <HStack spacing={2} color="accent.primary" fontWeight="semibold">
              <Text fontSize="sm">Read story</Text>
              <Icon as={FiArrowRight} />
            </HStack>
          </Flex>
        </VStack>
      </AnimatedCard>
    </Box>
  )
}

export default EditorialCard
