import { Avatar, Box, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { toPublicPostPath } from '../../../core'
import PostMediaFrame from '../../media/components/PostMediaFrame'
import SeriesPostContext from '../../series/components/SeriesPostContext'
import { BlogArchiveSummary } from '../blog.types'
import { formatArchiveDate } from '../blog.utils'

interface EditorialCardProps {
  post: BlogArchiveSummary
  index: number
}

const EditorialCard = ({ post, index }: EditorialCardProps) => {
  const postPath = toPublicPostPath(post.id)
  const authorName = post.author.username || 'Anonymous'

  return (
    <Box
      as={motion.article}
      data-group=""
      className="signal-discovery-card signal-discovery-story"
      h="full"
      overflow="hidden"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="3xl"
      bg="bg.surface"
      boxShadow="sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={`opacity 360ms ease ${Math.min(index, 5) * 55}ms, transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease, border-color 220ms ease`}
      _hover={{ transform: 'translateY(-6px)', borderColor: 'action.primary', boxShadow: 'lg' }}
      _active={{ transform: 'scale(0.988)' }}
    >
      <Box
        h={{ base: '220px', md: '250px' }}
        overflow="hidden"
        borderBottom="1px solid"
        borderColor="border.subtle"
      >
        <PostMediaFrame
          rawSource={post.featuredImage}
          title={post.title}
          sizes="(max-width: 991px) 100vw, 50vw"
          fit="contain"
          className="signal-discovery-media"
        />
      </Box>

      <Stack spacing={5} p={{ base: 5, md: 6 }} minH={{ md: '360px' }}>
        <HStack spacing={3} color="text.tertiary" fontSize="xs" flexWrap="wrap">
          <HStack spacing={2}>
            <Avatar size="2xs" name={authorName} src={post.author.avatar} />
            <Text color="text.secondary">{authorName}</Text>
          </HStack>
          <Text aria-hidden>·</Text>
          <Text>{formatArchiveDate(post.createdAt)}</Text>
          <Text aria-hidden>·</Text>
          <HStack spacing={1.5}>
            <Icon as={FiClock} />
            <Text>{post.readingTime || 1} min read</Text>
          </HStack>
        </HStack>

        <SeriesPostContext series={post.series} />

        <Stack spacing={3} flex={1}>
          <Heading
            as={RouterLink}
            to={postPath}
            size="lg"
            color="text.primary"
            lineHeight="1.18"
            letterSpacing="-0.03em"
            noOfLines={2}
            _hover={{ color: 'link.default', textDecoration: 'none' }}
            _focusVisible={{ boxShadow: 'outline', borderRadius: 'md' }}
          >
            {post.title}
          </Heading>
          <Text color="text.secondary" lineHeight="tall" noOfLines={3}>
            {post.excerpt || 'Fresh thoughts are on the way.'}
          </Text>
        </Stack>

        <HStack
          as={RouterLink}
          to={postPath}
          alignSelf="flex-start"
          spacing={2}
          color="action.primary"
          fontWeight="semibold"
          _hover={{ textDecoration: 'none', color: 'action.hover' }}
          _focusVisible={{ boxShadow: 'outline', borderRadius: 'md' }}
        >
          <Text fontSize="sm">Read story</Text>
          <Icon
            as={FiArrowRight}
            transition="transform 220ms ease"
            _groupHover={{ transform: 'translateX(5px)' }}
          />
        </HStack>
      </Stack>
    </Box>
  )
}

export default EditorialCard
