import { Avatar, Box, Button, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight, FiFileText, FiUser, FiUsers } from 'react-icons/fi'
import { AuthorArchiveUser } from '../authors.types'

interface AuthorArchiveHeroProps {
  author: AuthorArchiveUser
  totalPosts: number | null
}

const MOCK_FOLLOWERS = '18.2k'
const MOCK_FOLLOWING = '760'

const AuthorArchiveHero = ({ author, totalPosts }: AuthorArchiveHeroProps) => {
  const bio = author.bio?.trim()
  const articleCount =
    totalPosts === null ? '...' : new Intl.NumberFormat('en-US').format(totalPosts)

  return (
    <Box
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="3xl"
      bg="bg.secondary"
      px={{ base: 6, md: 7, lg: 8 }}
      py={{ base: 7, md: 8, lg: 9 }}
      boxShadow="sm"
    >
      <Stack spacing={{ base: 7, md: 8 }}>
        <Stack spacing={5} align="center" textAlign="center">
          <Avatar
            size="2xl"
            boxSize={{ base: '120px', md: '136px' }}
            src={author.avatar_url || undefined}
            name={author.name}
            bg="bg.elevated"
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

          <HStack
            spacing={3}
            py={4}
            borderTop="1px solid"
            borderColor="border.subtle"
            color="text.primary"
          >
            <Box as={FiUsers} color="text.tertiary" boxSize={5} flexShrink={0} />
            <Text fontSize={{ base: 'lg', md: 'xl' }}>
              <Text as="span" fontWeight="semibold">
                {MOCK_FOLLOWERS}
              </Text>{' '}
              Followers
            </Text>
          </HStack>

          <HStack
            spacing={3}
            py={4}
            borderTop="1px solid"
            borderBottom="1px solid"
            borderColor="border.subtle"
            color="text.primary"
          >
            <Box as={FiUser} color="text.tertiary" boxSize={5} flexShrink={0} />
            <Text fontSize={{ base: 'lg', md: 'xl' }}>
              <Text as="span" fontWeight="semibold">
                {MOCK_FOLLOWING}
              </Text>{' '}
              Following
            </Text>
          </HStack>
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
