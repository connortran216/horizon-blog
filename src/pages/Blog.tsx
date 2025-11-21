import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Tag,
  Avatar,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { apiService } from '../core/services/api.service'
import {
  AnimatedCard,
  MotionWrapper,
  FadeInShimmer,
  ShimmerLoader,
  AnimatedPrimaryButton,
  FocusRing,
} from '../core'

interface BlogPost {
  id: number
  title: string
  content_markdown: string
  content_json: string
  status: string
  user_id: number
  created_at: string
  updated_at: string
  user?: {
    name: string
    email: string
  }
}

const BlogCard = ({ post, index }: { post: BlogPost; index: number }) => {
  // Extract excerpt from markdown content
  const getExcerpt = (markdown: string): string => {
    if (!markdown) return 'No content'

    // Remove markdown syntax (simple approach)
    const plainText = markdown
      .replace(/#{1,6}\s+/g, '') // Remove headings
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/>\s+/g, '') // Remove blockquotes
      .replace(/[-*+]\s+/g, '') // Remove list markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()

    return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '')
  }

  // Calculate reading time (rough estimate: 200 words per minute)
  const getReadingTime = (markdown: string): number => {
    const words = markdown.split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }

  const readingTimeColor = 'text.secondary'
  const excerptColor = 'text.secondary'
  const metaColor = 'text.tertiary'
  const cardHoverScale = 1.02

  return (
    <RouterLink to={`/blog/${post.id}`}>
      <motion.div
        whileHover={{ scale: cardHoverScale }}
        transition={{ duration: 0.2 }}
        style={{ cursor: 'pointer' }}
      >
        <AnimatedCard
          maxW="100%"
          overflow="hidden"
          intensity="medium"
          staggerDelay={0.15}
          index={index}
          animation="fadeInUp"
        >
          <Box
            height="200px"
            width="100%"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontSize="3xl"
            fontWeight="bold"
          >
            {post.title.substring(0, 2).toUpperCase()}
          </Box>
          <VStack p={6} spacing={3} align="stretch">
            <HStack spacing={2} justify="space-between">
              <Tag colorScheme={post.status === 'published' ? 'green' : 'gray'}>{post.status}</Tag>
              <Text fontSize="sm" color={readingTimeColor}>
                {getReadingTime(post.content_markdown)} min read
              </Text>
            </HStack>
            <Heading size="md" noOfLines={2} color="text.primary">
              {post.title}
            </Heading>
            <Text color={excerptColor} noOfLines={3}>
              {getExcerpt(post.content_markdown)}
            </Text>
            <HStack spacing={2} align="center">
              <Avatar size="xs" name={post.user?.name || 'Anonymous'} />
              <Text fontSize="sm" color={metaColor}>
                {post.user?.name || 'Anonymous'}
              </Text>
              <Text fontSize="sm" color={metaColor}>
                •
              </Text>
              <Text fontSize="sm" color={metaColor}>
                {new Date(post.created_at).toLocaleDateString()}
              </Text>
            </HStack>
          </VStack>
        </AnimatedCard>
      </motion.div>
    </RouterLink>
  )
}

const Blog = () => {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const limit = 20

  // Load blog posts from API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true)
        const response = await apiService.get<{
          data: BlogPost[]
          page: number
          limit: number
          total: number
        }>('/posts', { page, limit })

        // Only show published posts
        const publishedPosts = response.data.filter((post) => post.status === 'published')
        setBlogPosts(publishedPosts)
        setTotal(response.total || 0)
        setTotalPages(Math.ceil((response.total || 0) / limit))
      } catch (error) {
        console.error('Failed to load blog posts:', error)
        setBlogPosts([])
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [page, location.pathname])

  // Handle search with animation
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setIsSearching(value.length > 0)
  }

  const filteredPosts = blogPosts.filter((post) => {
    if (!searchQuery) return true
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content_markdown.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const headingColor = 'text.primary'
  const subtitleColor = 'text.secondary'
  const searchIconColor = 'text.tertiary'
  const loadingTextColor = 'text.secondary'
  const paginationTextColor = 'text.primary'

  return (
    <MotionWrapper>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            duration={0.8}
          >
            <Box textAlign="center">
              <Heading color={headingColor}>Blog Posts</Heading>
              <Text mt={4} color={subtitleColor}>
                Explore our latest articles and tutorials
              </Text>
            </Box>
          </MotionWrapper>

          <MotionWrapper
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            duration={0.6}
            delay={0.2}
          >
            <motion.div
              animate={{
                scale: isSearching ? 1.02 : 1,
                boxShadow: searchQuery ? '0 0 0 3px rgba(139, 127, 199, 0.1)' : 'none',
              }}
              transition={{ duration: 0.2 }}
            >
              <InputGroup maxW="600px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={searchIconColor} />
                </InputLeftElement>
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </InputGroup>
            </motion.div>
          </MotionWrapper>

          <AnimatePresence mode="wait">
            {loading ? (
              <FadeInShimmer key="loading" delay={0.3}>
                <ShimmerLoader variant="blog" count={6} />
              </FadeInShimmer>
            ) : filteredPosts.length === 0 ? (
              <MotionWrapper
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Text textAlign="center" color={loadingTextColor}>
                  {searchQuery ? 'No posts found matching your search.' : 'No posts available yet.'}
                </Text>
              </MotionWrapper>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout
              >
                <LayoutGroup>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} width="100%">
                    <AnimatePresence>
                      {filteredPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            transition: { duration: 0.5, delay: index * 0.05 },
                          }}
                          exit={{ opacity: 0, scale: 0.8, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <BlogCard post={post} index={index} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </SimpleGrid>
                </LayoutGroup>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && totalPages > 1 && !searchQuery && (
            <MotionWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              duration={0.6}
              delay={0.8}
            >
              <HStack spacing={4} justify="center">
                <FocusRing>
                  <AnimatedPrimaryButton
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    isDisabled={page === 1}
                  >
                    Previous
                  </AnimatedPrimaryButton>
                </FocusRing>
                <MotionWrapper
                  key={`page-${page}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  duration={0.3}
                >
                  <Text color={paginationTextColor}>
                    Page {page} of {totalPages} ({total} total posts)
                  </Text>
                </MotionWrapper>
                <FocusRing>
                  <AnimatedPrimaryButton
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    isDisabled={page === totalPages}
                  >
                    Next
                  </AnimatedPrimaryButton>
                </FocusRing>
              </HStack>
            </MotionWrapper>
          )}
        </VStack>
      </Container>
    </MotionWrapper>
  )
}

export default Blog
