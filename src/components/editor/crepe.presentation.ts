/**
 * Keeping Crepe's widest output inside its own column.
 *
 * `crepe-theme.css` styles a markdown table as `width: 100%; overflow: hidden`,
 * which is right for the rounded corner it was written for and wrong for a
 * twelve-column table: the table takes its intrinsic width, the pane takes the
 * table's width, and the whole document scrolls sideways. The same is true of a
 * long fenced block outside CodeMirror's own scroller.
 *
 * `localScrollStyle()` is the design system's rule for exactly this - local
 * overflow, `max-width: 100%`, and the `min-width: 0` that stops a grid child
 * sizing itself to its content. It has to be restated one level deeper than the
 * stylesheet it is outranking, because `crepe-theme.css` arrives with a lazily
 * imported chunk and whichever rule wins at equal specificity depends on
 * injection order.
 *
 * This is the second place in the codebase to carry this workaround -
 * `BlogReaderFrame` has the first, added by release M4 and reported then as a
 * design-system gap. It is reported again here: a frame that contains a
 * third-party renderer cannot be expressed once, so every surface that mounts
 * Crepe has to remember.
 */

import { localScrollStyle } from '../../design-system'

export const CREPE_LOCAL_SCROLL = {
  '& .crepe-editor-wrapper pre, & .crepe-editor-wrapper table, & .milkdown pre, & .milkdown table':
    { ...localScrollStyle(), display: 'block' },
} as const
