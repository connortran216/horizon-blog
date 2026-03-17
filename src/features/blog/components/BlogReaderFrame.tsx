import { ReactNode, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, Container, Progress, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  AnimatedPrimaryButton,
  AuthorAnimation,
  BackButtonAnimation,
  ContentAnimation,
  DividerAnimation,
  FocusRing,
  MotionWrapper,
  TitleAnimation,
} from '../../../core'
import { BlogArchivePost } from '../blog.types'

const LazyMarkdownReader = lazy(() => import('../../../components/reader/MarkdownReader'))

interface BlogReaderFrameProps {
  post: BlogArchivePost | null
  loading: boolean
  resolvedContent: string
  onBack: () => void
  backLabel: string
  emptyLabel: string
  showReadingProgress?: boolean
  titleSection?: ReactNode
  helperSection?: ReactNode
  bottomPadding?: boolean
}

const BlogReaderFrame = ({
  post,
  loading,
  resolvedContent,
  onBack,
  backLabel,
  emptyLabel,
  showReadingProgress = false,
  titleSection,
  helperSection,
  bottomPadding = true,
}: BlogReaderFrameProps) => {
  const [readingProgress, setReadingProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showReadingProgress) {
      return
    }

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
  }, [showReadingProgress])

  useEffect(() => {
    if (!showReadingProgress) {
      return
    }

    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [showReadingProgress])

  if (loading) {
    return (
      <Container maxW="container.lg" py={10}>
        <Text color="text.secondary">Loading...</Text>
      </Container>
    )
  }

  if (!post) {
    return (
      <Container maxW="container.lg" py={10}>
        <Text color="text.secondary">{emptyLabel}</Text>
      </Container>
    )
  }

  return (
    <MotionWrapper>
      <Box>
        {showReadingProgress ? (
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
        ) : null}

        <Container maxW="container.lg" py={10} ref={contentRef}>
          <VStack spacing={6} align="stretch">
            <BackButtonAnimation>
              <FocusRing>
                <AnimatedPrimaryButton
                  leftIcon={<ArrowBackIcon />}
                  variant="ghost"
                  mb={6}
                  onClick={onBack}
                >
                  {backLabel}
                </AnimatedPrimaryButton>
              </FocusRing>
            </BackButtonAnimation>

            {titleSection || <TitleAnimation title={post.title} />}
            <AuthorAnimation post={post} />
            {helperSection}
            <DividerAnimation />

            <ContentAnimation hasPaddingBottom={bottomPadding}>
              {resolvedContent ? (
                <Suspense fallback={<Text color="text.secondary">Loading content...</Text>}>
                  <LazyMarkdownReader content={resolvedContent} />
                </Suspense>
              ) : (
                <Text color="text.secondary">No content available</Text>
              )}
            </ContentAnimation>
          </VStack>
        </Container>
      </Box>
    </MotionWrapper>
  )
}

export default BlogReaderFrame
