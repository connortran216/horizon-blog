import { useCallback, useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  VStack,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { AnimatedCard, LoadingPanel } from '../../../core'
import { useAuth } from '../../../context/AuthContext'
import { ApiError } from '../../../core/services/api.service'
import { useAutoSave } from '../hooks/useAutoSave'
import { useBlogPost } from '../hooks/useBlogPost'
import { useEditorContent } from '../hooks/useEditorContent'
import EditorTagField from '../components/EditorTagField'
import EditorWorkspace from '../components/EditorWorkspace'
import '../editor.window'

const BlogEditorPage = () => {
  useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [tabIndex, setTabIndex] = useState(0)

  const { post, isLoading, postId } = useBlogPost()
  const editorContent = useEditorContent({
    title: post?.title || '',
    contentMarkdown: post?.content_markdown || '',
    contentJSON: '',
    tags: Array.isArray(post?.tags)
      ? post.tags.map((tag: unknown) =>
          typeof tag === 'string' ? tag : (tag as { name: string }).name,
        )
      : [],
  })

  const autoSave = useAutoSave(
    editorContent.title,
    editorContent.contentMarkdown,
    editorContent.contentJSON,
    editorContent.tags,
    postId,
  )

  const ensurePostId = useCallback(async (): Promise<number | null> => {
    if (autoSave.currentPostId) return autoSave.currentPostId
    const newPostId = await autoSave.saveToBackend()
    return newPostId ?? null
  }, [autoSave])

  const handlePublish = useCallback(async (): Promise<boolean> => {
    try {
      const publishedPost = await autoSave.publishPost()
      autoSave.clearLocalStorage()

      toast({
        title: 'Success',
        description: postId ? 'Blog updated successfully' : 'Blog is now live',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      if (publishedPost?.id) {
        navigate(`/blog/${publishedPost.id}`)
      }

      return true
    } catch (error) {
      console.error('Error publishing blog post:', error)
      toast({
        title: error instanceof ApiError && error.status === 400 ? 'Validation error' : 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish blog post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return false
    }
  }, [autoSave, navigate, postId, toast])

  useEffect(() => {
    window.editorState = {
      content_markdown: editorContent.contentMarkdown,
      title: editorContent.title,
      handlePublish,
    }

    return () => {
      window.editorState = undefined
    }
  }, [editorContent.contentMarkdown, editorContent.title, handlePublish])

  if (isLoading) {
    return (
      <Box position="relative">
        <Box
          position="absolute"
          top="2rem"
          right="4%"
          w={{ base: '220px', md: '380px' }}
          h={{ base: '220px', md: '380px' }}
          bg="action.glow"
          filter="blur(120px)"
          opacity={0.8}
          pointerEvents="none"
        />

        <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
          <LoadingPanel
            label="Loading editor"
            description="Restoring the draft and preparing the workspace."
          />
        </Container>
      </Box>
    )
  }

  const hasExistingDraft = Boolean(postId || autoSave.currentPostId)
  const draftLabel = hasExistingDraft ? 'Editing draft' : 'New draft'

  return (
    <Box position="relative">
      <Box
        position="absolute"
        top="3rem"
        right="4%"
        w={{ base: '220px', md: '420px' }}
        h={{ base: '220px', md: '420px' }}
        bg="action.glow"
        filter="blur(120px)"
        opacity={0.75}
        pointerEvents="none"
      />

      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
        <AnimatedCard
          whileHover={{}}
          overflow="visible"
          intensity="light"
          border="1px solid"
          borderColor="border.subtle"
          bg="bg.glass"
          backdropFilter="blur(18px)"
          boxShadow="0 20px 44px rgba(0, 0, 0, 0.22)"
        >
          <Box position="relative">
            <Box
              position="absolute"
              top="-16%"
              right="-4%"
              w={{ base: '220px', md: '360px' }}
              h={{ base: '220px', md: '360px' }}
              bg="action.glow"
              filter="blur(110px)"
              opacity={0.9}
              pointerEvents="none"
            />

            <Box position="relative" zIndex={1}>
              <Box px={{ base: 6, md: 8 }} pt={{ base: 6, md: 8 }} pb={{ base: 7, md: 8 }}>
                <Stack spacing={4} maxW="3xl">
                  <HStack spacing={3} flexWrap="wrap">
                    <Badge
                      alignSelf="flex-start"
                      px={3}
                      py={1.5}
                      borderRadius="full"
                      bg="bg.tertiary"
                      color="text.secondary"
                      textTransform="uppercase"
                      letterSpacing="0.16em"
                      fontSize="10px"
                    >
                      Writing studio
                    </Badge>

                    <Badge
                      px={3}
                      py={1.5}
                      borderRadius="full"
                      bg="action.subtle"
                      color="action.primary"
                      textTransform="uppercase"
                      letterSpacing="0.16em"
                      fontSize="10px"
                    >
                      {draftLabel}
                    </Badge>
                  </HStack>

                  <Heading
                    fontSize={{ base: '3xl', md: '5xl' }}
                    lineHeight={{ base: 1.08, md: 0.98 }}
                    letterSpacing="-0.05em"
                    color="text.primary"
                  >
                    {hasExistingDraft
                      ? 'Refine the draft before it goes live.'
                      : 'Write a blog with clarity.'}
                  </Heading>

                  <Text
                    maxW="2xl"
                    color="text.secondary"
                    fontSize={{ base: 'md', md: 'lg' }}
                    lineHeight="tall"
                  >
                    Drafts save automatically while you work. Use tags to keep related writing
                    connected, then switch to preview to check the final reading rhythm before you
                    publish.
                  </Text>
                </Stack>
              </Box>

              <Box borderTop="1px solid" borderColor="border.subtle" />

              <VStack
                spacing={{ base: 6, md: 8 }}
                align="stretch"
                px={{ base: 6, md: 8 }}
                py={{ base: 6, md: 8 }}
              >
                <FormControl>
                  <FormLabel
                    htmlFor="blog-title"
                    mb={1.5}
                    fontSize="sm"
                    fontWeight="semibold"
                    color="text.primary"
                  >
                    Title
                  </FormLabel>
                  <FormHelperText mt={0} mb={3} color="text.tertiary">
                    Lead with a clear promise or idea readers will understand at a glance.
                  </FormHelperText>

                  <Box
                    border="1px solid"
                    borderColor="border.default"
                    borderRadius="2xl"
                    bg="bg.page"
                    px={{ base: 4, md: 5 }}
                    py={{ base: 4, md: 5 }}
                    transition="border-color 0.2s ease, box-shadow 0.2s ease"
                    _focusWithin={{
                      borderColor: 'action.primary',
                      boxShadow: '0 0 0 1px var(--chakra-colors-action-primary)',
                    }}
                  >
                    <Input
                      id="blog-title"
                      name="blogTitle"
                      variant="unstyled"
                      placeholder="Give your blog a clear, specific title"
                      fontSize={{ base: '2xl', md: '4xl' }}
                      fontWeight="bold"
                      letterSpacing="-0.04em"
                      lineHeight={{ base: 1.12, md: 1.02 }}
                      color="text.primary"
                      value={editorContent.title}
                      onChange={(event) => editorContent.setTitle(event.target.value)}
                      isDisabled={isLoading}
                      _placeholder={{ color: 'text.tertiary' }}
                    />
                  </Box>
                </FormControl>

                <EditorTagField
                  tagInput={editorContent.tagInput}
                  tags={editorContent.tags}
                  isDisabled={isLoading}
                  onTagInputChange={editorContent.setTagInput}
                  onTagKeyDown={editorContent.handleAddTagByEnter}
                  onRemoveTag={editorContent.removeTag}
                />

                <EditorWorkspace
                  tabIndex={tabIndex}
                  onTabChange={setTabIndex}
                  editorKey={postId || autoSave.currentPostId || 'new-post'}
                  initialContent={editorContent.contentMarkdown}
                  previewContent={editorContent.contentMarkdown}
                  postId={autoSave.currentPostId}
                  ensurePostId={ensurePostId}
                  onEditorChange={editorContent.handleEditorChange}
                  validationMessage={autoSave.validationMessage}
                />
              </VStack>
            </Box>
          </Box>
        </AnimatedCard>
      </Container>
    </Box>
  )
}

export default BlogEditorPage
