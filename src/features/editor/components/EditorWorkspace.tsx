/**
 * The authoring workspace - migrated onto Horizon Design System v2 (release M6).
 *
 * Composed from `WorkspaceShell` and `EditorToolbar`. Crepe is unchanged and
 * unwrapped: it is handed to the shell as the `editor` child and a read-only
 * copy of itself as the `preview` child, exactly as `WorkspaceShell` documents.
 * Nothing here reads, parses or serialises the document.
 *
 * Two things replaced the legacy `Tabs`:
 *
 * - A third mode. `split` shows both panes side by side above 801px and stacks
 *   them below it, so a phone gets both rather than losing one silently.
 * - Hiding rather than unmounting. The shell keeps both panes mounted and
 *   toggles `display`, which is what stops a mode switch from destroying
 *   Crepe's undo history. The old `Tabs` reached the same place through
 *   `isLazy lazyBehavior="keepMounted"`.
 *
 * That second point is why `isPreviewMounted` exists. `keepMounted` also meant
 * the preview's Crepe instance - and the media resolution it performs on mount -
 * did not exist until the author first asked for it. Rendering it eagerly would
 * double that work on every page load, so the page passes this flag and the
 * preview appears on first request and stays.
 */

import type { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import { EditorToolbar, WorkspaceShell, type WorkspaceMode } from '../../../design-system'
import { space } from '../../../theme/tokens'
import CrepeEditor from '../../../components/editor/CrepeEditor'
import CrepePreview from '../../../components/editor/CrepePreview'
import { CREPE_LOCAL_SCROLL } from '../../../components/editor/crepe.presentation'
import { ErrorBoundary } from '../../../core'

interface EditorWorkspaceProps {
  mode: WorkspaceMode
  onModeChange: (mode: WorkspaceMode) => void
  editorKey: string | number
  initialContent: string
  previewContent: string
  postId: number | null
  ensurePostId: () => Promise<number | null>
  onEditorChange: (contentMarkdown: string) => void
  /** True once the author has asked to see the preview at least once. */
  isPreviewMounted: boolean
  /** The save indicator. Always visible, at every width. */
  status?: ReactNode
  /** Title, tags and the publication badge. Usually a `MetadataBar`. */
  metadata?: ReactNode
  /** The recovery or schedule prompt above the workspace. */
  banner?: ReactNode
  /** Word count and format note. */
  footer?: ReactNode
}

/** Token padding inside a pane, so the writing surface is not flush to the rule. */
const panePadding = { base: space[3], md: space[4] }

const EditorWorkspace = ({
  mode,
  onModeChange,
  editorKey,
  initialContent,
  previewContent,
  postId,
  ensurePostId,
  onEditorChange,
  isPreviewMounted,
  status,
  metadata,
  banner,
  footer,
}: EditorWorkspaceProps) => {
  return (
    <WorkspaceShell
      mode={mode}
      status={status}
      metadata={metadata}
      banner={banner}
      footer={footer}
      toolbar={<EditorToolbar mode={mode} onModeChange={onModeChange} label="Workspace view" />}
      editor={
        <ErrorBoundary>
          {/*
           * The writing pane contains its own wide content. A markdown table in
           * the ProseMirror surface is styled `width: 100%` by `crepe-theme.css`
           * and takes its intrinsic width regardless, so without this a wide
           * table makes the whole page scroll sideways while the author types.
           */}
          <Box padding={panePadding} minW="0" sx={CREPE_LOCAL_SCROLL}>
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
      }
      preview={
        isPreviewMounted ? (
          <ErrorBoundary>
            <Box padding={panePadding} minW="0">
              <CrepePreview content={previewContent} />
            </Box>
          </ErrorBoundary>
        ) : undefined
      }
    />
  )
}

export default EditorWorkspace
