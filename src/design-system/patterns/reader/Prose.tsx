/**
 * Horizon Design System v2 - the reading column.
 *
 * A presentation frame, not a renderer. Milkdown, Crepe, Prism and mermaid keep
 * producing the markup; `Prose` owns the measure, the rhythm, the link and code
 * contrast, and the rule that nothing inside it may widen the document.
 *
 * That last rule is the one that needs enforcing from here rather than from the
 * renderer. A markdown table or a fenced block arrives as a bare `table` or
 * `pre` with no wrapper we control, so the local-overflow style is applied by
 * descendant selector - which means a wide table added to an article three
 * years from now is contained without anybody having to remember.
 *
 * A descendant selector can give an element overflow and cannot give it
 * attributes, which left the containment half finished: the block scrolled for
 * a pointer and was unreachable by keyboard. So this frame also adopts its own
 * wide containers and gives them the focusable-region attributes `CodeBlock`
 * writes by hand - see `syncScrollRegion`.
 *
 * `dsv2.5.3` acceptance 1.
 */

import { forwardRef, useCallback, useEffect, useRef, type MutableRefObject } from 'react'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { ErrorState, RetryAction } from '../../components/feedback'
import { ProseMeasure, type ProseMeasureProps } from '../../components/layout'
import { Text } from '../../components/typography'
import { createDisposerBag, scheduleFrame, type Disposer, type FrameScheduler } from '../../motion'
import {
  chakraColorVar,
  codeTextStyle,
  localScrollStyle,
  proseRenderState,
  releaseScrollRegion,
  scrollAffordanceStyle,
  scrollFadeStyle,
  scrollRegionSelector,
  syncScrollFade,
  syncScrollRegion,
  watchScrollFade,
  type ScrollFadeTarget,
} from './code.logic'
import { proseHeadingRamp, proseHeadingSelector } from './reader.logic'

/**
 * The heading ramp, keyed by the weighted selector that outranks the renderer's
 * own stylesheet. Built once at module load - it depends on nothing but tokens.
 * See `proseHeadingRamp` for why the selector is weighted at all.
 */
const headingRamp = Object.fromEntries(
  Object.entries(proseHeadingRamp()).map(([level, style]) => [
    proseHeadingSelector(level as keyof ReturnType<typeof proseHeadingRamp>),
    { ...style, color: componentTokens.reader.fg, letterSpacing: 'tight' },
  ]),
)

/**
 * The visible signal that a wide table or code block scrolls. See
 * `scrollAffordanceStyle` - the colour is `card.border`, the same divider
 * colour a table's own rule and `CodeBlock`'s own frame already borrow, so the
 * affordance reads as part of this system rather than a second opinion about
 * what a scrollbar should look like.
 */
const scrollAffordance = scrollAffordanceStyle({
  thumb: chakraColorVar(componentTokens.card.border),
})

/**
 * The fade for a wide table: it sits on the article's own card surface, so
 * the fade matches `card.bg` rather than the code role's darker `codeBg`.
 */
const tableEdgeFade = scrollFadeStyle({ background: chakraColorVar(componentTokens.card.bg) })

/**
 * The fade for a bare renderer `pre`. `CodeBlock`'s own frame carries the
 * matching fade itself - see there - because it is never adopted by this
 * component's sweep.
 */
const codeEdgeFade = scrollFadeStyle({
  background: chakraColorVar(componentTokens.reader.codeBg),
})

/** A `pre` `CodeBlock` already owns - it watches its own fade; this sweep leaves it alone. */
const isOwnedCodeBlockFrame = (element: Element): boolean =>
  element.tagName === 'PRE' && element.hasAttribute('role')

const frameScheduler: FrameScheduler = {
  request: (callback) =>
    typeof window === 'undefined' ? 0 : window.requestAnimationFrame(callback),
  cancel: (handle) => {
    if (typeof window !== 'undefined') {
      window.cancelAnimationFrame(handle)
    }
  },
}

export interface ProseProps extends Omit<ProseMeasureProps, 'children'> {
  children?: React.ReactNode
  /** Set when the renderer threw. The frame shows a failure, not a blank page. */
  renderError?: string | null
  onRetryRender?: () => void
  /** Shown when the article genuinely has no body yet. */
  emptyMessage?: string
}

