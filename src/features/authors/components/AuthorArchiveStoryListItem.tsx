import { Box, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { BlogArchivePost } from '../../blog/blog.types'
import { formatArchiveDate, getExcerpt } from '../../blog/blog.utils'

interface AuthorArchiveStoryListItemProps {
  post: BlogArchivePost
}

const AuthorArchiveStoryListItem = ({ post }: AuthorArchiveStoryListItemProps) => {
  return (
    <Box
      as={RouterLink}
      to={`/blog/${post.id}`}
      display="block"
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
        transform: 'translateY(-1px)',
        textDecoration: 'none',
      }}
    >
      <Stack spacing={2.5} maxW="4xl">
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
    </Box>
  )
}

export default AuthorArchiveStoryListItem
