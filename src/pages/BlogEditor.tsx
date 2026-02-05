/**
 * BlogEditor Page Component - Clean UI-focused component
 *
 * Follows Single Responsibility Principle by focusing only on UI composition.
 * Business logic is delegated to custom hooks following our architectural patterns.
 */

import React, { useEffect, useCallback, useState } from 'react'
import {
  Box,
  Container,
  Input,
  VStack,
  useToast,
  Avatar,
  HStack,
  Text,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import CrepeEditor from '../components/editor/CrepeEditor'
import CrepePreview from '../components/editor/CrepePreview'
import { ErrorBoundary } from '../core'
import { useBlogPost, useAutoSave, useEditorContent } from '../hooks'

// Declare global interface for window object (keeping interface but removing logic)
declare global {
  interface Window {
    editorState?: {
      content_markdown: string
      title: string
      handlePublish: () => Promise<boolean>
    }
  }
}

const BlogEditor: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [tabIndex, setTabIndex] = useState(0)

  // Theme colors - using semantic tokens from our design system
  const textTertiary = useColorModeValue('gray.500', 'text.tertiary')
  const textAuthor = useColorModeValue('gray.700', 'text.secondary')
  const bgPrimary = useColorModeValue('white', 'bg.secondary')
  const borderColor = useColorModeValue('gray.200', 'border.subtle')
  const tabColor = useColorModeValue('gray.600', 'text.secondary')
  const tabSelectedColor = useColorModeValue('black', 'accent.primary')
  const tabBorderColor = useColorModeValue('accent.primary', 'accent.primary')

  // Custom hooks for business logic separation
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

  // Handle publishing the post
  const handlePublish = useCallback(async (): Promise<boolean> => {
    try {
      const publishedPost = await autoSave.publishPost()

      // Clear localStorage backup on successful publish
      autoSave.clearLocalStorage()

      // Show success toast
      toast({
        title: 'Success',
        description: `Blog post ${postId ? 'updated' : 'published'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Navigate to the published post
      if (publishedPost?.id) {
        navigate(`/blog/${publishedPost.id}`)
      }

      return true
    } catch (error) {
      console.error('❌ Error publishing blog post:', error)

      // Show error toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish blog post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })

      return false
    }
  }, [autoSave, postId, toast, navigate])

  // Share editor state with Navbar (keeping this minimal global state)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.editorState = {
        content_markdown: editorContent.contentMarkdown,
        title: editorContent.title,
        handlePublish,
      }
    }

    return () => {
      // Clean up global state
      if (typeof window !== 'undefined') {
        window.editorState = undefined
      }
    }
  }, [editorContent.contentMarkdown, editorContent.title, handlePublish])

  // Don't render anything while loading or if there's an error
  if (isLoading) {
    return (
      <Container maxW="container.xl" p={5}>
        <VStack spacing={6} align="stretch">
          <Box
            border="1px"
            borderColor={borderColor}
            borderRadius="md"
            minH="500px"
            bg={bgPrimary}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color={textTertiary}>Loading editor...</Text>
          </Box>
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" p={5}>
      <VStack spacing={6} align="stretch">
        {/* Author Info and Save Status */}
        <HStack spacing={3} justify="space-between">
          <HStack spacing={3}>
            <Avatar size="sm" src={user?.avatar} name={user?.username} />
            <Text fontSize="sm" color={textAuthor}>
              {user?.username || 'Anonymous'}
            </Text>
          </HStack>
          <Text
            fontSize="sm"
            color={
              autoSave.saveStatus === 'error'
                ? 'red.500'
                : autoSave.saveStatus === 'saving' || autoSave.isSaving
                  ? 'blue.500'
                  : 'accent.primary'
            }
          >
            {autoSave.getSaveStatusText()}
          </Text>
        </HStack>

        {/* Title Input */}
        <Input
          id="blog-title"
          name="blogTitle"
          placeholder="Blog Title"
          size="lg"
          fontSize="2xl"
          fontWeight="bold"
          border="none"
          _focus={{ border: 'none', boxShadow: 'none' }}
          _hover={{ border: 'none' }}
          value={editorContent.title}
          onChange={(e) => editorContent.setTitle(e.target.value)}
          isDisabled={isLoading}
        />

        {/* Tags Input */}
        <Box>
          <Input
            id="blog-tags"
            name="blogTags"
            placeholder="Add tags (press Enter)"
            size="sm"
            value={editorContent.tagInput}
            onChange={(e) => editorContent.setTagInput(e.target.value)}
            onKeyDown={editorContent.handleAddTagByEnter}
            isDisabled={isLoading}
          />
          <Wrap mt={2} spacing={2}>
            {editorContent.tags.map((tag: string) => (
              <WrapItem key={tag}>
                <Tag size="md" colorScheme="blue" borderRadius="full">
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => editorContent.removeTag(tag)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        {/* Crepe Editor with Dual Tabs */}
        <Tabs index={tabIndex} onChange={setTabIndex} mb={4}>
          <TabList>
            <Tab
              color={tabColor}
              _selected={{
                color: tabSelectedColor,
                borderColor: tabBorderColor,
              }}
            >
              Editor
            </Tab>
            <Tab
              color={tabColor}
              _selected={{
                color: tabSelectedColor,
                borderColor: tabBorderColor,
              }}
            >
              Preview
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={4}>
              <ErrorBoundary>
                <CrepeEditor
                  key={postId || autoSave.currentPostId || 'new-post'}
                  initialContent={editorContent.contentMarkdown}
                  onChange={editorContent.handleEditorChange}
                  placeholder="Start writing your markdown..."
                  inputId="blog-content"
                  inputName="blogContent"
                  postId={autoSave.currentPostId}
                  ensurePostId={ensurePostId}
                />
              </ErrorBoundary>
            </TabPanel>

            <TabPanel p={0} pt={4}>
              <ErrorBoundary>
                <CrepePreview content={editorContent.contentMarkdown} />
              </ErrorBoundary>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  )
}

export default BlogEditor
