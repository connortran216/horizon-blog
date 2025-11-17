import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Button,
  Divider,
  Progress,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { apiService } from '../core/services/api.service'
import MilkdownReader from '../components/reader/MilkdownReader'

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

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [readingProgress, setReadingProgress] = useState(0)

  // Refs for scroll tracking
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const authorRef = useRef<HTMLDivElement>(null)

  // Reading progress tracking
  useEffect(() => {
    const updateReadingProgress = () => {
      if (!contentRef.current) return

      const element = contentRef.current
      const scrollTop = window.pageYOffset
      const elementTop = element.offsetTop
      const elementHeight = element.offsetHeight
      const windowHeight = window.innerHeight

      const totalHeight = elementTop + elementHeight - windowHeight
      const currentProgress = Math.min(100, Math.max(0, ((scrollTop - elementTop) / totalHeight) * 100))

      setReadingProgress(currentProgress)
    }

    window.addEventListener('scroll', updateReadingProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateReadingProgress)
  }, [])

  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await apiService.get<{ data: BlogPost }>(`/posts/${id}`)
          const foundPost = response.data

          if (foundPost) {
            setPost(foundPost)
          } else {
            toast({
              title: 'Post not found',
              description: 'The blog post you are looking for does not exist.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
            navigate('/blog')
          }
        } catch (error: unknown) {
          console.error('Error fetching post:', error)
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to load blog post.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          navigate('/blog')
        } finally {
          setLoading(false)
        }
      }

      fetchPost()
    }
  }, [id, navigate, toast, location.pathname])

  // Render content using MilkdownReader (read-only)
  const renderContent = () => {
    if (!post || !post.content_markdown) {
      return (
        <Text color={useColorModeValue('gray.600', 'text.secondary')}>No content available</Text>
      )
    }

    // Use MilkdownReader for read-only display
    return <MilkdownReader content={post.content_markdown} />
  }

  const loadingTextColor = useColorModeValue('gray.600', 'text.secondary')
  const headingColor = useColorModeValue('gray.900', 'text.primary')
  const authorNameColor = useColorModeValue('gray.900', 'text.primary')
  const dateColor = useColorModeValue('gray.500', 'text.tertiary')
  const dividerColor = useColorModeValue('gray.200', 'border.subtle')

  if (loading) {
    return (
      <Container maxW="container.md" py={10}>
        <Text color={loadingTextColor}>Loading...</Text>
      </Container>
    )
  }

  if (!post) {
    return (
      <Container maxW="container.md" py={10}>
        <Text color={loadingTextColor}>Post not found</Text>
      </Container>
    )
  }

  return (
    <Box>
      {/* Reading Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Progress
          value={readingProgress}
          size="xs"
          colorScheme="purple"
          bg={useColorModeValue('gray.100', 'gray.700')}
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
          borderRadius="none"
        />
      </motion.div>

      <Container maxW="container.md" py={10} ref={contentRef}>
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button leftIcon={<ArrowBackIcon />} variant="ghost" mb={6} onClick={() => navigate('/blog')}>
            Back to Blog
          </Button>
        </motion.div>

        <VStack spacing={6} align="stretch">
          {/* Title */}
          <motion.div
            ref={titleRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Heading as="h1" size="2xl" color={headingColor} lineHeight="1.2">
              {post.title}
            </Heading>
          </motion.div>

          {/* Author Info */}
          <motion.div
            ref={authorRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <HStack spacing={4}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Avatar size="md" name={post.user?.name || 'Anonymous'} />
              </motion.div>
              <Box>
                <Text fontWeight="bold" color={authorNameColor} fontSize="lg">
                  {post.user?.name || 'Anonymous'}
                </Text>
                <Text fontSize="sm" color={dateColor}>
                  Published on {new Date(post.created_at).toLocaleDateString()}
                  {post.created_at !== post.updated_at &&
                    ` • Updated on ${new Date(post.updated_at).toLocaleDateString()}`}
                </Text>
              </Box>
            </HStack>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Divider my={4} borderColor={dividerColor} />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            style={{
              paddingBottom: '5vh' // Extra space for reading progress
            }}
          >
            {renderContent()}
          </motion.div>
        </VStack>
      </Container>
    </Box>
  )
}

export default BlogDetail