export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose(
  {
    children,
    renderError = null,
    onRetryRender,
    emptyMessage = 'This blog has no content yet.',
    ...rest
  },
  ref,
) {
  const state = proseRenderState({ hasContent: Boolean(children), error: renderError })
  const scroll = localScrollStyle()
  const frameRef = useRef<HTMLElement | null>(null)

  /*
   * Two owners of one ref: the caller's - `ReadingProgress` measures this
   * element - and this component's own, because the repair below has to find
   * the frame whether or not a caller asked for it.
   */
  const attachRef = useCallback(
    (node: HTMLElement | null) => {
      frameRef.current = node

      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ;(ref as MutableRefObject<HTMLElement | null>).current = node
      }
    },
    [ref],
  )

  /*
   * Give every wide container inside the rendered article the three attributes
   * `CodeBlock` gives its own `pre`, so a keyboard-only reader can reach and
   * scroll it - and keep its edge fade lit correctly as it scrolls. The
   * attribute decisions are `syncScrollRegion`'s; the fade decisions are
   * `watchScrollFade`'s; this is the one sweep that drives both.
   *
   * It has to keep running rather than run once. The renderer is lazy - the
   * article arrives after hydration, and a Crepe surface replaces its content
   * wholesale - so a `MutationObserver` re-sweeps when the subtree changes, and
   * a `ResizeObserver` re-sweeps when a resize makes a table start or stop
   * overflowing. Only `childList` is watched, never attributes, because this
   * sweep writes attributes and would otherwise wake itself forever.
   *
   * Every sweep is coalesced into one animation frame, both observers and the
   * frame go into a disposer bag, and teardown releases every container it
   * adopted and stops watching every container it wired a fade to - so
   * nothing here can outlive the reading page, and an element that was never
   * adopted is handed back untouched.
   */
  useEffect(() => {
    const root = frameRef.current

    if (!root || typeof window === 'undefined') {
      return
    }

    const bag = createDisposerBag()
    const adopted = new Set<Element>()
    /**
     * One watcher per scrolling container, keyed by the element itself so a
     * re-sweep never attaches a second `scroll` listener to the same one.
     */
    const fadeWatchers = new Map<Element, () => void>()
    /*
     * One slot rather than one bag entry per sweep. A Crepe surface can mutate
     * hundreds of times in a session, and a disposer per mutation would grow for
     * as long as the reader stays on the page.
     */
    let pendingSweep: Disposer | null = null

    bag.add(() => pendingSweep?.())

    const sweep = () => {
      for (const element of root.querySelectorAll(scrollRegionSelector)) {
        const result = syncScrollRegion(element)

        if (result === 'adopted') {
          adopted.add(element)
        } else if (result === 'released') {
          adopted.delete(element)
        }

        // `CodeBlock`'s own frame watches its own fade; wiring it again here
        // would be a second listener doing the identical, redundant work.
        if (isOwnedCodeBlockFrame(element)) {
          continue
        }

        const target = element as unknown as ScrollFadeTarget

        if (fadeWatchers.has(element)) {
          // Already watched for `scroll` events - but a resize can change how
          // much a container overflows without ever firing one, so this sweep
          // is the one place that re-checks every watched container anyway.
          syncScrollFade(target)
        } else {
          fadeWatchers.set(element, watchScrollFade(target))
        }
      }

      // A container the renderer has since thrown away keeps nothing alive, but
      // holding the reference would.
      for (const element of adopted) {
        if (!element.isConnected) {
          adopted.delete(element)
        }
      }

      for (const [element, stopWatching] of fadeWatchers) {
        if (!element.isConnected) {
          stopWatching()
          fadeWatchers.delete(element)
        }
      }
    }

    const schedule = () => {
      if (pendingSweep) {
        return
      }

      pendingSweep = scheduleFrame(frameScheduler, () => {
        pendingSweep = null
        sweep()
      })
    }

    if (typeof MutationObserver !== 'undefined') {
      const mutations = new MutationObserver(schedule)
      mutations.observe(root, { childList: true, subtree: true })
      bag.add(() => mutations.disconnect())
    }

    if (typeof ResizeObserver !== 'undefined') {
      const resizes = new ResizeObserver(schedule)
      resizes.observe(root)
      bag.add(() => resizes.disconnect())
    }

    sweep()

    return () => {
      bag.dispose()
      adopted.forEach(releaseScrollRegion)
      adopted.clear()
      fadeWatchers.forEach((stopWatching) => stopWatching())
      fadeWatchers.clear()
    }
  }, [state])

  if (state === 'error') {
    return (
      <ErrorState failedAction="render this blog" align="start">
        {onRetryRender ? (
          <RetryAction failedAction="render this blog" onRetry={onRetryRender} />
        ) : null}
      </ErrorState>
    )
  }

  if (state === 'empty') {
    return (
      <Text as="p" recipe="body">
        {emptyMessage}
      </Text>
    )
  }

  return (
    <ProseMeasure
      ref={attachRef}
      as="div"
      textStyle="prose"
      color={componentTokens.reader.fg}
      sx={{
        // `anywhere` rather than `break-word`: a 90-character URL in a
        // paragraph is the one piece of prose that will otherwise push the
        // whole column wider than the measure.
        overflowWrap: 'anywhere',

        'p, ul, ol, blockquote': { marginBlock: space[6], color: componentTokens.reader.fg },
        ...headingRamp,
        'ul, ol': { paddingInlineStart: space[6] },
        li: { marginBlock: space[2] },
        /*
         * Crepe does not render a bare `li`. Its list-item node view splits the
         * row into a `label-wrapper` holding the marker and a `children` slot
         * holding the content, and ProseMirror always wraps that content in a
         * paragraph - so every list item contains a `p`. Crepe zeroes that
         * paragraph's margin in its own reset (`.milkdown * { margin: 0 }`,
         * specificity 0,1,0), but the prose rule above is 0,1,1 and wins the
         * tie, putting 24px back. The two flex items stay aligned; it is the
         * text inside that drops, which is why a list read as a number alone
         * on one line and its content on the next. Restoring the zero here at
         * 0,1,2 puts the marker and its text back on one line.
         *
         * The cost: an item written as several paragraphs loses the gap
         * between them. That is rarer than a list, and the gap is recoverable;
         * the stacking was not.
         */
        'li p': { marginBlock: 0 },
        a: {
          color: componentTokens.reader.link,
          textDecoration: 'underline',
          textUnderlineOffset: space[1],
        },
        blockquote: {
          paddingInline: space[6],
          paddingBlock: space[2],
          borderInlineStartWidth: '3px',
          borderInlineStartStyle: 'solid',
          borderInlineStartColor: componentTokens.reader.tocActive,
          background: componentTokens.card.hoverBg,
          borderStartEndRadius: radii.control,
          borderEndEndRadius: radii.control,
        },
        // Inline code only. A `pre > code` is the block form and is styled by
        // `CodeBlock`, which owns its own frame. Sized through `codeTextStyle`
        // so it reads at or below the sentence around it rather than at the
        // ambient prose size it would otherwise inherit.
        ':not(pre) > code': {
          background: componentTokens.reader.codeBg,
          borderRadius: radii.control,
          paddingInline: space[1],
          ...codeTextStyle,
        },
        '::selection': { background: componentTokens.reader.selectionBg },

        // Wide content scrolls inside itself, and now says so. Applied by
        // descendant selector so markup this component never sees - a bare
        // `pre` or `table` from any renderer, and the plain `div` a table
        // plugin wraps every `table` in: `.table-wrapper` from Crepe's own
        // table block, `.tableWrapper` from `prosemirror-tables` directly.
        // Neither renderer's own stylesheet gives that wrapper an overflow
        // rule reliably - Crepe's theme has none at all, and `prosemirror`'s
        // only applies inside a live `.ProseMirror` root - so it arrives as
        // the block default, `visible`, while the table inside scrolls on
        // its own. This restates the containment one level higher, on the
        // box a reader actually sees the edge of.
        'pre, table, .table-wrapper, .tableWrapper': {
          ...scroll,
          ...scrollAffordance,
          display: 'block',
        },
        // A bare renderer `pre` reads at code's own size, with the matching
        // fade. `CodeBlock`'s own frame sets both itself and carries
        // `role="group"`, so it is left alone rather than styled twice.
        'pre:not([role="group"])': { ...codeTextStyle, ...codeEdgeFade },
        // The edge fade, matched to what a table sits on - the article's own
        // card surface. Lit by `watchScrollFade`, from the sweep above; only
        // on `table` itself, because that is where the overflow this bead
        // measured actually lives - the wrapper's own box already fits it.
        // One object literal, not two `table` keys: the second would silently
        // replace the first rather than merge with it.
        table: { ...tableEdgeFade, borderCollapse: 'collapse', width: '100%' },
        'th, td': {
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: componentTokens.card.border,
          padding: space[3],
          textAlign: 'start',
        },
        img: { maxWidth: '100%', height: 'auto', borderRadius: radii.card },
      }}
      {...rest}
    >
      {children}
    </ProseMeasure>
  )
})
