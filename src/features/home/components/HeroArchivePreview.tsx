import {
  Avatar,
  Badge,
  Box,
  Heading,
  HStack,
  Icon,
  Image,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowUpRight, FiClock } from 'react-icons/fi'
import { BlogPost } from '../../../core'
import { useResolvedCoverImage } from '../../media/useResolvedCoverImage'
import DefaultPostCover from '../../media/components/DefaultPostCover'

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'

interface HeroArchivePreviewProps {
  post?: BlogPost
  formatDate: (dateString: string) => string
}

const stripPreviewText = (value?: string) =>
  (value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const HeroArchivePreview = ({ post, formatDate }: HeroArchivePreviewProps) => {
  const coverImage = useResolvedCoverImage(post?.featuredImage)
  const previewText =
    stripPreviewText(post?.excerpt || post?.subtitle) ||
    'Blogs, essays, and technical writing shared with a calmer rhythm.'
  const previewContent = (
    <>
      {coverImage ? (
        <Image
          src={coverImage}
          alt={post?.title || 'Featured blog'}
          w="full"
          h="220px"
          objectFit="cover"
        />
      ) : (
        <DefaultPostCover
          title={post?.title || 'A better way to browse the blog'}
          eyebrow="Featured blog"
          h="220px"
          borderBottom="1px solid"
          borderColor="border.subtle"
        />
      )}

      <Stack spacing={5} px={{ base: 5, lg: 7 }} py={{ base: 5, lg: 7 }}>
        <HStack justify="space-between" align="flex-start" spacing={4}>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg="bg.tertiary"
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing="0.14em"
            fontSize="10px"
          >
            Featured blog
          </Badge>
          <Icon as={FiArrowUpRight} color="action.primary" boxSize={5} />
        </HStack>

        <VStack align="stretch" spacing={3}>
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="0.14em"
            color="text.tertiary"
          >
            {post ? formatDate(post.createdAt) : 'Latest blog'}
          </Text>
          <Heading
            size="lg"
            color="text.primary"
            lineHeight="1.05"
            letterSpacing="-0.03em"
            noOfLines={3}
          >
            {post?.title || 'A better way to browse the blog'}
          </Heading>
          <Text color="text.secondary" lineHeight="tall" noOfLines={4}>
            {previewText}
          </Text>
        </VStack>

        <HStack justify="space-between" pt={1} flexWrap="wrap" spacing={3}>
          <HStack spacing={3}>
            <Avatar
              size="2xs"
              src={post?.author.avatar || DEFAULT_AVATAR}
              name={post?.author.username || 'Connor Tran'}
            />
            <Text fontSize="sm" color="text.secondary">
              {post?.author.username || 'Connor Tran'}
            </Text>
          </HStack>
          <HStack spacing={1.5} color="text.tertiary" fontSize="sm">
            <Icon as={FiClock} />
            <Text>{post?.readingTime || 1} min read</Text>
          </HStack>
        </HStack>
      </Stack>
    </>
  )

  return (
    <Box position="relative" minH={{ base: '340px', lg: '520px' }}>
      <Box
        position="absolute"
        top={{ base: 10, lg: 6 }}
        right={{ base: 8, lg: 12 }}
        w={{ base: 20, lg: 28 }}
        h={{ base: 20, lg: 28 }}
        borderRadius="full"
        bg="accent.glow"
        filter="blur(18px)"
        opacity={0.95}
      />
      <Box
        position="absolute"
        bottom={{ base: 12, lg: 16 }}
        left={{ base: 2, lg: 4 }}
        w={{ base: 14, lg: 20 }}
        h={{ base: 14, lg: 20 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="border.subtle"
        bg="bg.tertiary"
        transform="rotate(-14deg)"
        opacity={0.9}
      />

      {post ? (
        <Box
          as={RouterLink}
          to={`/blog/${post.id}`}
          position="relative"
          display="block"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="3xl"
          overflow="hidden"
          bg="bg.secondary"
          boxShadow="xl"
          transform={{ base: 'none', lg: 'rotate(1.5deg)' }}
          _hover={{ transform: { base: 'none', lg: 'rotate(0.5deg) translateY(-4px)' } }}
          transition="transform 0.25s ease, box-shadow 0.25s ease"
        >
          {previewContent}
        </Box>
      ) : (
        <Box
          position="relative"
          display="block"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="3xl"
          overflow="hidden"
          bg="bg.secondary"
          boxShadow="xl"
          transform={{ base: 'none', lg: 'rotate(1.5deg)' }}
          transition="transform 0.25s ease, box-shadow 0.25s ease"
        >
          {previewContent}
        </Box>
      )}
    </Box>
  )
}

export default HeroArchivePreview
