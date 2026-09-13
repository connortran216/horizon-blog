/**
 * The blog editor - migrated onto Horizon Design System v2 (release M6).
 *
 * Composed from `ContentContainer`, `Section`, `WorkspaceShell` (through
 * `EditorWorkspace`), `MetadataBar`, `TagField`, `AutosaveState` and
 * `ScheduleNotice`. Removed on the way: the `AnimatedCard` glass panel, three
 * absolutely positioned `action.glow` blur washes, the uppercase `Badge` pair,
 * the hand-built `FormControl`/`FormLabel`/`FormHelperText` title field and the
 * permission `Alert`.
 *
 * Presentation only. Autosave timing, the local backup, draft loading and its
 * authorisation check, the media lifecycle inside Crepe, the publish handoff
 * through `window.editorState` and every route this page can take are byte for
 * byte what they were.
 *
 * Two composition notes worth knowing before changing anything here:
 *
 * - There is no publish button on this page and there never was. The navbar
 *   reads `window.editorState.handlePublish`, so adding an action to the
 *   workspace shell would put two publish buttons on one screen.
 * - The permission-loss `Alert` is gone because it said the same thing twice.
 *   `autosaveState` treats a lost permission as the strongest state there is,
 *   announces it assertively, and its detail sentence already tells the author
 *   their draft is kept in this browser.
 */

import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import {
  AutosaveState,
  ContentContainer,
  Eyebrow,
  Heading,
  MetadataBar,
  PanelLoading,
  Section,
  Stack,
  scheduleState,
  Text,
  type WorkspaceMode,
} from '../../../design-system'
import { useAuth } from '../../../context/AuthContext'
import { ApiError } from '../../../core/services/api.service'
import { useAutoSave } from '../hooks/useAutoSave'
import { useBlogPost } from '../hooks/useBlogPost'
import { useConnectionStatus } from '../hooks/useConnectionStatus'
import { useEditorContent } from '../hooks/useEditorContent'
import { autosaveIndicator, workspaceFooter } from '../editor-status.utils'
import EditorTagField from '../components/EditorTagField'
import EditorWorkspace from '../components/EditorWorkspace'
import ActiveScheduleNotice from '../components/ActiveScheduleNotice'
import '../editor.window'

const BlogEditorPage = () => {
  const { refreshUserProfile, user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [mode, setMode] = useState<WorkspaceMode>('write')
  /*
   * The preview's Crepe instance resolves the draft's media when it mounts, so
   * it is not created until the author asks for it - which is what the legacy
   * `isLazy lazyBehavior="keepMounted"` did. Once created it stays, because
   * unmounting it would repeat that work on every switch back.
   */
  const [isPreviewMounted, setIsPreviewMounted] = useState(false)
  const isOffline = useConnectionStatus()

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
    { onPermissionLost: refreshUserProfile },
  )

  const ensurePostId = useCallback(async (): Promise<number | null> => {
    if (autoSave.currentPostId) return autoSave.currentPostId
    const newPostId = await autoSave.saveToBackend()
    return newPostId ?? null
  }, [autoSave])

  const handlePublish = useCallback(async (): Promise<boolean> => {
    try {
      const targetPostId = await autoSave.saveToBackend()
      if (!targetPostId) return false
      navigate(`/blog-editor/publish?id=${targetPostId}`, {
        state: { authorizedEdit: true },
      })

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
  }, [autoSave, navigate, toast])

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

  const changeMode = (next: WorkspaceMode) => {
    if (next !== 'write') {
      setIsPreviewMounted(true)
    }

    setMode(next)
  }

  if (isLoading) {
    return (
      <ContentContainer>
        <Section>
          <PanelLoading task="the draft and its workspace" />
        </Section>
      </ContentContainer>
    )
  }

  const hasExistingDraft = Boolean(postId || autoSave.currentPostId)
  const scheduledAt = post?.scheduled_publish_at

  return (
    <ContentContainer>
      <Section density="compact">
        <Stack gap={8}>
          <Stack gap={3}>
            <Eyebrow as="p">Writing studio</Eyebrow>
            <Heading recipe="pageTitle" as="h1">
              {hasExistingDraft
                ? 'Refine the draft before it goes live.'
                : 'Write a blog with clarity.'}
            </Heading>
            <Text recipe="body">
              Drafts save automatically while you work. Use tags to keep related writing connected,
              then switch to preview or split to check the final reading rhythm before you publish.
            </Text>
          </Stack>

          <EditorWorkspace
            mode={mode}
            onModeChange={changeMode}
            isPreviewMounted={isPreviewMounted}
            editorKey={postId || autoSave.currentPostId || 'new-post'}
            initialContent={editorContent.contentMarkdown}
            previewContent={editorContent.contentMarkdown}
            postId={autoSave.currentPostId}
            ensurePostId={ensurePostId}
            onEditorChange={editorContent.handleEditorChange}
            banner={
              scheduledAt ? (
                <ActiveScheduleNotice
                  scheduledAt={scheduledAt}
                  onManage={() =>
                    navigate(`/blog-editor/publish?id=${post?.id}&mode=schedule`, {
                      state: { authorizedEdit: true },
                    })
                  }
                />
              ) : undefined
            }
            status={
              <AutosaveState
                {...autosaveIndicator({
                  isSaving: autoSave.isSaving,
                  saveStatus: autoSave.saveStatus,
                  permissionLost: autoSave.permissionLost,
                  isOffline,
                  validationMessage: autoSave.validationMessage,
                  lastSaved: autoSave.lastSaved,
                  hasSavedDraft: hasExistingDraft,
                })}
              />
            }
            metadata={
              <MetadataBar
                title={editorContent.title}
                onTitleChange={editorContent.setTitle}
                /*
                 * The real state of the record, not just "has a timestamp". A
                 * schedule whose moment passed without the worker running says
                 * "Draft · needs attention" rather than still promising it is
                 * on its way.
                 */
                publication={scheduledAt ? scheduleState({ scheduledAt }) : 'draft'}
                author={
                  user ? { name: user.username || 'Anonymous', avatarUrl: user.avatar } : undefined
                }
                tagField={
                  <EditorTagField tags={editorContent.tags} onChange={editorContent.setTags} />
                }
              />
            }
            footer={workspaceFooter(editorContent.contentMarkdown)}
          />
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default BlogEditorPage
