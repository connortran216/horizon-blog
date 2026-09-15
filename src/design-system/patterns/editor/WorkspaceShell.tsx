/**
 * Horizon Design System v2 - the authoring workspace shell.
 *
 * The chrome around a writing surface: a header strip with the save state and
 * the primary action, a toolbar, the two panes, and a footer with the counts.
 *
 * **This does not replace Milkdown, Crepe or CodeMirror.** The writing surface
 * is `editor`, and the rendered article is `preview`; both are `ReactNode`s the
 * feature passes in. The shell never reads or writes the document, never mounts
 * an input of its own, and - importantly - never unmounts either pane when the
 * mode changes. Unmounting Crepe would destroy its undo history and its plugin
 * state, so the hidden pane is hidden with `display`, not removed.
 *
 * Responsive behaviour: `split` becomes one column below 801px and both panes
 * are still there, stacked. Nothing is dropped on a narrow screen - not a pane,
 * not the save state, not an action.
 */

import type { ReactNode } from 'react'
import { Box, Flex } from '@chakra-ui/react'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { Stack } from '../../components/layout'
import { Text } from '../../components/typography'
import { PermissionState } from '../../components/feedback'
import { workspaceLayout, type WorkspaceMode } from './workspace.logic'

export interface WorkspaceShellProps {
  mode?: WorkspaceMode
  /** The save indicator and anything else describing the draft's state. */
  status?: ReactNode
  /** The mode switch and formatting controls. Usually an `EditorToolbar`. */
  toolbar?: ReactNode
  /** The title, tags and other metadata fields. Usually a `MetadataBar`. */
  metadata?: ReactNode
  /** The writing surface. Crepe, Milkdown, or a textarea. Never built here. */
  editor: ReactNode
  /** The rendered article. */
  preview?: ReactNode
  /** Word count, reading time, format note. */
  footer?: ReactNode
  /** Continue, preview, back - the actions that leave this screen. */
  actions?: ReactNode
  /** A verb phrase: "edit this post". Its presence replaces the whole shell. */
  deniedAction?: string
  deniedDetail?: string
  /** The recovery prompt, when there is a newer local draft. */
  banner?: ReactNode
}

interface PaneProps {
  isVisible: boolean
  /** Draw the rule between the two panes. Only the second pane of a split does. */
  isSplitSecond?: boolean
  children: ReactNode
}

function Pane({ isVisible, isSplitSecond = false, children }: PaneProps) {
  /*
   * `display: none` rather than conditional rendering. The editor keeps its
   * document, its selection and its undo stack while it is hidden, and being
   * out of the accessibility tree comes with it, so a screen reader is not
   * offered two copies of the same article.
   */
  return (
    <Box
      display={isVisible ? 'block' : 'none'}
      aria-hidden={isVisible ? undefined : true}
      minW="0"
      /*
       * A split is two columns on a wide screen and two stacked blocks on a
       * narrow one, so the rule between them has to change axis with the
       * layout: a top border when stacked, a leading border when side by side.
       */
      borderStyle="solid"
      borderColor={componentTokens.workspace.border}
      borderBlockStartWidth={isSplitSecond ? { base: '1px', md: '0' } : '0'}
      borderInlineStartWidth={isSplitSecond ? { base: '0', md: '1px' } : '0'}
    >
      {children}
    </Box>
  )
}

export function WorkspaceShell({
  mode = 'write',
  status,
  toolbar,
  metadata,
  editor,
  preview,
  footer,
  actions,
  deniedAction,
  deniedDetail,
  banner,
}: WorkspaceShellProps) {
  const layout = workspaceLayout(mode)

  if (deniedAction !== undefined) {
    return <PermissionState deniedAction={deniedAction} detail={deniedDetail} />
  }

  return (
    <Stack as="section" gap={4} bg={componentTokens.workspace.bg}>
      {banner}

      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'center' }}
        justify="space-between"
        gap={space[3]}
      >
        {/*
         * The save state comes first in the DOM and stays visible at every
         * width. On a 375px screen it sits above the actions rather than being
         * pushed off the row - losing sight of it is the one thing this layout
         * must not do.
         */}
        <Box minW="0">{status}</Box>
        {actions === undefined ? null : (
          <Flex gap={space[2]} flexWrap="wrap" justify={{ base: 'stretch', md: 'flex-end' }}>
            {actions}
          </Flex>
        )}
      </Flex>

      {metadata}

      <Box
        borderWidth="1px"
        borderStyle="solid"
        borderColor={componentTokens.workspace.border}
        borderRadius={radii.card}
        overflow="hidden"
        bg={componentTokens.workspace.panelBg}
      >
        {toolbar === undefined ? null : (
          <Box
            borderBottomWidth="1px"
            borderBottomStyle="solid"
            borderBottomColor={componentTokens.workspace.border}
            bg={componentTokens.workspace.toolbarBg}
          >
            {toolbar}
          </Box>
        )}

        <Box display="grid" gridTemplateColumns={layout.templateColumns} minHeight={space[24]}>
          <Pane isVisible={layout.showsEditor}>{editor}</Pane>

          {preview === undefined ? null : (
            <Pane isVisible={layout.showsPreview} isSplitSecond={layout.stacksBelowColumns}>
              {preview}
            </Pane>
          )}
        </Box>
      </Box>

      {footer === undefined ? null : (
        <Flex justify="space-between" gap={space[3]} flexWrap="wrap">
          <Text recipe="metadata" as="div">
            {footer}
          </Text>
        </Flex>
      )}
    </Stack>
  )
}
