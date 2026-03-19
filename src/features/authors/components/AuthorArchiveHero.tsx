import {
  Avatar,
  Badge,
  Box,
  Button,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import StatChip from '../../../components/ui/StatChip'
import { AuthorArchiveUser } from '../authors.types'

interface AuthorArchiveHeroProps {
  author: AuthorArchiveUser
  currentPage: number
  totalPages: number
  totalPosts: number | null
}

const AuthorArchiveHero = ({
  author,
  currentPage,
  totalPages,
  totalPosts,
}: AuthorArchiveHeroProps) => {
  const bio = author.bio?.trim() || `Published writing from ${author.name} on Horizon Blog.`

  return (
    <Box
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="3xl"
      bg="bg.glass"
      backdropFilter="blur(18px)"
      px={{ base: 6, md: 10 }}
      py={{ base: 8, md: 10 }}
      boxShadow="md"
    >
      <Box
        position="absolute"
        top="-16%"
        right="-6%"
        w={{ base: '220px', md: '320px' }}
        h={{ base: '220px', md: '320px' }}
        bg="action.glow"
        filter="blur(110px)"
        opacity={0.9}
        pointerEvents="none"
      />

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={{ base: 8, xl: 10 }} position="relative">
        <Stack spacing={6} maxW="4xl">
          <Badge
            alignSelf="flex-start"
            px={3}
            py={1.5}
            borderRadius="full"
            bg="bg.tertiary"
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing="0.18em"
            fontSize="10px"
          >
            Public author archive
          </Badge>

          <Stack spacing={4}>
            <Heading
              fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
              lineHeight={{ base: 1.04, md: 0.98 }}
              letterSpacing="-0.06em"
              color="text.primary"
            >
              {author.name}
            </Heading>
            <Text
              maxW="3xl"
              color="text.secondary"
              fontSize={{ base: 'md', md: 'lg' }}
              lineHeight="tall"
            >
              {bio}
            </Text>
          </Stack>

          <Wrap spacing={3}>
            <StatChip
              label="Published blogs"
              value={totalPosts === null ? 'Loading...' : String(totalPosts)}
            />
            <StatChip label="Page" value={`${currentPage} of ${Math.max(totalPages, 1)}`} />
            <StatChip label="Surface" value="Public archive" />
          </Wrap>

          <HStack spacing={4} flexWrap="wrap">
            <Button
              as={RouterLink}
              to="/blog"
              bg="action.primary"
              color="white"
              borderRadius="full"
              px={6}
              _hover={{ bg: 'action.hover' }}
              rightIcon={<FiArrowRight />}
            >
              Browse all blogs
            </Button>
            <Text color="text.tertiary" fontSize="sm">
              Only published writing appears here. Drafts stay private.
            </Text>
          </HStack>
        </Stack>

        <Box
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          bg="bg.page"
          px={{ base: 6, md: 7 }}
          py={{ base: 6, md: 7 }}
          boxShadow="sm"
        >
          <Stack spacing={5} align={{ base: 'center', md: 'flex-start' }}>
            <Avatar
              size="2xl"
              boxSize={{ base: '96px', md: '120px' }}
              src={author.avatar_url || undefined}
              name={author.name}
            />

            <Stack spacing={2} textAlign={{ base: 'center', md: 'left' }}>
              <Badge
                alignSelf={{ base: 'center', md: 'flex-start' }}
                px={3}
                py={1}
                borderRadius="full"
                bg="action.subtle"
                color="action.primary"
                textTransform="uppercase"
                letterSpacing="0.14em"
                fontSize="10px"
              >
                Reader-facing profile
              </Badge>
              <Heading size="md" color="text.primary">
                {author.name}
              </Heading>
              <Text color="text.secondary" lineHeight="tall">
                {author.bio?.trim()
                  ? 'Public bio available for readers browsing this archive.'
                  : 'No public bio yet, but the published writing is available below.'}
              </Text>
            </Stack>
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  )
}

export default AuthorArchiveHero
