import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { FadeInShimmer, MotionWrapper, ShimmerLoader } from '../../../core'
import PaginationControls from '../../../components/PaginationControls'
import BlogArchiveHero from '../components/BlogArchiveHero'
import BlogFilterToolbar from '../components/BlogFilterToolbar'
import EditorialCard from '../components/EditorialCard'
import FeaturedStory from '../components/FeaturedStory'
import { useBlogArchive } from '../useBlogArchive'

const BlogPage = () => {
  const limit = 6
  const {
    searchInput,
    setSearchInput,
    query,
    posts,
    popularTags,
    loading,
    tagsLoading,
    page,
    totalPages,
    total,
    activeTags,
    hasActiveFilters,
    setPage,
    toggleTag,
    clearQuery,
    removeTag,
    clearAllFilters,
  } = useBlogArchive(limit)

  const featuredPost = posts[0]
  const remainingPosts = posts.slice(1)
  const resultLabel = query
    ? `${total} result${total === 1 ? '' : 's'} for "${query}"`
    : hasActiveFilters
      ? `${total} result${total === 1 ? '' : 's'}`
      : `${total} blog${total === 1 ? '' : 's'}`

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
            <BlogArchiveHero
              searchQuery={searchInput}
              setSearchQuery={setSearchInput}
              resultLabel={resultLabel}
              page={page}
              totalPages={totalPages}
              hasActiveSearch={hasActiveFilters}
            />
          </MotionWrapper>

          <MotionWrapper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            duration={0.5}
          >
            <BlogFilterToolbar
              popularTags={popularTags}
              activeTags={activeTags}
              activeQuery={query}
              loading={tagsLoading}
              onToggleTag={toggleTag}
              onClearQuery={clearQuery}
              onRemoveTag={removeTag}
              onClearAll={clearAllFilters}
            />
          </MotionWrapper>

          <AnimatePresence mode="wait">
            {loading ? (
              <FadeInShimmer key="loading" delay={0.2}>
                <ShimmerLoader variant="blog" count={6} />
              </FadeInShimmer>
            ) : posts.length === 0 ? (
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
                      Try a broader keyword, remove a topic filter, or clear the search to return to
                      the latest blogs.
                    </Text>
                    <Button
                      variant="ghost"
                      color="action.primary"
                      _hover={{ bg: 'bg.tertiary' }}
                      onClick={clearAllFilters}
                    >
                      Reset filters
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
                        Latest blogs
                      </Text>
                      <Heading size="lg" color="text.primary" letterSpacing="-0.03em">
                        {hasActiveFilters ? 'Search results' : 'Blogs worth reading next'}
                      </Heading>
                    </Stack>
                    <Text color="text.secondary" fontSize="sm">
                      {hasActiveFilters
                        ? `Showing page ${page} of ${Math.max(totalPages, 1)}.`
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

          {!loading && totalPages > 1 && (
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
