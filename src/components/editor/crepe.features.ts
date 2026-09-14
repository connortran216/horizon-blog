/**
 * Which Crepe surface is being built: a writing one or a reading one.
 *
 * `CrepeEditor` used to build exactly one thing - an editor - and then flip
 * `crepe.setReadonly(true)` after `create()` resolved. That is too late and too
 * shallow to make a reading surface:
 *
 * - Too late, because every Crepe node view reads `view.editable` **in its
 *   constructor** (`table-block`, `image-block` and `list-item-block` all take
 *   `!view.editable` as their initial readonly ref, and `code-block` seeds
 *   CodeMirror from it). By the time `setReadonly` runs they have all been built
 *   in editing mode, which is where the table drag handles and the add-row
 *   buttons in a published article came from. Crepe's `editable` option is a live
 *   getter over a private field, so calling `setReadonly(true)` *before*
 *   `create()` makes the very first render non-editable and every node view is
 *   constructed for reading.
 * - Too shallow, because `setReadonly` only calls `EditorView.setProps` on the
 *   outer ProseMirror view. A fenced code block is a separate CodeMirror editor
 *   with its own `contenteditable`; ProseMirror's flag never reaches it. Milkdown
 *   forwards `view.editable` to `EditorState.readOnly`, which blocks changes but
 *   deliberately leaves the DOM editable - `EditorView.editable` is the facet that
 *   owns `contenteditable`, and nothing sets it. That is the whole of the defect:
 *   a signed-out reader could put a caret inside an article's code.
 *
 * And a reading surface should not carry the features that exist only to change a
 * document. Those are listed once, here, instead of being spelled out at the call
 * site, so "what does a reader get" is a question a test can answer.
 *
 * What a reading surface keeps is everything that renders: CodeMirror (it is the
 * highlighter), tables, image blocks and list items. Parsing and highlighting are
 * untouched.
 */

import { CrepeFeature } from '@milkdown/crepe'
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { CREPE_CONFIG } from '../../config/crepe.config'

export type CrepeSurface = 'writing' | 'reading'

export const crepeSurface = (readOnly: boolean): CrepeSurface => (readOnly ? 'reading' : 'writing')

/**
 * Features whose only purpose is to change the document: the selection toolbar,
 * the block handle and slash menu, the link editing tooltip, and the "start
 * writing..." placeholder. A published article has no use for any of them.
 */
export const authoringOnlyFeatures = [
  CrepeFeature.Toolbar,
  CrepeFeature.BlockEdit,
  CrepeFeature.LinkTooltip,
  CrepeFeature.Placeholder,
] as const

/** Features that render content and therefore belong to both surfaces. */
export const renderingFeatures = [
  CrepeFeature.CodeMirror,
  CrepeFeature.Table,
  CrepeFeature.ImageBlock,
  CrepeFeature.ListItem,
] as const

export function crepeFeatures(surface: CrepeSurface): Partial<Record<CrepeFeature, boolean>> {
  const writing = surface === 'writing'

  return {
    [CrepeFeature.CodeMirror]: CREPE_CONFIG.features.codeBlocks,
    [CrepeFeature.Table]: CREPE_CONFIG.features.tables,
    [CrepeFeature.ImageBlock]: CREPE_CONFIG.features.imageBlock,
    [CrepeFeature.ListItem]: true,
    // The drop cursor and gap cursor are insertion affordances; this editor has
    // never used them on either surface.
    [CrepeFeature.Cursor]: false,
    [CrepeFeature.Toolbar]: writing && CREPE_CONFIG.features.toolbar,
    [CrepeFeature.BlockEdit]: writing,
    [CrepeFeature.LinkTooltip]: writing,
    [CrepeFeature.Placeholder]: writing,
  }
}

/**
 * What a reading surface hands to every CodeMirror instance Crepe creates.
 *
 * `EditorView.editable` is the facet that decides `contenteditable`; without it
 * the caret goes into the code no matter what ProseMirror thinks. `readOnly` is
 * set alongside it because it is the facet CodeMirror's own commands consult, and
 * because it is what emits `aria-readonly`, so assistive technology is told the
 * same thing the pointer is.
 *
 * Crepe appends these after its own defaults, and neither facet has another value
 * in that list, so these are the ones that apply.
 */
export function readingCodeMirrorExtensions(): Extension[] {
  return [EditorView.editable.of(false), EditorState.readOnly.of(true)]
}
