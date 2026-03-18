import { ReactNode, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { Avatar, Box, Container, HStack, Progress, Stack, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  AnimatedPrimaryButton,
  BackButtonAnimation,
  ContentAnimation,
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
      <Box position="relative" pb={bottomPadding ? 12 : 0}>
        <Box
          position="absolute"
          top={0}
          left="50%"
          transform="translateX(-50%)"
          w={{ base: '92%', md: '74%' }}
          h="260px"
          bg="action.glow"
          filter="blur(120px)"
          opacity={0.64}
          pointerEvents="none"
        />

        {showReadingProgress ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Progress
              value={readingProgress}
              size="xs"
              bg="bg.secondary"
              sx={{
                '& > div': {
                  backgroundColor: 'var(--chakra-colors-action-primary)',
                },
              }}
              position="fixed"
              top={0}
              left={0}
              right={0}
              zIndex={1000}
              borderRadius="none"
            />
          </motion.div>
        ) : null}

        <Container
          maxW="container.xl"
          py={{ base: 8, md: 12 }}
          position="relative"
          ref={contentRef}
        >
          <VStack spacing={{ base: 8, md: 10 }} align="stretch">
            <BackButtonAnimation>
              <FocusRing>
                <AnimatedPrimaryButton
                  leftIcon={<ArrowBackIcon />}
                  variant="ghost"
                  onClick={onBack}
                  alignSelf="flex-start"
                >
                  {backLabel}
                </AnimatedPrimaryButton>
              </FocusRing>
            </BackButtonAnimation>

            <Box maxW="4xl" mx="auto" w="full">
              <Stack spacing={{ base: 5, md: 6 }}>
                {titleSection || <TitleAnimation title={post.title} />}

                <HStack spacing={4} flexWrap="wrap" align="center" color="text.secondary">
                  <Avatar size="sm" name={post.user?.name || 'Anonymous'} />
                  <Text fontWeight="semibold" color="text.primary">
                    {post.user?.name || 'Anonymous'}
                  </Text>
                  <Text color="text.tertiary">•</Text>
                  <Text color="text.secondary">
                    {new Date(post.created_at).toLocaleDateString()}
                  </Text>
                  {post.created_at !== post.updated_at ? (
                    <>
                      <Text color="text.tertiary">•</Text>
                      <Text color="text.secondary">
                        Updated {new Date(post.updated_at).toLocaleDateString()}
                      </Text>
                    </>
                  ) : null}
                </HStack>

                {helperSection}
              </Stack>
            </Box>

            <Box
              maxW="5xl"
              mx="auto"
              w="full"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius={{ base: '2xl', md: '3xl' }}
              bg="bg.glass"
              backdropFilter="blur(18px)"
              px={{ base: 5, md: 10, lg: 14 }}
              py={{ base: 7, md: 10, lg: 12 }}
              boxShadow="md"
            >
              <ContentAnimation hasPaddingBottom={bottomPadding}>
                {resolvedContent ? (
                  <Suspense fallback={<Text color="text.secondary">Loading content...</Text>}>
                    <LazyMarkdownReader content={resolvedContent} />
                  </Suspense>
                ) : (
                  <Text color="text.secondary">No content available</Text>
                )}
              </ContentAnimation>
            </Box>
          </VStack>
        </Container>
      </Box>
    </MotionWrapper>
  )
}

export default BlogReaderFrame
