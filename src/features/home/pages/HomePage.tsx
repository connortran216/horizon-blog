import { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  Wrap,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { FiArrowRight, FiEdit3, FiFeather, FiSearch } from 'react-icons/fi'
import {
  BlogPost,
  FadeInShimmer,
  MotionWrapper,
  ShimmerLoader,
  getBlogRepository,
} from '../../../core'
import StatChip from '../../../components/ui/StatChip'
import { useAuth } from '../../../context/AuthContext'
import PromiseCard from '../components/PromiseCard'
import StoryCard from '../components/StoryCard'

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const HomePage = () => {
  const location = useLocation()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadBlogPosts = async () => {
      getBlogRepository().clearCache?.()

      try {
        const result = await getBlogRepository().getPublishedPosts({ limit: 6 })
        if (result.success && result.data) {
          const posts = result.data.map((summary) => ({
            ...summary,
            content_markdown: '',
            content_json: '{}',
            user_id: 0,
          }))
          setBlogPosts(posts)
        } else {
          console.error('Failed to load blog posts:', result.error)
        }
      } catch (error) {
        console.error('Error loading blog posts:', error)
      } finally {
        setTimeout(() => setIsLoading(false), 250)
      }
    }

    void loadBlogPosts()
  }, [location.pathname])

  const featuredPost = blogPosts[0]
  const recentPosts = blogPosts.slice(1)

  return (
    <Box position="relative" pb={12}>
      <Box
        position="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '92%', md: '78%' }}
        h="340px"
        bg="accent.glow"
        filter="blur(130px)"
        opacity={0.72}
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
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="3xl"
              bg="bg.glass"
              backdropFilter="blur(18px)"
              px={{ base: 6, md: 10 }}
              py={{ base: 8, md: 10 }}
              boxShadow="md"
            >
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
                <Stack spacing={6}>
                  <Badge
                    alignSelf="flex-start"
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="bg.tertiary"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.14em"
                    fontSize="10px"
                  >
                    Horizon notebook
                  </Badge>

                  <Heading
                    fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                    lineHeight={{ base: 1.06, md: 0.98 }}
                    letterSpacing="-0.06em"
                    color="text.primary"
                  >
                    Human stories, build notes, and deliberate writing for curious readers.
                  </Heading>

                  <Text
                    maxW="2xl"
                    fontSize={{ base: 'md', md: 'lg' }}
                    color="text.secondary"
                    lineHeight="tall"
                  >
                    Horizon is a quiet place to slow down, read something thoughtful, and publish
                    work that feels intentional. Less noise, more clarity.
                  </Text>

                  <HStack spacing={4} flexWrap="wrap">
                    <Button
                      as={RouterLink}
                      to="/blog"
                      size="lg"
                      bg="accent.primary"
                      color="white"
                      _hover={{ bg: 'accent.hover' }}
                      rightIcon={<FiArrowRight />}
                    >
                      Explore the archive
                    </Button>
                    <Button
                      as={RouterLink}
                      to={user ? '/blog-editor' : '/register'}
                      size="lg"
                      variant="ghost"
                      color="text.primary"
                      _hover={{ bg: 'bg.tertiary' }}
                    >
                      {user ? 'Write your next note' : 'Create an account'}
                    </Button>
                  </HStack>

                  <Wrap spacing={3}>
                    <StatChip
                      label="Focus"
                      value={user ? 'Read and publish' : 'Read and discover'}
                      minWidth={{ base: 'auto', md: '150px' }}
                    />
                    <StatChip
                      label="Format"
                      value="Essays, notes, and field reports"
                      minWidth={{ base: 'auto', md: '150px' }}
                    />
                    <StatChip
                      label="Tone"
                      value="Calm, useful, and human"
                      minWidth={{ base: 'auto', md: '150px' }}
                    />
                  </Wrap>
                </Stack>

                <Stack spacing={4} justify="space-between">
                  <PromiseCard
                    icon={FiFeather}
                    title="Writing with intent"
                    description="Posts are presented like a notebook archive, with room for strong titles, thoughtful summaries, and sustained reading."
                  />
                  <PromiseCard
                    icon={FiSearch}
                    title="Built for discovery"
                    description="The archive surfaces clear entry points so readers can scan quickly, then settle into the pieces worth opening."
                  />
                  <PromiseCard
                    icon={FiEdit3}
                    title="Made for publishing"
                    description="The same product supports drafting and authoring, so writers and readers live inside one coherent system."
                  />
                </Stack>
              </SimpleGrid>
            </Box>
          </MotionWrapper>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <FadeInShimmer key="loading" delay={0.2}>
                <ShimmerLoader variant="blog" count={4} />
              </FadeInShimmer>
            ) : blogPosts.length === 0 ? (
              <MotionWrapper
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Box
                  textAlign="center"
                  py={{ base: 12, md: 16 }}
                  px={{ base: 6, md: 10 }}
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="3xl"
                  bg="bg.secondary"
                >
                  <Heading size="lg" color="text.primary">
                    The notebook is still empty.
                  </Heading>
                  <Text mt={4} color="text.secondary" maxW="2xl" mx="auto" lineHeight="tall">
                    Start the archive with a first post and establish the tone of the blog from the
                    very first note.
                  </Text>
                  <Button
                    as={RouterLink}
                    to={user ? '/blog-editor' : '/register'}
                    mt={6}
                    bg="accent.primary"
                    color="white"
                    _hover={{ bg: 'accent.hover' }}
                  >
                    {user ? 'Start writing' : 'Join Horizon'}
                  </Button>
                </Box>
              </MotionWrapper>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <VStack spacing={{ base: 8, md: 10 }} align="stretch">
                  {featuredPost && (
                    <Stack spacing={4}>
                      <HStack justify="space-between" align="flex-end" flexWrap="wrap">
                        <Stack spacing={2}>
                          <Text
                            fontSize="sm"
                            textTransform="uppercase"
                            letterSpacing="0.14em"
                            color="text.tertiary"
                          >
                            Latest highlight
                          </Text>
                          <Heading size="lg" color="text.primary" letterSpacing="-0.03em">
                            Start with the freshest note from the archive
                          </Heading>
                        </Stack>
                        <Link
                          as={RouterLink}
                          to="/blog"
                          color="accent.primary"
                          fontWeight="semibold"
                        >
                          See full archive
                        </Link>
                      </HStack>
                      <StoryCard post={featuredPost} index={0} formatDate={formatDate} />
                    </Stack>
                  )}

                  {recentPosts.length > 0 && (
                    <Stack spacing={4}>
                      <Stack spacing={2}>
                        <Text
                          fontSize="sm"
                          textTransform="uppercase"
                          letterSpacing="0.14em"
                          color="text.tertiary"
                        >
                          Recent entries
                        </Text>
                        <Heading size="lg" color="text.primary" letterSpacing="-0.03em">
                          Keep browsing through the notebook
                        </Heading>
                      </Stack>

                      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
                        {recentPosts.map((post, index) => (
                          <StoryCard
                            key={post.id}
                            post={post}
                            index={index + 1}
                            formatDate={formatDate}
                          />
                        ))}
                      </SimpleGrid>
                    </Stack>
                  )}
                </VStack>
              </motion.div>
            )}
          </AnimatePresence>
        </VStack>
      </Container>
    </Box>
  )
}

export default HomePage
