import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
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
import AuthorArchiveStoryListItem from '../components/AuthorArchiveStoryListItem'
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
        <Grid
          templateColumns={{ base: '1fr', lg: '320px minmax(0, 1fr)' }}
          gap={{ base: 8, md: 10, lg: 14 }}
          alignItems="start"
        >
          {isInitialLoading ? (
            <>
              <GridItem>
                <Box
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="3xl"
                  bg="bg.secondary"
                  px={{ base: 6, md: 7, lg: 8 }}
                  py={{ base: 7, md: 8, lg: 9 }}
                  boxShadow="sm"
                >
                  <Stack spacing={6}>
                    <Stack spacing={5} align="center">
                      <SkeletonCircle size="24" />
                      <Skeleton h={{ base: '44px', md: '56px' }} maxW="220px" w="full" />
                      <Skeleton h="24px" maxW="220px" w="full" />
                      <Box h="1px" bg="border.subtle" w="full" />
                      <SkeletonText noOfLines={3} spacing={3} w="full" />
                    </Stack>
                    <Stack spacing={5}>
                      <Box h="1px" bg="border.subtle" />
                      <HStack spacing={3}>
                        <Skeleton h="20px" w="20px" />
                        <Skeleton h="28px" maxW="180px" w="full" />
                      </HStack>
                      <Box h="1px" bg="border.subtle" />
                      <HStack spacing={3}>
                        <Skeleton h="20px" w="20px" />
                        <Skeleton h="28px" maxW="180px" w="full" />
                      </HStack>
                      <Box h="1px" bg="border.subtle" />
                      <HStack spacing={3}>
                        <Skeleton h="20px" w="20px" />
                        <Skeleton h="28px" maxW="180px" w="full" />
                      </HStack>
                      <Box h="1px" bg="border.subtle" />
                      <Skeleton h="58px" borderRadius="full" />
                    </Stack>
                  </Stack>
                </Box>
              </GridItem>
              <GridItem>
                <Stack spacing={5}>
                  <Skeleton h="22px" maxW="140px" borderRadius="full" />
                  <SkeletonText noOfLines={2} spacing={4} maxW="320px" />
                  <Box
                    border="1px solid"
                    borderColor="border.subtle"
                    borderRadius="3xl"
                    bg="bg.secondary"
                    px={{ base: 6, md: 8, lg: 10 }}
                    py={{ base: 7, md: 8, lg: 9 }}
                  >
                    <Stack spacing={5}>
                      <HStack justify="space-between">
                        <Skeleton h="24px" w="100px" borderRadius="full" />
                        <Skeleton h="52px" w="56px" borderRadius="xl" />
                      </HStack>
                      <SkeletonText noOfLines={4} spacing={4} maxW="3xl" />
                      <HStack spacing={4}>
                        <Skeleton h="20px" w="90px" borderRadius="full" />
                        <Skeleton h="20px" w="110px" borderRadius="full" />
                      </HStack>
                    </Stack>
                  </Box>
                  <ShimmerLoader variant="blog" count={3} />
                </Stack>
              </GridItem>
            </>
          ) : pageErrorState ? (
            <GridItem colSpan={{ base: 1, lg: 2 }}>
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
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg="bg.tertiary"
                      color="text.secondary"
                    >
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
            </GridItem>
          ) : archive ? (
            <>
              <GridItem>
                <Box position={{ lg: 'sticky' }} top={{ lg: 'calc(4rem + 1.5rem)' }}>
                  <MotionWrapper
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    duration={0.7}
                  >
                    <AuthorArchiveHero
                      author={archive.user}
                      totalPosts={postsLoading || postsErrorState ? null : archive.total}
                    />
                  </MotionWrapper>
                </Box>
              </GridItem>

              <GridItem>
                {postsLoading ? (
                  <Stack spacing={5}>
                    <Box h="1px" bg="border.subtle" />
                    <ShimmerLoader variant="blog" count={4} />
                  </Stack>
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
                  <Stack spacing={{ base: 8, md: 10 }}>
                    <Box h="1px" bg="border.subtle" />

                    <Stack spacing={3}>
                      {archive.posts.map((post) => (
                        <AuthorArchiveStoryListItem key={post.id} post={post} />
                      ))}
                    </Stack>

                    {totalPages > 1 ? (
                      <Box
                        borderTop="1px solid"
                        borderColor="border.subtle"
                        pt={{ base: 6, md: 8 }}
                      >
                        <PaginationControls
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalCount={archive.total}
                          pageSize={archive.limit || PAGE_SIZE}
                          onPageChange={setPage}
                          showOnlyWhenMultiple={false}
                        />
                      </Box>
                    ) : null}
                  </Stack>
                )}
              </GridItem>
            </>
          ) : null}
        </Grid>
      </Container>
    </Box>
  )
}

export default AuthorArchivePage
