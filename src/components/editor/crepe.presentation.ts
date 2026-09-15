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

import { useEffect } from 'react'
import type { RefObject } from 'react'

import {
  localScrollStyle,
  syncScrollFade,
  watchScrollFade,
  type ScrollFadeTarget,
} from '../../design-system'

export const CREPE_LOCAL_SCROLL = {
  '& .crepe-editor-wrapper pre, & .crepe-editor-wrapper table, & .milkdown pre, & .milkdown table':
    { ...localScrollStyle(), display: 'block' },
} as const

/** The element CodeMirror itself makes horizontally scrollable. */
const CODE_MIRROR_SCROLLER_SELECTOR = '.cm-scroller'

/**
 * Keeps every CodeMirror fenced block's edge fade current, the same way
 * `Prose`'s own sweep does for a bare `pre` or `table` - see the block
 * comment on that effect for the full reasoning. This is a second, separate
 * sweep because `.cm-scroller` is neither a `pre` nor a `table`: it is
 * CodeMirror's own scroll container, built inside a ProseMirror node view
 * `Prose`'s descendant selectors and `scrollRegionSelector` sweep never see.
 * The CSS half - the fade itself, painted from `--crepe-code-bg` and lit by
 * the same `data-scroll-fade` attribute - lives in `crepe-theme.css`,
 * because CodeMirror's node view is not React and has no `sx` to hand a
 * style object to.
 *
 * A `MutationObserver` re-sweeps whenever Crepe adds or removes a fenced
 * block (typing a new one, or the whole document replacing under a Milkdown
 * re-render); a `ResizeObserver` re-sweeps whenever a resize changes how much
 * a block overflows without any scroll ever happening. Every watcher is
 * disposed on unmount, and an already-watched element is re-synced rather
 * than watched twice.
 */
export function useCrepeCodeScrollFade(containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = containerRef.current

    if (!root || typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
      return
    }

    const watchers = new Map<Element, () => void>()

    const sweep = () => {
      for (const element of root.querySelectorAll(CODE_MIRROR_SCROLLER_SELECTOR)) {
        const target = element as unknown as ScrollFadeTarget

        if (watchers.has(element)) {
          syncScrollFade(target)
        } else {
          watchers.set(element, watchScrollFade(target))
        }
      }

      for (const [element, stopWatching] of watchers) {
        if (!element.isConnected) {
          stopWatching()
          watchers.delete(element)
        }
      }
    }

    const mutations = new MutationObserver(sweep)
    mutations.observe(root, { childList: true, subtree: true })

    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sweep)
    resize?.observe(root)

    sweep()

    return () => {
      mutations.disconnect()
      resize?.disconnect()
      watchers.forEach((stopWatching) => stopWatching())
      watchers.clear()
    }
  }, [containerRef])
}
