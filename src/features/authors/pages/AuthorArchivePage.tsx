import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { MotionWrapper, ShimmerLoader } from '../../../core'
import PaginationControls from '../../../components/PaginationControls'
import EditorialCard from '../../blog/components/EditorialCard'
import FeaturedStory from '../../blog/components/FeaturedStory'
import AuthorArchiveHero from '../components/AuthorArchiveHero'
import { useAuthorArchive } from '../useAuthorArchive'

const PAGE_SIZE = 6

const AuthorArchivePage = () => {
  const {
    archive,
    currentPage,
    totalPages,
    profileLoading,
    postsLoading,
    pageErrorState,
    postsErrorState,
    setPage,
    retryPosts,
  } = useAuthorArchive(PAGE_SIZE)

  const featuredPost = archive?.posts[0]
  const remainingPosts = archive?.posts.slice(1) || []
  const isInitialLoading = profileLoading && !archive

  return (
    <Box position="relative" pb={12} overflowX="hidden">
      <Box
        position="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '92%', md: '80%' }}
        h="320px"
        bg="action.glow"
        filter="blur(130px)"
        opacity={0.68}
        pointerEvents="none"
      />

      <Container maxW="container.xl" py={{ base: 8, md: 12 }} position="relative">
        <VStack spacing={{ base: 8, md: 10 }} align="stretch">
          {isInitialLoading ? (
            <>
              <Box
                border="1px solid"
                borderColor="border.subtle"
                borderRadius="3xl"
                bg="bg.glass"
                backdropFilter="blur(18px)"
                px={{ base: 6, md: 10 }}
                py={{ base: 8, md: 10 }}
                boxShadow="md"
              >
                <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={{ base: 8, xl: 10 }}>
                  <Stack spacing={5}>
                    <Skeleton h="24px" maxW="180px" borderRadius="full" />
                    <Skeleton h={{ base: '56px', md: '72px' }} maxW="3xl" borderRadius="2xl" />
                    <SkeletonText noOfLines={3} spacing={3} maxW="3xl" />
                    <HStack spacing={3} flexWrap="wrap">
                      <Skeleton h="56px" w="148px" borderRadius="full" />
                      <Skeleton h="56px" w="148px" borderRadius="full" />
                      <Skeleton h="56px" w="148px" borderRadius="full" />
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
                      <SkeletonCircle size="28" />
                      <Skeleton h="20px" w="120px" borderRadius="full" />
                      <SkeletonText noOfLines={3} spacing={3} w="full" />
                    </Stack>
                  </Box>
                </SimpleGrid>
              </Box>

              <ShimmerLoader variant="blog" count={3} />
            </>
          ) : pageErrorState ? (
            <MotionWrapper initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
                  <Badge px={3} py={1} borderRadius="full" bg="bg.tertiary" color="text.secondary">
                    Author archive
                  </Badge>
                  <Heading size="lg" color="text.primary">
                    {pageErrorState.title}
                  </Heading>
                  <Text maxW="2xl" color="text.secondary" lineHeight="tall">
                    {pageErrorState.description}
                  </Text>
                  <Button
                    as={RouterLink}
                    to="/blog"
                    variant="ghost"
                    color="action.primary"
                    _hover={{ bg: 'bg.tertiary' }}
                  >
                    Back to Blog
                  </Button>
                </VStack>
              </Box>
            </MotionWrapper>
          ) : archive ? (
            <>
              <MotionWrapper
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                duration={0.7}
              >
                <AuthorArchiveHero
                  author={archive.user}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalPosts={postsLoading || postsErrorState ? null : archive.total}
                />
              </MotionWrapper>

              {postsLoading ? (
                <ShimmerLoader variant="blog" count={3} />
              ) : postsErrorState ? (
                <MotionWrapper initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
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
                        Posts unavailable
                      </Badge>
                      <Heading size="lg" color="text.primary">
                        {postsErrorState.title}
                      </Heading>
                      <Text maxW="2xl" color="text.secondary" lineHeight="tall">
                        {postsErrorState.description}
                      </Text>
                      <Button
                        onClick={retryPosts}
                        bg="action.primary"
                        color="white"
                        _hover={{ bg: 'action.hover' }}
                        borderRadius="full"
                      >
                        Retry loading blogs
                      </Button>
                    </VStack>
                  </Box>
                </MotionWrapper>
              ) : archive.posts.length === 0 ? (
                <MotionWrapper initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
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
                        Nothing published yet
                      </Badge>
                      <Heading size="lg" color="text.primary">
                        This author has not published any blogs yet.
                      </Heading>
                      <Text maxW="2xl" color="text.secondary" lineHeight="tall">
                        Check back later or continue browsing the latest writing across Horizon.
                      </Text>
                      <Button
                        as={RouterLink}
                        to="/blog"
                        bg="action.primary"
                        color="white"
                        _hover={{ bg: 'action.hover' }}
                        borderRadius="full"
                      >
                        Explore the blog
                      </Button>
                    </VStack>
                  </Box>
                </MotionWrapper>
              ) : (
                <VStack align="stretch" spacing={{ base: 8, md: 10 }}>
                  <HStack
                    justify="space-between"
                    align={{ base: 'flex-start', md: 'flex-end' }}
                    flexWrap="wrap"
                    spacing={4}
                  >
                    <Stack spacing={2}>
                      <Text
                        fontSize="sm"
                        textTransform="uppercase"
                        letterSpacing="0.14em"
                        color="text.tertiary"
                      >
                        Published writing
                      </Text>
                      <Heading size="lg" color="text.primary" letterSpacing="-0.03em">
                        {archive.user.name}&apos;s public archive
                      </Heading>
                    </Stack>
                    <Text color="text.secondary" fontSize="sm">
                      Showing page {currentPage} of {Math.max(totalPages, 1)}.
                    </Text>
                  </HStack>

                  {featuredPost ? <FeaturedStory post={featuredPost} /> : null}

                  {remainingPosts.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                      {remainingPosts.map((post, index) => (
                        <EditorialCard key={post.id} post={post} index={index + 1} />
                      ))}
                    </SimpleGrid>
                  ) : null}
                </VStack>
              )}

              {!postsLoading && !postsErrorState && totalPages > 1 ? (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={archive.total}
                  pageSize={archive.limit || PAGE_SIZE}
                  onPageChange={setPage}
                  showOnlyWhenMultiple={false}
                />
              ) : null}
            </>
          ) : null}
        </VStack>
      </Container>
    </Box>
  )
}

export default AuthorArchivePage
