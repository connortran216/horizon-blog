import { Suspense, lazy } from 'react'
import { Box, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack } from '@chakra-ui/react'
import CrepeEditor from '../../../components/editor/CrepeEditor'
import { ErrorBoundary } from '../../../core'

const LazyCrepePreview = lazy(() => import('../../../components/editor/CrepePreview'))

interface EditorWorkspaceProps {
  tabIndex: number
  onTabChange: (index: number) => void
  editorKey: string | number
  initialContent: string
  previewContent: string
  postId: number | null
  ensurePostId: () => Promise<number | null>
  onEditorChange: (contentMarkdown: string) => void
}

const EditorWorkspace = ({
  tabIndex,
  onTabChange,
  editorKey,
  initialContent,
  previewContent,
  postId,
  ensurePostId,
  onEditorChange,
}: EditorWorkspaceProps) => {
  return (
    <Box
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="3xl"
      bg="bg.page"
      overflow="visible"
      boxShadow="sm"
    >
      <Tabs
        index={tabIndex}
        onChange={onTabChange}
        variant="unstyled"
        isLazy
        lazyBehavior="keepMounted"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          gap={4}
          px={{ base: 5, md: 6 }}
          py={{ base: 5, md: 5 }}
          borderBottom="1px solid"
          borderColor="border.subtle"
        >
          <VStack align="flex-start" spacing={1}>
            <Text
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.14em"
              color="text.tertiary"
            >
              Writing surface
            </Text>
            <Text fontSize="sm" color="text.tertiary">
              Draft in the editor, then switch to preview to check the final reading rhythm.
            </Text>
          </VStack>

          <TabList p={1} bg="bg.tertiary" borderRadius="full">
            {['Editor', 'Preview'].map((label) => (
              <Tab
                key={label}
                px={4}
                py={2}
                borderRadius="full"
                color="text.secondary"
                fontWeight="medium"
                _hover={{ color: 'text.primary' }}
                _focusVisible={{ boxShadow: '0 0 0 2px var(--chakra-colors-action-primary)' }}
                _selected={{
                  bg: 'bg.secondary',
                  color: 'text.primary',
                  boxShadow: 'sm',
                }}
              >
                {label}
              </Tab>
            ))}
          </TabList>
        </Flex>

        <TabPanels>
          <TabPanel p={0}>
            <ErrorBoundary>
              <Box px={{ base: 3, md: 4 }} pb={{ base: 4, md: 6 }}>
                <CrepeEditor
                  key={editorKey}
                  initialContent={initialContent}
                  onChange={onEditorChange}
                  placeholder="Start shaping your blog..."
                  inputId="blog-content"
                  inputName="blogContent"
                  postId={postId}
                  ensurePostId={ensurePostId}
                />
              </Box>
            </ErrorBoundary>
          </TabPanel>

          <TabPanel p={0}>
            <ErrorBoundary>
              <Box px={{ base: 6, md: 8 }} py={{ base: 6, md: 8 }} minH="460px">
                {previewContent.trim() ? (
                  <Suspense fallback={<Text color="text.tertiary">Loading preview...</Text>}>
                    <LazyCrepePreview content={previewContent} />
                  </Suspense>
                ) : (
                  <Flex
                    minH="320px"
                    align="center"
                    justify="center"
                    border="1px dashed"
                    borderColor="border.subtle"
                    borderRadius="2xl"
                    bg="bg.secondary"
                    px={6}
                  >
                    <Text color="text.tertiary" textAlign="center" maxW="24rem">
                      Start writing to preview the final reading experience.
                    </Text>
                  </Flex>
                )}
              </Box>
            </ErrorBoundary>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default EditorWorkspace
