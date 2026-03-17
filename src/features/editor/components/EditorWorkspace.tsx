import { Suspense, lazy } from 'react'
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import CrepeEditor from '../../../components/editor/CrepeEditor'
import { ErrorBoundary } from '../../../core'

const LazyCrepePreview = lazy(() => import('../../../components/editor/CrepePreview'))

interface EditorWorkspaceProps {
  tabIndex: number
  onTabChange: (index: number) => void
  borderColor: string
  tabColor: string
  tabHoverColor: string
  tabSelectedColor: string
  tabBorderColor: string
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
  borderColor,
  tabColor,
  tabHoverColor,
  tabSelectedColor,
  tabBorderColor,
  editorKey,
  initialContent,
  previewContent,
  postId,
  ensurePostId,
  onEditorChange,
}: EditorWorkspaceProps) => {
  return (
    <Tabs index={tabIndex} onChange={onTabChange} mb={4}>
      <TabList borderBottom="1px solid" borderColor={borderColor}>
        {['Editor', 'Preview'].map((label) => (
          <Tab
            key={label}
            color={tabColor}
            fontWeight="medium"
            borderBottomWidth="2px"
            borderBottomColor="transparent"
            _hover={{ color: tabHoverColor }}
            _selected={{
              color: tabSelectedColor,
              borderBottomColor: tabBorderColor,
            }}
          >
            {label}
          </Tab>
        ))}
      </TabList>

      <TabPanels>
        <TabPanel p={0} pt={4}>
          <ErrorBoundary>
            <CrepeEditor
              key={editorKey}
              initialContent={initialContent}
              onChange={onEditorChange}
              placeholder="Start writing your markdown..."
              inputId="blog-content"
              inputName="blogContent"
              postId={postId}
              ensurePostId={ensurePostId}
            />
          </ErrorBoundary>
        </TabPanel>

        <TabPanel p={0} pt={4}>
          <ErrorBoundary>
            {tabIndex === 1 ? (
              <Suspense fallback={<Box p={6}>Loading preview...</Box>}>
                <LazyCrepePreview content={previewContent} />
              </Suspense>
            ) : null}
          </ErrorBoundary>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default EditorWorkspace
