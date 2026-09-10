import {
  Avatar,
  Badge,
  Box,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { MotionWrapper, toPublicPostPath } from '../../../core'
import PostMediaFrame from '../../media/components/PostMediaFrame'
import SeriesPostContext from '../../series/components/SeriesPostContext'
import { BlogArchiveSummary } from '../blog.types'
import { formatArchiveDate } from '../blog.utils'

interface FeaturedStoryProps {
  post: BlogArchiveSummary
}

const FeaturedStory = ({ post }: FeaturedStoryProps) => {
  const postPath = toPublicPostPath(post.id)
  const authorName = post.author.username || 'Anonymous'

  return (
    <MotionWrapper initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} duration={0.48}>
      <Box
        as="article"
        data-group=""
        className="signal-discovery-card signal-discovery-feature"
        position="relative"
        overflow="hidden"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="3xl"
        bg="bg.glass"
        boxShadow="sm"
        transition="transform 280ms cubic-bezier(0.22, 1, 0.36, 1), border-color 220ms ease, box-shadow 280ms ease"
        _hover={{ transform: 'translateY(-6px)', borderColor: 'action.primary', boxShadow: 'xl' }}
      >
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={0}>
          <Box
            minH={{ base: '240px', md: '320px', lg: '100%' }}
            borderRight={{ base: 'none', lg: '1px solid' }}
            borderColor="border.subtle"
            overflow="hidden"
          >
            <PostMediaFrame
              rawSource={post.featuredImage}
              title={post.title}
              priority
              sizes="(max-width: 991px) 100vw, 50vw"
              fit="contain"
              className="signal-discovery-media"
            />
          </Box>

          <Stack spacing={{ base: 5, md: 6 }} px={{ base: 6, md: 9 }} py={{ base: 7, md: 9 }}>
            <HStack spacing={3} flexWrap="wrap">
              <Badge
                px={3}
                py={1.5}
                borderRadius="full"
                bg="accent.lime"
                color="text.onAccent"
                textTransform="uppercase"
                letterSpacing="0.12em"
                fontSize="10px"
              >
                Signature
              </Badge>
              <Text fontSize="xs" letterSpacing="0.08em" color="text.tertiary">
                {formatArchiveDate(post.createdAt)}
              </Text>
            </HStack>

            <SeriesPostContext series={post.series} />

            <Stack spacing={4} flex={1}>
              <Text
                color="action.primary"
                fontSize="xs"
                fontWeight="bold"
                letterSpacing="0.14em"
                textTransform="uppercase"
              >
                Start with one strong idea
              </Text>
              <Heading
                as={RouterLink}
                to={postPath}
                fontSize={{ base: '3xl', md: '4xl' }}
                lineHeight={1.08}
                letterSpacing="-0.045em"
                color="text.primary"
                _hover={{ color: 'link.default', textDecoration: 'none' }}
                _focusVisible={{ boxShadow: 'outline', borderRadius: 'md' }}
              >
                {post.title}
              </Heading>
              <Text color="text.secondary" fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall">
                {post.excerpt || 'Fresh thoughts are on the way.'}
              </Text>
            </Stack>

            <HStack spacing={3} color="text.tertiary" fontSize="sm" flexWrap="wrap">
              <Avatar size="2xs" name={authorName} src={post.author.avatar} />
              <Text color="text.secondary">{authorName}</Text>
              <Text aria-hidden>·</Text>
              <HStack spacing={1.5}>
                <Icon as={FiClock} />
                <Text>{post.readingTime || 1} min read</Text>
              </HStack>
            </HStack>

            <HStack
              as={RouterLink}
              to={postPath}
              alignSelf="flex-start"
              spacing={2}
              px={5}
              py={3}
              borderRadius="full"
              bg="action.primary"
              color="text.onAction"
              fontWeight="semibold"
              transition="transform 220ms ease, background-color 220ms ease"
              _hover={{ bg: 'action.hover', textDecoration: 'none', transform: 'translateY(-2px)' }}
              _focusVisible={{ boxShadow: 'outline' }}
            >
              <Text fontSize="sm">Read signature story</Text>
              <Icon
                as={FiArrowRight}
                transition="transform 220ms ease"
                _groupHover={{ transform: 'translateX(4px)' }}
              />
            </HStack>
          </Stack>
        </SimpleGrid>
      </Box>
    </MotionWrapper>
  )
}

export default FeaturedStory
