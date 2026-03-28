import { ReactNode, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Container,
  HStack,
  Link,
  Progress,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'
import {
  AnimatedPrimaryButton,
  BackButtonAnimation,
  ContentAnimation,
  FocusRing,
  LoadingState,
  MotionWrapper,
  TitleAnimation,
} from '../../../core'
import { BlogArchivePost } from '../blog.types'
import { getPostAuthorAvatar, getPostAuthorName } from '../blog.utils'

const LazyCrepeEditor = lazy(() => import('../../../components/editor/CrepeEditor'))

interface BlogReaderFrameProps {
  post: BlogArchivePost | null
  loading: boolean
  resolvedContent: string
  onBack: () => void
  backLabel: string
  emptyLabel: string
  authorArchivePath?: string | null
  authorArchiveState?: { authorId: number } | undefined
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
  authorArchivePath,
  authorArchiveState,
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
      <Container maxW="container.lg" py={{ base: 8, md: 12 }}>
        <LoadingState
          variant="page"
          minH="40vh"
          label="Loading blog"
          description="Preparing the reading view."
        />
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

  const authorName = getPostAuthorName(post)
  const authorAvatar = getPostAuthorAvatar(post)
  const authorIdentity = authorArchivePath ? (
    <Link
      as={RouterLink}
      to={authorArchivePath}
      state={authorArchiveState}
      display="inline-flex"
      alignItems="center"
      gap={3}
      color="inherit"
      _hover={{ color: 'text.primary', textDecoration: 'none' }}
    >
      <Avatar size="sm" name={authorName} src={authorAvatar} />
      <Text fontWeight="semibold" color="text.primary">
        {authorName}
      </Text>
    </Link>
  ) : (
    <HStack spacing={3}>
      <Avatar size="sm" name={authorName} src={authorAvatar} />
      <Text fontWeight="semibold" color="text.primary">
        {authorName}
      </Text>
    </HStack>
  )

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
                  {authorIdentity}
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
                  {authorArchivePath ? (
                    <>
                      <Text color="text.tertiary">•</Text>
                      <Link
                        as={RouterLink}
                        to={authorArchivePath}
                        state={authorArchiveState}
                        color="action.primary"
                        fontWeight="semibold"
                        _hover={{ color: 'action.hover', textDecoration: 'none' }}
                      >
                        View archive
                      </Link>
                    </>
                  ) : null}
                </HStack>

                {helperSection}
              </Stack>
            </Box>

            <Box maxW="5xl" mx="auto" w="full">
              <ContentAnimation hasPaddingBottom={bottomPadding}>
                {resolvedContent ? (
                  <Suspense fallback={<Text color="text.secondary">Loading content...</Text>}>
                    <Box px={{ base: 3, md: 4 }} pb={{ base: 4, md: 6 }}>
                      <LazyCrepeEditor
                        initialContent={resolvedContent}
                        readOnly
                        inputId="blog-content-reader"
                        inputName="blogContentReader"
                      />
                    </Box>
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
