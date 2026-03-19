import {
  Badge,
  Box,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight, FiFileText } from 'react-icons/fi'
import { MotionWrapper } from '../../../core'
import StatChip from '../../../components/ui/StatChip'
import { useResolvedCoverImage } from '../../media/useResolvedCoverImage'
import DefaultPostCover from '../../media/components/DefaultPostCover'
import { BlogArchivePost } from '../blog.types'
import {
  extractFirstImageUrl,
  formatArchiveDate,
  getExcerpt,
  getPostAuthorName,
  getReadingTime,
} from '../blog.utils'

interface FeaturedStoryProps {
  post: BlogArchivePost
}

const FeaturedStory = ({ post }: FeaturedStoryProps) => {
  const coverImage = useResolvedCoverImage(extractFirstImageUrl(post.content_markdown))
  const authorName = getPostAuthorName(post)

  return (
    <MotionWrapper
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      duration={0.6}
      delay={0.15}
    >
      <Box as={RouterLink} to={`/blog/${post.id}`} display="block">
        <Box
          position="relative"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="3xl"
          overflow="hidden"
          bg="bg.glass"
          backdropFilter="blur(18px)"
          boxShadow="lg"
        >
          <Box
            position="absolute"
            insetX={{ base: '-15%', lg: '45%' }}
            top="-25%"
            h="260px"
            bg="accent.glow"
            filter="blur(90px)"
            pointerEvents="none"
          />

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={0} position="relative">
            <Stack spacing={6} px={{ base: 6, md: 10 }} py={{ base: 8, md: 10 }} justify="center">
              <HStack spacing={3} flexWrap="wrap">
                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg="action.primary"
                  color="white"
                  textTransform="uppercase"
                  letterSpacing="0.12em"
                  fontSize="10px"
                >
                  Editor&apos;s pick
                </Badge>
                <Text
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                  color="text.tertiary"
                >
                  {formatArchiveDate(post.created_at)}
                </Text>
              </HStack>

              <Stack spacing={4}>
                <Text
                  fontSize="sm"
                  color="text.secondary"
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                >
                  Quiet writing. Sharp ideas.
                </Text>
                <Heading
                  fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                  lineHeight={{ base: 1.1, md: 1 }}
                  letterSpacing="-0.05em"
                  color="text.primary"
                >
                  {post.title}
                </Heading>
                <Text
                  maxW="2xl"
                  color="text.secondary"
                  fontSize={{ base: 'md', md: 'lg' }}
                  lineHeight="tall"
                >
                  {getExcerpt(post.content_markdown)}
                </Text>
              </Stack>

              <Wrap spacing={3}>
                <StatChip label="Author" value={authorName} />
                <StatChip
                  label="Reading time"
                  value={`${getReadingTime(post.content_markdown)} min`}
                />
              </Wrap>

              <HStack pt={2} spacing={4} flexWrap="wrap">
                <HStack
                  spacing={2}
                  px={4}
                  py={3}
                  borderRadius="full"
                  bg="action.primary"
                  color="white"
                  fontWeight="semibold"
                >
                  <Text fontSize="sm">Read featured story</Text>
                  <Icon as={FiArrowRight} />
                </HStack>
                <HStack spacing={2} color="text.secondary">
                  <Icon as={FiFileText} />
                  <Text fontSize="sm">Long-form blog posts, essays, and technical writing</Text>
                </HStack>
              </HStack>
            </Stack>

            <Box
              minH={{ base: '280px', lg: '100%' }}
              borderLeft={{ base: 'none', lg: '1px solid' }}
              borderColor="border.subtle"
            >
              {coverImage ? (
                <Image src={coverImage} alt={post.title} w="full" h="full" objectFit="cover" />
              ) : (
                <DefaultPostCover
                  title={post.title}
                  eyebrow=""
                  h="full"
                  minH={{ base: '280px', lg: '100%' }}
                />
              )}
            </Box>
          </SimpleGrid>
        </Box>
      </Box>
    </MotionWrapper>
  )
}

export default FeaturedStory
