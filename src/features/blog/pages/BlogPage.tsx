import { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  Wrap,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { apiService } from '../../../core/services/api.service'
import { FadeInShimmer, MotionWrapper, ShimmerLoader } from '../../../core'
import PaginationControls from '../../../components/PaginationControls'
import StatChip from '../../../components/ui/StatChip'
import EditorialCard from '../components/EditorialCard'
import FeaturedStory from '../components/FeaturedStory'
import { BlogArchivePost } from '../blog.types'

const BlogPage = () => {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [blogPosts, setBlogPosts] = useState<BlogArchivePost[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 6

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true)
        const response = await apiService.get<{
          data: BlogArchivePost[]
          page: number
          limit: number
          total: number
        }>('/posts', { page, limit, status: 'published' })

        setBlogPosts(response.data)
        if (response.total !== undefined) {
          setTotal(response.total)
          setTotalPages(Math.ceil(response.total / limit))
        } else {
          setTotal(0)
          setTotalPages(1)
        }
      } catch (error) {
        console.error('Failed to load blog posts:', error)
        setBlogPosts([])
      } finally {
        setLoading(false)
      }
    }

    void loadPosts()
  }, [page, location.pathname])

  const trimmedQuery = searchQuery.trim().toLowerCase()
  const filteredPosts = blogPosts.filter((post) => {
    if (!trimmedQuery) return true

    return (
      post.title.toLowerCase().includes(trimmedQuery) ||
      post.content_markdown.toLowerCase().includes(trimmedQuery)
    )
  })

  const featuredPost = filteredPosts[0]
  const remainingPosts = filteredPosts.slice(1)
  const resultLabel = trimmedQuery
    ? `${filteredPosts.length} result${filteredPosts.length === 1 ? '' : 's'} for "${searchQuery.trim()}"`
    : `${total} published stor${total === 1 ? 'y' : 'ies'}`

  return (
    <Box position="relative" pb={12}>
      <Box
        position="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '92%', md: '80%' }}
        h="320px"
        bg="accent.glow"
        filter="blur(120px)"
        opacity={0.7}
        pointerEvents="none"
      />

      <Container maxW="container.xl" py={{ base: 8, md: 12 }} position="relative">
        <VStack spacing={{ base: 8, md: 10 }} align="stretch">
          <MotionWrapper
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            duration={0.7}
          >
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
              <Stack spacing={8}>
                <Stack spacing={5} maxW="4xl">
                  <Text
                    fontSize="sm"
                    textTransform="uppercase"
                    letterSpacing="0.16em"
                    color="text.tertiary"
                  >
                    Horizon archive
                  </Text>
                  <Heading
                    fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                    lineHeight={{ base: 1.05, md: 0.98 }}
                    letterSpacing="-0.06em"
                    color="text.primary"
                  >
                    Essays, build notes, and sharp observations from the notebook.
                  </Heading>
                  <Text
                    maxW="3xl"
                    color="text.secondary"
                    fontSize={{ base: 'md', md: 'lg' }}
                    lineHeight="tall"
                  >
                    This archive is designed for slow reading and fast scanning. Browse recent
                    entries, search for a specific idea, and jump into the pieces worth your full
                    attention.
                  </Text>
                </Stack>

                <Wrap spacing={3}>
                  <StatChip label="Archive" value={resultLabel} />
                  <StatChip label="Page" value={`${page}/${Math.max(totalPages, 1)}`} />
                  <StatChip label="Focus" value={trimmedQuery ? 'Search mode' : 'Latest writing'} />
                </Wrap>

                <Box maxW="2xl">
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" h="full">
                      <SearchIcon color="text.tertiary" />
                    </InputLeftElement>
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search titles, ideas, and notes"
                      pl={12}
                      pr={searchQuery ? 12 : 4}
                      bg="bg.page"
                      borderColor="border.default"
                      _hover={{ borderColor: 'accent.primary' }}
                      _focus={{ borderColor: 'accent.primary', boxShadow: 'outline' }}
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
                </Box>
              </Stack>
            </Box>
          </MotionWrapper>

          <AnimatePresence mode="wait">
            {loading ? (
              <FadeInShimmer key="loading" delay={0.2}>
                <ShimmerLoader variant="blog" count={6} />
              </FadeInShimmer>
            ) : filteredPosts.length === 0 ? (
              <MotionWrapper
                key="empty"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                duration={0.4}
              >
                <Box
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="3xl"
                  bg="bg.secondary"
                  px={{ base: 6, md: 10 }}
                  py={{ base: 10, md: 14 }}
                  textAlign="center"
                >
                  <VStack spacing={4} align="center">
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg="bg.tertiary"
                      color="text.secondary"
                    >
                      Nothing matched
                    </Badge>
                    <Heading size="lg" color="text.primary">
                      No stories found for that search.
                    </Heading>
                    <Text maxW="2xl" color="text.secondary" lineHeight="tall">
                      Try a broader keyword, a title fragment, or clear the search to return to the
                      latest archive entries.
                    </Text>
                    <Button
                      variant="ghost"
                      color="accent.primary"
                      _hover={{ bg: 'bg.tertiary' }}
                      onClick={() => setSearchQuery('')}
                    >
                      Reset search
                    </Button>
                  </VStack>
                </Box>
              </MotionWrapper>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <VStack align="stretch" spacing={{ base: 8, md: 10 }}>
                  <Flex
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'flex-start', md: 'flex-end' }}
                    justify="space-between"
                    gap={4}
                  >
                    <Stack spacing={2}>
                      <Text
                        fontSize="sm"
                        textTransform="uppercase"
                        letterSpacing="0.14em"
                        color="text.tertiary"
                      >
                        Curated archive
                      </Text>
                      <Heading size="lg" color="text.primary" letterSpacing="-0.03em">
                        {trimmedQuery ? 'Search results' : 'Stories worth opening next'}
                      </Heading>
                    </Stack>
                    <Text color="text.secondary" fontSize="sm">
                      {trimmedQuery
                        ? `Showing ${filteredPosts.length} matching entries on this page.`
                        : `Showing page ${page} of ${Math.max(totalPages, 1)}.`}
                    </Text>
                  </Flex>

                  {featuredPost && <FeaturedStory post={featuredPost} />}

                  {remainingPosts.length > 0 && (
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                      {remainingPosts.map((post, index) => (
                        <EditorialCard key={post.id} post={post} index={index + 1} />
                      ))}
                    </SimpleGrid>
                  )}
                </VStack>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && totalPages > 1 && !trimmedQuery && (
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalCount={total}
              pageSize={limit}
              onPageChange={setPage}
              showOnlyWhenMultiple={false}
            />
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default BlogPage
