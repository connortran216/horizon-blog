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
}: BlogArchiveHeroProps) => {
  return (
    <Box position="relative" overflow="hidden" px={0} py={{ base: 4, md: 7 }}>
      <Box
        position="absolute"
        top="-12%"
        right="-4%"
        w={{ base: '220px', md: '360px' }}
        h={{ base: '220px', md: '360px' }}
        bg="action.glow"
        filter="blur(100px)"
        opacity={0.5}
        pointerEvents="none"
      />

      <Grid
        templateColumns={{ base: '1fr', xl: 'minmax(0, 1.35fr) minmax(320px, 0.65fr)' }}
        gap={{ base: 8, xl: 14 }}
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
              fontSize={{ base: '4xl', md: '5xl' }}
              lineHeight={{ base: 1.08, md: 1 }}
              letterSpacing="-0.055em"
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
            borderRadius="3xl"
            bg="bg.surface"
            boxShadow="md"
            transform={{ xl: 'rotate(1deg)' }}
            transition="transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease"
            _hover={{ transform: 'rotate(0deg) translateY(-3px)', boxShadow: 'lg' }}
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

            <SimpleGrid columns={{ base: 2 }} spacing={3}>
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
            </SimpleGrid>
          </Stack>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default BlogArchiveHero
