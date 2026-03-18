import {
  Badge,
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

interface BlogArchiveHeroProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  resultLabel: string
  page: number
  totalPages: number
  hasActiveSearch: boolean
}

const BlogArchiveHero = ({
  searchQuery,
  setSearchQuery,
  resultLabel,
  page,
  totalPages,
  hasActiveSearch,
}: BlogArchiveHeroProps) => {
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
        top="-12%"
        right="-4%"
        w={{ base: '220px', md: '360px' }}
        h={{ base: '220px', md: '360px' }}
        bg="action.glow"
        filter="blur(100px)"
        opacity={0.9}
        pointerEvents="none"
      />

      <Grid
        templateColumns={{ base: '1fr', xl: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)' }}
        gap={{ base: 8, xl: 10 }}
        position="relative"
      >
        <GridItem>
          <Stack spacing={{ base: 5, md: 6 }} maxW="4xl">
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
              Horizon blog
            </Badge>

            <Heading
              fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
              lineHeight={{ base: 1.04, md: 0.96 }}
              letterSpacing="-0.065em"
              color="text.primary"
              maxW="5xl"
            >
              Thoughtful blogs about life, work, and technology.
            </Heading>

            <Text
              maxW="3xl"
              color="text.secondary"
              fontSize={{ base: 'md', md: 'lg' }}
              lineHeight="tall"
            >
              Browse the latest blogs, search by topic, and open the writing that deserves your full
              attention.
            </Text>
          </Stack>
        </GridItem>

        <GridItem>
          <Stack
            spacing={5}
            p={{ base: 5, md: 6 }}
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="2xl"
            bg="bg.page"
            boxShadow="sm"
          >
            <Stack spacing={2}>
              <Text
                fontSize="sm"
                textTransform="uppercase"
                letterSpacing="0.16em"
                color="text.tertiary"
              >
                Find a blog
              </Text>
            </Stack>

            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" h="full">
                <SearchIcon color="text.tertiary" />
              </InputLeftElement>
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search blogs and topics"
                pl={12}
                pr={searchQuery ? 16 : 4}
                bg="bg.secondary"
                borderColor="border.default"
                _hover={{ borderColor: 'action.primary' }}
                _focus={{
                  borderColor: 'action.primary',
                  boxShadow: '0 0 0 1px var(--chakra-colors-action-primary)',
                }}
              />
              {searchQuery && (
                <InputRightElement h="full" width="auto" pr={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    color="text.secondary"
                    _hover={{ bg: 'bg.tertiary', color: 'text.primary' }}
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </Button>
                </InputRightElement>
              )}
            </InputGroup>

            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
              <Box>
                <Text
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                  color="text.tertiary"
                >
                  Blog
                </Text>
                <Text mt={1.5} color="text.primary" fontWeight="semibold">
                  {resultLabel}
                </Text>
              </Box>
              <Box>
                <Text
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                  color="text.tertiary"
                >
                  Page
                </Text>
                <Text mt={1.5} color="text.primary" fontWeight="semibold">
                  {page} of {Math.max(totalPages, 1)}
                </Text>
              </Box>
              <Box>
                <Text
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                  color="text.tertiary"
                >
                  View
                </Text>
                <Text mt={1.5} color="text.primary" fontWeight="semibold">
                  {hasActiveSearch ? 'Search results' : 'Latest blogs'}
                </Text>
              </Box>
            </SimpleGrid>
          </Stack>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default BlogArchiveHero
