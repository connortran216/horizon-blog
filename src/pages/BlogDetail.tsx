import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Box, Container, Text, VStack, Progress, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { apiService } from '../core/services/api.service'
import MilkdownReader from '../components/reader/MilkdownReader'
import { useResolvedMarkdown } from '../features/media/useResolvedMarkdown'
import {
  MotionWrapper,
  AnimatedPrimaryButton,
  FocusRing,
  BackButtonAnimation,
  TitleAnimation,
  AuthorAnimation,
  DividerAnimation,
  ContentAnimation,
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

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [readingProgress, setReadingProgress] = useState(0)
  const resolvedContent = useResolvedMarkdown(post?.content_markdown || '')

  // Refs for scroll tracking
  const contentRef = useRef<HTMLDivElement>(null)

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
      const currentProgress = Math.min(
        100,
        Math.max(0, ((scrollTop - elementTop) / totalHeight) * 100),
      )

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
    if (!post || !resolvedContent) {
      return <Text color="text.secondary">No content available</Text>
    }

    // Use MilkdownReader for read-only display
    return <MilkdownReader content={resolvedContent} />
  }

  if (loading) {
    return (
      <Container maxW="container.md" py={10}>
        <Text color="text.secondary">Loading...</Text>
      </Container>
    )
  }

  if (!post) {
    return (
      <Container maxW="container.md" py={10}>
        <Text color="text.secondary">Post not found</Text>
      </Container>
    )
  }

  return (
    <MotionWrapper>
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
            bg="bg.secondary"
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={1000}
            borderRadius="none"
          />
        </motion.div>

        <Container maxW="container.md" py={10} ref={contentRef}>
          <VStack spacing={6} align="stretch">
            {/* Back Button */}
            <BackButtonAnimation>
              <FocusRing>
                <AnimatedPrimaryButton
                  leftIcon={<ArrowBackIcon />}
                  variant="ghost"
                  mb={6}
                  onClick={() => navigate('/blog')}
                >
                  Back to Blog
                </AnimatedPrimaryButton>
              </FocusRing>
            </BackButtonAnimation>

            {/* Title */}
            <TitleAnimation title={post.title} />

            {/* Author Info */}
            <AuthorAnimation post={post} />

            {/* Divider */}
            <DividerAnimation />

            {/* Content */}
            <ContentAnimation hasPaddingBottom={true}>{renderContent()}</ContentAnimation>
          </VStack>
        </Container>
      </Box>
    </MotionWrapper>
  )
}

export default BlogDetail
