import { useCallback, useEffect, useState } from 'react'
import { Box, Container, Input, Text, VStack, useToast, useColorModeValue } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useAutoSave } from '../hooks/useAutoSave'
import { useBlogPost } from '../hooks/useBlogPost'
import { useEditorContent } from '../hooks/useEditorContent'
import EditorMetaBar from '../components/EditorMetaBar'
import EditorTagField from '../components/EditorTagField'
import EditorWorkspace from '../components/EditorWorkspace'
import '../editor.window'

const BlogEditorPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [tabIndex, setTabIndex] = useState(0)

  const textTertiary = useColorModeValue('gray.500', 'text.tertiary')
  const bgPrimary = useColorModeValue('white', 'bg.secondary')
  const borderColor = useColorModeValue('gray.200', 'border.subtle')
  const tabColor = useColorModeValue('text.secondary', 'text.secondary')
  const tabHoverColor = useColorModeValue('text.primary', 'text.primary')
  const tabSelectedColor = useColorModeValue('accent.primary', 'accent.primary')
  const tabBorderColor = useColorModeValue('accent.primary', 'accent.primary')

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
        description: `Blog post ${postId ? 'updated' : 'published'} successfully`,
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
        title: 'Error',
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

  const saveTone =
    autoSave.saveStatus === 'error'
      ? 'red.500'
      : autoSave.saveStatus === 'saving' || autoSave.isSaving
        ? 'blue.500'
        : 'accent.primary'

  return (
    <Container maxW="container.xl" p={5}>
      <VStack spacing={6} align="stretch">
        <EditorMetaBar user={user} saveStatus={autoSave.getSaveStatusText()} saveTone={saveTone} />

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
          onChange={(event) => editorContent.setTitle(event.target.value)}
          isDisabled={isLoading}
        />

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
          borderColor={borderColor}
          tabColor={tabColor}
          tabHoverColor={tabHoverColor}
          tabSelectedColor={tabSelectedColor}
          tabBorderColor={tabBorderColor}
          editorKey={postId || autoSave.currentPostId || 'new-post'}
          initialContent={editorContent.contentMarkdown}
          previewContent={editorContent.contentMarkdown}
          postId={autoSave.currentPostId}
          ensurePostId={ensurePostId}
          onEditorChange={editorContent.handleEditorChange}
        />
      </VStack>
    </Container>
  )
}

export default BlogEditorPage
