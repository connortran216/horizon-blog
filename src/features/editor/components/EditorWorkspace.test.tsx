/**
 * What the workspace shell emits - release M6.
 *
 * Crepe and its preview are stubbed, because none of the claims below are about
 * Crepe. They are about the chrome the migration replaced: that the mode switch
 * is a real tablist, that switching mode hides a pane rather than removing it,
 * and that the preview's editor instance is not created until the author asks
 * for it. The last one is the reason `isPreviewMounted` exists at all - the
 * legacy `Tabs` was `isLazy lazyBehavior="keepMounted"`, and mounting the
 * preview eagerly would repeat its media resolution on every page load.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { horizonTheme } from '../../../theme/horizon'
import EditorWorkspace from './EditorWorkspace'
import type { WorkspaceMode } from '../../../design-system'

vi.mock('../../../components/editor/CrepeEditor', () => ({
  default: () => <div data-testid="writing-surface">writing surface</div>,
}))

vi.mock('../../../components/editor/CrepePreview', () => ({
  default: () => <div data-testid="rendered-preview">rendered preview</div>,
}))

const render = (mode: WorkspaceMode, isPreviewMounted: boolean) =>
  renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <EditorWorkspace
        mode={mode}
        onModeChange={vi.fn()}
        isPreviewMounted={isPreviewMounted}
        editorKey="new-post"
        initialContent="# Draft"
        previewContent="# Draft"
        postId={null}
        ensurePostId={vi.fn()}
        onEditorChange={vi.fn()}
        status={<p>Draft saved at 14:32</p>}
        footer="12 words · Markdown"
      />
    </ChakraProvider>,
  )

describe('EditorWorkspace', () => {
  it('offers write, preview and split as a real tablist', () => {
    const markup = render('write', false)

    expect(markup).toContain('role="tablist"')
    expect(markup).toContain('>Write<')
    expect(markup).toContain('>Preview<')
    expect(markup).toContain('>Split<')
  })

  it('does not create the preview editor before it is asked for', () => {
    const markup = render('write', false)

    expect(markup).toContain('writing surface')
    expect(markup).not.toContain('rendered preview')
  })

  it('keeps the writing surface mounted while the preview is showing', () => {
    // Unmounting it would take Crepe's undo history with it.
    const markup = render('preview', true)

    expect(markup).toContain('writing surface')
    expect(markup).toContain('rendered preview')
    expect(markup).toContain('aria-hidden="true"')
  })

  it('shows both panes in split, and hides neither', () => {
    const markup = render('split', true)

    expect(markup).toContain('writing surface')
    expect(markup).toContain('rendered preview')
    expect(markup).not.toContain('aria-hidden="true"')
  })

  it('keeps the save state and the footer visible in every mode', () => {
    for (const mode of ['write', 'preview', 'split'] as const) {
      const markup = render(mode, true)

      expect(markup).toContain('Draft saved at 14:32')
      expect(markup).toContain('12 words · Markdown')
    }
  })
})
