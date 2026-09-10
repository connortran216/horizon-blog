import { Box, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { toPublicPostPath } from '../../../core'
import { BlogArchivePost } from '../../blog/blog.types'
import { formatArchiveDate, getExcerpt } from '../../blog/blog.utils'

interface AuthorArchiveStoryListItemProps {
  post: BlogArchivePost
}

const AuthorArchiveStoryListItem = ({ post }: AuthorArchiveStoryListItemProps) => {
  return (
    <Box
      as={RouterLink}
      to={toPublicPostPath(post.id)}
      display="block"
      data-group=""
      className="signal-author-story"
      border="1px solid"
      borderColor="transparent"
      borderRadius="2xl"
      px={{ base: 5, md: 6 }}
      py={{ base: 5, md: 6 }}
      transition="background-color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease"
      _hover={{
        bg: 'bg.glass',
        borderColor: 'border.subtle',
        boxShadow: 'sm',
        transform: 'translateY(-4px)',
        textDecoration: 'none',
      }}
      _active={{ transform: 'scale(0.99)' }}
      _focusVisible={{ boxShadow: 'outline', borderColor: 'action.primary' }}
    >
      <HStack spacing={{ base: 4, md: 6 }} align="center">
        <Stack spacing={2.5} maxW="4xl" flex={1} minW={0}>
          <Text fontSize="sm" color="text.tertiary">
            {formatArchiveDate(post.updated_at)}
          </Text>
          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight="semibold"
            lineHeight={{ base: 1.15, md: 1.08 }}
            letterSpacing="-0.035em"
            color="text.primary"
          >
            {post.title}
          </Text>
          <Text color="text.secondary" lineHeight="tall" noOfLines={2}>
            {getExcerpt(post.content_markdown)}
          </Text>
        </Stack>
        <Icon
          as={FiArrowRight}
          color="action.primary"
          boxSize={5}
          flexShrink={0}
          transition="transform 220ms ease"
          _groupHover={{ transform: 'translateX(6px)' }}
        />
      </HStack>
    </Box>
  )
}

export default AuthorArchiveStoryListItem
