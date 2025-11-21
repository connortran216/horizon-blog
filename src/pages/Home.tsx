import {
  Box,
  Heading,
  Container,
  Text,
  Stack,
  SimpleGrid,
  Image,
  Flex,
  Icon,
  Avatar,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { FaBookmark, FaClock } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { getBlogRepository } from '../core/di/container'
import { BlogPost } from '../core'
import { useAuth } from '../context/AuthContext'
import {
  AnimatedPrimaryButton,
  MotionWrapper,
  AnimatedCard,
  ShimmerLoader,
  FadeInShimmer,
} from '../core'

// Default avatar for posts without author avatar
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'
// Default image for posts without featured image
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60'

const AnimatedBlogCard = ({ post }: { post: BlogPost; index: number }) => {
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const authorColor = useColorModeValue('gray.700', 'text.secondary')
  const dateColor = useColorModeValue('gray.500', 'text.tertiary')
  const titleColor = useColorModeValue('gray.900', 'text.primary')
  const titleHoverColor = useColorModeValue('gray.700', 'text.secondary')
  const subtitleColor = useColorModeValue('gray.600', 'text.secondary')
  const tagBg = useColorModeValue('gray.100', 'bg.tertiary')
  const tagColor = useColorModeValue('gray.700', 'text.secondary')
  const iconColor = useColorModeValue('gray.500', 'text.tertiary')
  const bookmarkColor = useColorModeValue('gray.400', 'text.tertiary')
  const bookmarkHoverColor = useColorModeValue('gray.600', 'text.secondary')

  return (
    <RouterLink to={`/blog/${post.id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        style={{ cursor: 'pointer' }}
      >
        <Box as="article" w="full" py={8}>
          <Flex gap={6} align="start">
            <Stack flex="1" spacing={4}>
              <HStack spacing={3}>
                <Avatar src={post.author.avatar || DEFAULT_AVATAR} size="xs" />
                <Text fontSize="sm" color={authorColor}>
                  {post.author.username}
                </Text>
                <Text fontSize="sm" color={dateColor}>
                  ·
                </Text>
                <Text fontSize="sm" color={dateColor}>
                  {formatDate(post.createdAt)}
                </Text>
              </HStack>

              <Heading
                fontSize="24px"
                fontFamily="gt-super, Georgia, serif"
                fontWeight="bold"
                color={titleColor}
                _hover={{ color: titleHoverColor }}
              >
                {post.title}
              </Heading>

              <Text color={subtitleColor} fontSize="16px" noOfLines={2} lineHeight="tall">
                {post.subtitle || ''}
              </Text>

              <HStack spacing={4} mt={2}>
                {post.tags && post.tags.length > 0 && (
                  <Text px={3} py={1} bg={tagBg} color={tagColor} fontSize="sm" rounded="full">
                    {post.tags[0]}
                  </Text>
                )}
                <HStack spacing={1} color={iconColor}>
                  <Icon as={FaClock} w={3} h={3} />
                  <Text fontSize="sm">{post.readingTime || 1} min read</Text>
                </HStack>
                <Icon
                  as={FaBookmark}
                  w={4}
                  h={4}
                  color={bookmarkColor}
                  _hover={{ color: bookmarkHoverColor }}
                  ml="auto"
                />
              </HStack>
            </Stack>

            <Box w="200px" h="134px" rounded="md" overflow="hidden" flexShrink={0}>
              <Image
                src={post.featuredImage || DEFAULT_IMAGE}
                alt={post.title}
                w="full"
                h="full"
                objectFit="cover"
              />
            </Box>
          </Flex>
        </Box>
      </motion.div>
    </RouterLink>
  )
}

const Home = () => {
  const location = useLocation()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Parallax effect for hero section
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const backgroundY = useTransform(scrollY, [0, 300], [0, 50])

  // Color mode values
  const pageBg = useColorModeValue('#faf9f7', 'bg.page')
  const heroBg = useColorModeValue('#faf9f7', 'bg.page')
  const borderColor = useColorModeValue('gray.200', 'border.subtle')
  const headingColor = useColorModeValue('gray.900', 'text.primary')
  const textColor = useColorModeValue('gray.600', 'text.secondary')
  const sectionBg = useColorModeValue('white', 'bg.secondary')
  const shapeColor = useColorModeValue('black', 'obsidian.accent.primary')
  const accentColor = useColorModeValue('#1a8917', 'obsidian.accent.secondary')

  // Trending section specific colors
  const trendingNumberColor = useColorModeValue('gray.200', 'border.default')
  const trendingTitleHoverColor = useColorModeValue('gray.700', 'text.secondary')
  const trendingMetaColor = useColorModeValue('gray.500', 'text.tertiary')

  // Helper prop for viewport animation
  const viewportConfig = { once: true, margin: '-50px' }

  useEffect(() => {
    const loadBlogPosts = async () => {
      // Clear repository cache to ensure fresh data on navigation
      getBlogRepository().clearCache?.()

      try {
        const result = await getBlogRepository().getPublishedPosts({ limit: 10 })
        if (result.success && result.data) {
          // Convert BlogPostSummary[] to BlogPost[] for compatibility
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
        // Add slight delay for smooth transition
        setTimeout(() => setIsLoading(false), 300)
      }
    }

    loadBlogPosts()
  }, [location.pathname])

  return (
    <Box bg={pageBg}>
      {/* Hero Section with Parallax */}
      <motion.div style={{ y: heroY }}>
        <Box
          borderBottom="1px"
          borderColor={borderColor}
          bg={heroBg}
          position="relative"
          overflow="hidden"
        >
          <Container maxW="container.xl" py={{ base: 20, md: 28 }}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align="center"
              justify="space-between"
              gap={10}
            >
              {/* Left side content with staggered reveals */}
              <MotionWrapper>
                <Stack spacing={6} maxW="640px" px={{ base: 4, md: 8 }}>
                  <MotionWrapper
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    duration={0.8}
                    delay={0.2}
                  >
                    <Heading
                      fontFamily="gt-super, Georgia, serif"
                      fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
                      fontWeight="400"
                      color={headingColor}
                      lineHeight="1.1"
                      letterSpacing="-0.05em"
                    >
                      Human stories & ideas
                    </Heading>
                  </MotionWrapper>
                  <MotionWrapper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    duration={0.8}
                    delay={0.4}
                  >
                    <Text
                      fontSize={{ base: 'lg', md: 'xl' }}
                      color={textColor}
                      maxW="400px"
                      lineHeight="tall"
                    >
                      A place to read, write, and deepen your understanding
                    </Text>
                  </MotionWrapper>
                  <MotionWrapper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    duration={0.8}
                    delay={0.6}
                  >
                    <RouterLink
                      to={user ? '/blog' : '/register'}
                      style={{ textDecoration: 'none' }}
                    >
                      <AnimatedPrimaryButton
                        size="lg"
                        fontSize="md"
                        fontWeight="normal"
                        px={8}
                        width="fit-content"
                      >
                        {user ? 'Continue reading' : 'Start reading'}
                      </AnimatedPrimaryButton>
                    </RouterLink>
                  </MotionWrapper>
                </Stack>
              </MotionWrapper>

              {/* Right side illustration with parallax */}
              <MotionWrapper
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                duration={0.8}
                delay={0.8}
              >
                <Box
                  position="relative"
                  width={{ base: 'full', md: '50%' }}
                  height={{ base: '300px', md: '500px' }}
                  display={{ base: 'none', md: 'block' }}
                >
                  <motion.div style={{ y: backgroundY }}>
                    <Box
                      position="absolute"
                      right="-100px"
                      top="50%"
                      transform="translateY(-50%)"
                      width="600px"
                      height="600px"
                    >
                      <Box
                        position="absolute"
                        top="50px"
                        right="100px"
                        width="150px"
                        height="150px"
                        bg={shapeColor}
                        borderRadius="full"
                        opacity="0.8"
                      />
                      <Box
                        position="absolute"
                        top="200px"
                        right="200px"
                        width="100px"
                        height="100px"
                        bg={shapeColor}
                        transform="rotate(45deg)"
                        opacity="0.6"
                      />
                      <Box
                        position="absolute"
                        top="0"
                        right="300px"
                        width="80px"
                        height="80px"
                        bg={shapeColor}
                        borderRadius="full"
                        opacity="0.4"
                      />
                      {/* Add some decorative dots */}
                      {[...Array(6)].map((_, i) => (
                        <Box
                          key={i}
                          position="absolute"
                          top={`${Math.random() * 400}px`}
                          right={`${Math.random() * 400}px`}
                          width="4px"
                          height="4px"
                          bg={accentColor}
                          borderRadius="full"
                          opacity="0.3"
                        />
                      ))}
                    </Box>
                  </motion.div>
                </Box>
              </MotionWrapper>
            </Flex>
          </Container>
        </Box>
      </motion.div>

      {/* --- FIXED TRENDING SECTION --- */}
      <Box py={10} borderBottom="1px" borderColor={borderColor} bg={sectionBg}>
        <Container maxW="container.md">
          {/* 1. Trigger the section title on scroll, removed delay 1.2s */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ opacity: 0 }}
          >
            <HStack spacing={2} mb={6}>
              <Icon as={FaBookmark} w={4} h={4} color={headingColor} />
              <Text fontWeight="bold" color={headingColor}>
                Trending on Horizon
              </Text>
            </HStack>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="trending-loader"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <FadeInShimmer delay={0.2}>
                  <ShimmerLoader variant="compact" count={2} />
                </FadeInShimmer>
              </motion.div>
            ) : blogPosts.length > 0 ? (
              <motion.div key="trending-content">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  {blogPosts.slice(0, 2).map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={viewportConfig}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                      style={{ opacity: 0 }}
                    >
                      <HStack align="start" spacing={4}>
                        <Text
                          fontSize="32px"
                          fontWeight="bold"
                          color={trendingNumberColor}
                          lineHeight="1"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </Text>
                        <RouterLink to={`/blog/${post.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            style={{ cursor: 'pointer', paddingTop: '5px', paddingBottom: '5px' }}
                          >
                            <Stack spacing={2}>
                              <HStack spacing={2}>
                                <Avatar src={post.author.avatar || DEFAULT_AVATAR} size="xs" />
                                <Text fontSize="sm" color={textColor}>
                                  {post.author.username}
                                </Text>
                              </HStack>
                              <Heading
                                fontSize="16px"
                                fontWeight="bold"
                                color={headingColor}
                                _hover={{ color: trendingTitleHoverColor }}
                              >
                                {post.title}
                              </Heading>
                              <HStack spacing={2} color={trendingMetaColor} fontSize="sm">
                                <Text>{new Date(post.createdAt).toLocaleDateString()}</Text>
                                <Text>·</Text>
                                <Text>{post.readingTime || 1} min read</Text>
                              </HStack>
                            </Stack>
                          </motion.div>
                        </RouterLink>
                      </HStack>
                    </motion.div>
                  ))}
                </SimpleGrid>
              </motion.div>
            ) : (
              <motion.div
                key="trending-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Text>No trending posts available. Start writing to see your posts here!</Text>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Box>

      {/* Main Content */}
      <Box bg={sectionBg}>
        <Container maxW="container.md" py={10}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="main-loader" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                <FadeInShimmer delay={0.2}>
                  <ShimmerLoader variant="blog" count={6} />
                </FadeInShimmer>
              </motion.div>
            ) : blogPosts.length > 0 ? (
              <motion.div key="main-content">
                <Stack spacing={6}>
                  {blogPosts.map((post, index) => (
                    <AnimatedCard
                      key={post.id}
                      intensity="light"
                      staggerDelay={0.15}
                      index={index}
                      animation="fadeInUp"
                      delay={0.1}
                      p={6}
                    >
                      <AnimatedBlogCard post={post} index={index} />
                    </AnimatedCard>
                  ))}
                </Stack>
              </motion.div>
            ) : (
              <motion.div
                key="main-empty"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ opacity: 0 }}
              >
                <Box textAlign="center" py={10}>
                  <Heading size="md" mb={4}>
                    No blog posts available yet
                  </Heading>
                  <Text mb={6}>Be the first to publish a story!</Text>
                  <AnimatedPrimaryButton as={RouterLink} to="/editor" size="md">
                    Start Writing
                  </AnimatedPrimaryButton>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Box>
    </Box>
  )
}

export default Home
