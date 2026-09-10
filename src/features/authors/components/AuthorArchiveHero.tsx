import { Avatar, Box, Button, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight, FiFileText } from 'react-icons/fi'
import { AuthorArchiveUser } from '../authors.types'

interface AuthorArchiveHeroProps {
  author: AuthorArchiveUser
  totalPosts: number | null
}

const AuthorArchiveHero = ({ author, totalPosts }: AuthorArchiveHeroProps) => {
  const bio = author.bio?.trim()
  const articleCount =
    totalPosts === null ? '...' : new Intl.NumberFormat('en-US').format(totalPosts)

  return (
    <Box
      data-group=""
      className="signal-author-card"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="3xl"
      bg="bg.glass"
      px={{ base: 6, md: 7, lg: 8 }}
      py={{ base: 7, md: 8, lg: 9 }}
      boxShadow="md"
      transition="transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms ease, border-color 220ms ease"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', borderColor: 'action.primary' }}
    >
      <Stack spacing={{ base: 7, md: 8 }}>
        <Stack spacing={5} align="center" textAlign="center">
          <Avatar
            size="2xl"
            boxSize={{ base: '120px', md: '136px' }}
            src={author.avatar_url || undefined}
            name={author.name}
            bg="bg.elevated"
            border="4px solid"
            borderColor="bg.surface"
            boxShadow="0 12px 32px -14px rgba(49, 88, 212, 0.55)"
            transform="rotate(-2deg)"
            transition="transform 260ms cubic-bezier(0.22, 1, 0.36, 1)"
            _groupHover={{ transform: 'rotate(0deg) scale(1.03)' }}
          />

          <Heading
            fontSize={{ base: '3xl', md: '4xl' }}
            lineHeight={1}
            letterSpacing="-0.05em"
            color="text.primary"
          >
            {author.name}
          </Heading>

          <Text
            color="text.secondary"
            fontSize={{ base: 'md', md: 'lg' }}
            fontStyle="italic"
            fontWeight="medium"
          >
            Public Writer on Horizon Blog
          </Text>

          <Box h="1px" bg="border.subtle" w="full" />

          {bio ? (
            <Text
              color="text.secondary"
              fontSize={{ base: 'sm', md: 'md' }}
              lineHeight="tall"
              textAlign="left"
            >
              {bio}
            </Text>
          ) : null}
        </Stack>

        <Stack spacing={0}>
          <HStack
            spacing={3}
            py={4}
            borderTop="1px solid"
            borderColor="border.subtle"
            color="text.primary"
          >
            <Box as={FiFileText} color="text.tertiary" boxSize={5} flexShrink={0} />
            <Text fontSize={{ base: 'lg', md: 'xl' }}>
              <Text as="span" fontWeight="semibold">
                {articleCount}
              </Text>{' '}
              Articles
            </Text>
          </HStack>

          <Text
            py={4}
            borderTop="1px solid"
            borderBottom="1px solid"
            borderColor="border.subtle"
            color="text.secondary"
            fontSize="sm"
            lineHeight="tall"
          >
            Essays, field notes, and practical writing published on Horizon.
          </Text>
        </Stack>

        <Box pt={1}>
          <Button
            as={RouterLink}
            to="/blog"
            bg="action.primary"
            color="white"
            borderRadius="full"
            px={6}
            w="full"
            h="56px"
            _hover={{ bg: 'action.hover' }}
            _active={{ transform: 'scale(0.98)' }}
            transition="transform 180ms ease, background-color 180ms ease"
            rightIcon={<FiArrowRight />}
          >
            Browse All Blogs
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}

export default AuthorArchiveHero
