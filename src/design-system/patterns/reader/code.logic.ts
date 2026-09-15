/**
 * Horizon Design System v2 - code, tables and diagrams inside prose.
 *
 * These are presentation frames. Milkdown, Crepe, Prism and mermaid keep doing
 * the rendering; what this area owns is the container - the measure, the local
 * overflow, the copy affordance and what is shown when a renderer fails.
 *
 * `dsv2.5.3` acceptance 1 is the load-bearing one: code and tables scroll
 * locally, and the document never scrolls horizontally. That is one rule and it
 * has one implementation, `localScrollStyle`, so a fourth kind of wide content
 * cannot arrive with a fifth opinion about overflow.
 */

/* -------------------------------------------------------------------------- */
/* Local overflow                                                             */
/* -------------------------------------------------------------------------- */

export interface LocalScrollStyle {
  readonly overflowX: 'auto'
  readonly overflowY: 'hidden'
  readonly maxWidth: '100%'
  /**
   * The one people forget. A flex or grid child defaults to `min-width: auto`,
   * which is its content's intrinsic width - so a 2000px table stretches its
   * own column, the column stretches the reading grid, and the whole document
   * scrolls sideways however carefully the `overflow` was set.
   */
  readonly minWidth: 0
}

export function localScrollStyle(): LocalScrollStyle {
  return { overflowX: 'auto', overflowY: 'hidden', maxWidth: '100%', minWidth: 0 }
}

/**
 * Whether a container can widen the document.
 *
 * Used by the tests to check every wide-content frame in this area with one
 * predicate rather than four hand-written assertions that can drift apart.
 */
export function widensDocument(style: Partial<LocalScrollStyle>): boolean {
  return style.overflowX !== 'auto' || style.maxWidth !== '100%' || style.minWidth !== 0
}

/* -------------------------------------------------------------------------- */
/* Scroll affordance                                                          */
/* -------------------------------------------------------------------------- */

/**
 * A semantic colour token's CSS custom property, exactly as Chakra emits it -
 * dots become dashes, under the `--chakra-colors-` prefix every semantic
 * token is registered under.
 *
 * Needed wherever a style value is not itself a colour *prop* Chakra's own
 * resolver translates against the theme - `scrollbar-color` takes a bare
 * string of two colours, not a themed prop, so the token has to arrive
 * already resolved to a variable reference. It is still the token: the
 * variable repaints under `_dark` exactly as `componentTokens.card.border`
 * does anywhere it is used as a normal colour prop.
 */
export function chakraColorVar(token: string): string {
  return `var(--chakra-colors-${token.replace(/\./g, '-')})`
}

export interface ScrollAffordanceColors {
  /** The moving part - conventionally the same divider colour the container's own border already uses. */
  readonly thumb: string
  /** The track behind it. Transparent by default: the container's own background already sits there. */
  readonly track?: string
}

/**
 * A scroll container that says so.
 *
 * `localScrollStyle` makes a wide table or code block reachable; it says
 * nothing about whether the reader can tell it is. macOS and iOS hide a plain
 * `overflow-x: auto` scrollbar until the container is touched, which looks
 * exactly like content that was cut off - dsv2.5.3 acceptance 1 makes the
 * content reachable, and a reader staring at the edge still cannot see that.
 *
 * Declaring `::-webkit-scrollbar` (Chromium, Safari) or `scrollbar-color`
 * (Firefox) at all is what opts a container out of the auto-hiding overlay
 * style, in favour of a classic, always-reserved scrollbar. No visibility
 * condition is written here, and none is needed: a browser does not draw a
 * scrollbar, styled or not, for a box with nothing to scroll. The signal is
 * real exactly when the overflow is - which is also why this is decoration
 * that encodes information rather than the kind `DESIGN.md`'s Avoid list
 * rules out.
 */
export function scrollAffordanceStyle({ thumb, track = 'transparent' }: ScrollAffordanceColors) {
  return {
    scrollbarWidth: 'thin',
    scrollbarColor: `${thumb} ${track}`,
    '&::-webkit-scrollbar': { width: '10px', height: '10px' },
    '&::-webkit-scrollbar-track': { background: track },
    '&::-webkit-scrollbar-thumb': { background: thumb, borderRadius: '9999px' },
  } as const
}

/**
 * Whether a scroll position leaves more content off-screen at the start, at
 * the end, or both.
 *
 * A `background-image` cannot answer this - a gradient painted behind a
 * scroll container's content has no way to know how far the reader has
 * scrolled, so it either shows always (obscuring the last real character
 * once the reader reaches it, the exact failure this bead calls out) or never
 * (an image gradient fades to the same colour as the box it sits on, so a
 * fade painted *behind* the text is invisible against the text's own
 * background regardless of scroll position). The fade this system draws
 * instead sits *in front of* the content, as a pair of pseudo-elements - see
 * `scrollFadeStyle` - and those need telling apart "more to scroll toward
 * the start" from "more toward the end" as separate facts a reader watches
 * change while scrolling.
 *
 * The epsilon absorbs the sub-pixel rounding a fractional zoom level or a
 * fractional `scrollLeft` can leave behind; without it a container at its
 * true end can read as "0.3px short of the end" and keep its fade lit.
 */
const SCROLL_FADE_EPSILON = 1

export interface ScrollPositionLike {
  readonly scrollLeft: number
  readonly scrollWidth: number
  readonly clientWidth: number
}

export interface ScrollFadeVisibility {
  /** More content sits to the start; scrolling backward reveals it. */
  readonly start: boolean
  /** More content sits to the end; scrolling forward reveals it. */
  readonly end: boolean
}

export function scrollFadeVisibility({
  scrollLeft,
  scrollWidth,
  clientWidth,
}: ScrollPositionLike): ScrollFadeVisibility {
  return {
    start: scrollLeft > SCROLL_FADE_EPSILON,
    end: scrollLeft + clientWidth < scrollWidth - SCROLL_FADE_EPSILON,
  }
}

/** The attribute a scroll container carries its current fade state on. */
export const SCROLL_FADE_ATTRIBUTE = 'data-scroll-fade'

/**
 * `scrollFadeVisibility`, spelled as the attribute value CSS keys off with
 * `~=` - `"start"`, `"end"`, `"start end"`, or absent entirely so the
 * attribute selectors below match nothing rather than an empty string.
 */
export function scrollFadeAttributeValue(visibility: ScrollFadeVisibility): string {
  return [visibility.start ? 'start' : null, visibility.end ? 'end' : null]
    .filter((token): token is string => token !== null)
    .join(' ')
}

/** The subset of `Element` `syncScrollFade` reads and writes. */
export interface ScrollFadeElementLike extends ScrollPositionLike {
  setAttribute(name: string, value: string): void
  removeAttribute(name: string): void
}

/**
 * Bring one container's fade attribute in line with where it is actually
 * scrolled to. Called on mount, on resize, and on every `scroll` event - it
 * is cheap enough to run on every one of those, and correctness here is worth
 * more than throttling a boolean attribute write.
 */
export function syncScrollFade(element: ScrollFadeElementLike): void {
  const value = scrollFadeAttributeValue(scrollFadeVisibility(element))

  if (value) {
    element.setAttribute(SCROLL_FADE_ATTRIBUTE, value)
  } else {
    element.removeAttribute(SCROLL_FADE_ATTRIBUTE)
  }
}

/** The subset of `HTMLElement` `watchScrollFade` needs to keep itself current. */
export interface ScrollFadeTarget extends ScrollFadeElementLike {
  addEventListener(type: 'scroll', listener: () => void, options: { passive: true }): void
  removeEventListener(type: 'scroll', listener: () => void): void
}

/**
 * Keep one container's fade attribute current for as long as the caller
 * holds onto the returned disposer.
 *
 * A `scroll` event is the only thing that changes *where* a reader is
 * without changing *how much* there is to scroll - a resize or a content
 * mutation changes the latter, and those are already sweeps `Prose` and
 * `CodeBlock` run for other reasons. This is the one additional listener the
 * fade needs beyond what `syncScrollRegion`'s sweep already recomputes on.
 */
export function watchScrollFade(element: ScrollFadeTarget): () => void {
  const sync = () => syncScrollFade(element)

  sync()
  element.addEventListener('scroll', sync, { passive: true })

  return () => element.removeEventListener('scroll', sync)
}

export interface ScrollFadeOptions {
  /**
   * The real background this fade must match, already resolved - the box's
   * own `bg.surface`, `bg.page` or `bg.code`, through `chakraColorVar`. A fade
   * that does not match what it sits on reads as a smear, not an edge.
   */
  readonly background: string
  /** How far the fade reaches in from each edge. */
  readonly width?: string
}

/**
 * The visible edge fade: two pseudo-elements, in front of the scrolling
 * content, lit by `SCROLL_FADE_ATTRIBUTE`.
 *
 * In front of, not behind: a `background-image` on the scroll container
 * itself paints *behind* the content, where a fade to the container's own
 * background is invisible against that same background showing through the
 * gaps in the text - it can never read as "the content is fading out" the
 * way a real fade needs to. A pseudo-element is ordinary painted content, so
 * it sits in front of the text like any other box and can actually obscure
 * the last few characters as they approach the edge - which is the point:
 * that is the signal that there is more to scroll to.
 *
 * `pointer-events: none` on both so the fade is never what a click or a
 * touch drag lands on. `opacity` rather than `display`, transitioned, so the
 * fade never causes reflow of the very edge it sits at.
 */
export function scrollFadeStyle({ background, width = '32px' }: ScrollFadeOptions) {
  const edge = {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    width,
    pointerEvents: 'none' as const,
    opacity: 0,
    transition: 'opacity 120ms ease',
  }

  return {
    position: 'relative' as const,
    '&::before': {
      ...edge,
      left: 0,
      background: `linear-gradient(to right, ${background}, transparent)`,
    },
    '&::after': {
      ...edge,
      right: 0,
      background: `linear-gradient(to left, ${background}, transparent)`,
    },
    [`&[${SCROLL_FADE_ATTRIBUTE}~="start"]::before`]: { opacity: 1 },
    [`&[${SCROLL_FADE_ATTRIBUTE}~="end"]::after`]: { opacity: 1 },
  }
}

/* -------------------------------------------------------------------------- */
/* Code type                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Code's own place on the type ramp: at or below prose, never above it.
 *
 * `Prose` sets `textStyle="prose"` (18px mobile, 19px desktop) as the ambient
 * size for the whole article, so a fenced block or an inline `code` that
 * declares no size of its own inherits that one - code reading louder than
 * the sentence around it, backwards from every reading surface a reader
 * already knows. `body` (16px, unchanged across breakpoints) is this ramp's
 * next step down, and the one already used for everything that is not the
 * running prose itself.
 *
 * One constant rather than one literal per call site, so a fenced block, an
 * inline `code` and a third renderer's bare `pre` cannot drift to three
 * different sizes across three separate reviews.
 */
export const codeTextStyle = {
  textStyle: 'body',
  fontFamily: 'mono',
} as const

/* -------------------------------------------------------------------------- */
/* Reaching a scroll container with a keyboard                                */
/* -------------------------------------------------------------------------- */

/**
 * A scroll container nobody can reach with a keyboard is not scrollable.
 *
 * `CodeBlock` gets this right because it builds its own `pre`: `tabIndex={0}`,
 * `role="group"` and a name, so a reader with no pointer can focus the block and
 * scroll it with the arrow keys. `Prose` cannot do it that way. What it contains
 * is a third-party renderer's output, and the rule that keeps that output inside
 * the measure is a descendant CSS selector - which can add overflow and cannot
 * add attributes. So a wide table inside a Crepe or Milkdown surface scrolls for
 * a mouse and is unreachable otherwise.
 *
 * These three functions are that repair, as decisions rather than DOM work: what
 * counts as a container worth adopting, which attributes it gets, and when they
 * come off again. `Prose` finds the elements and calls them; everything that can
 * be wrong here is wrong in a plain object a test can build.
 */

/** The containers `Prose` gives local overflow to, and therefore owns. */
export const scrollRegionSelector = 'pre, table'

/**
 * Marks a container this module adopted, and records exactly which attributes
 * it added - so release puts the element back as it was found rather than
 * stripping a `role` the renderer had put there itself.
 */
export const SCROLL_REGION_FLAG = 'data-prose-scroll-region'

/** The minimum a focusable scroll container needs, spelled once. */
export const scrollRegionAttributes = ['tabindex', 'role', 'aria-label'] as const

export type ScrollRegionAttribute = (typeof scrollRegionAttributes)[number]

/**
 * The subset of `Element` this repair uses. Structural so a test can hand in a
 * plain object, which is the only way to prove the rules without a DOM.
 */
export interface ScrollContainerLike {
  readonly tagName: string
  readonly scrollWidth: number
  readonly clientWidth: number
  hasAttribute(name: string): boolean
  getAttribute(name: string): string | null
  setAttribute(name: string, value: string): void
  removeAttribute(name: string): void
}

/**
 * What a screen reader says when focus lands on the container.
 *
 * A bare focusable region is announced as "group" and nothing else, which tells
 * a reader that something is here but not what. The name is derived from the
 * element rather than from the content because the content belongs to a
 * renderer this component never reads.
 */
export function scrollRegionLabel(tagName: string): string {
  switch (tagName.toLowerCase()) {
    case 'pre':
      return 'Code block'
    case 'table':
      return 'Table'
    default:
      return 'Scrollable content'
  }
}

export type ScrollRegionSync = 'adopted' | 'released' | 'ignored'

/**
 * Bring one container in line with what the keyboard needs, and say what
 * happened.
 *
 * Four rules, in order:
 *
 * - A container that fits needs nothing. Making every `pre` in an article a tab
 *   stop would add a stop per block for no scrolling at all.
 * - A container that already has a `role` or a `tabindex` belongs to whoever set
 *   them - `CodeBlock`'s own `pre`, or a renderer that did this properly - and
 *   is left alone. Two owners of one focus behaviour is the defect, not the fix.
 * - An adopted container that has stopped overflowing gives its attributes back,
 *   so a table that only scrolls on a narrow screen is not a permanent tab stop
 *   on a wide one.
 * - Calling this twice changes nothing the second time.
 */
export function syncScrollRegion(element: ScrollContainerLike): ScrollRegionSync {
  const owned = element.hasAttribute(SCROLL_REGION_FLAG)
  const overflows = element.scrollWidth > element.clientWidth

  if (!owned) {
    if (!overflows || element.hasAttribute('tabindex') || element.hasAttribute('role')) {
      return 'ignored'
    }

    const added: ScrollRegionAttribute[] = []

    element.setAttribute('tabindex', '0')
    added.push('tabindex')
    element.setAttribute('role', 'group')
    added.push('role')

    // A name the renderer supplied is a better name than a generic one, and
    // overwriting it would lose information. Only an unnamed region is named.
    if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
      element.setAttribute('aria-label', scrollRegionLabel(element.tagName))
      added.push('aria-label')
    }

    element.setAttribute(SCROLL_REGION_FLAG, added.join(' '))

    return 'adopted'
  }

  if (overflows) {
    return 'adopted'
  }

  releaseScrollRegion(element)

  return 'released'
}

/**
 * Undo an adoption: on unmount, and whenever a container stops overflowing.
 *
 * Only the attributes this module recorded come off. An element it never
 * adopted is untouched, which is what makes calling it over a whole subtree at
 * teardown safe.
 */
export function releaseScrollRegion(element: ScrollContainerLike): void {
  const flag = element.getAttribute(SCROLL_REGION_FLAG)

  if (flag === null) {
    return
  }

  const added = new Set(flag.split(' ').filter((name) => name.length > 0))

  for (const name of scrollRegionAttributes) {
    if (added.has(name)) {
      element.removeAttribute(name)
    }
  }

  element.removeAttribute(SCROLL_REGION_FLAG)
}

/* -------------------------------------------------------------------------- */
/* Shared copy action                                                         */
/* -------------------------------------------------------------------------- */

export {
  copyAnnouncement,
  copyIsBusy,
  copyLabel,
  copyLiveRegion,
  copyReducer,
  idleCopyState,
} from '../../components/actions/copy.logic'
export type { CopyEvent, CopyState, CopyStatus } from '../../components/actions/copy.logic'

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The language chip above a code block. Accepts either a bare language or the
 * `language-ts` class name a markdown renderer produces, because both arrive
 * depending on which renderer produced the block.
 */
export function codeLanguageLabel(language: string | null | undefined): string {
  const raw = (language ?? '').trim().replace(/^language-/, '')

  return raw.length > 0 ? raw : 'Code'
}

/* -------------------------------------------------------------------------- */
/* Render failure                                                             */
/* -------------------------------------------------------------------------- */

export type ProseRenderState = 'ready' | 'empty' | 'error'

export interface ProseRenderInput {
  readonly hasContent: boolean
  readonly error?: string | null
}

/**
 * A renderer that threw is not the same thing as an article with no body, and
 * the reader needs to be told which one happened: one is a failure they can
 * retry, the other is a draft nobody has written yet.
 */
export function proseRenderState({ hasContent, error = null }: ProseRenderInput): ProseRenderState {
  if (error) {
    return 'error'
  }

  return hasContent ? 'ready' : 'empty'
}

export type DiagramView = 'diagram' | 'source'

export interface DiagramViewInput {
  readonly hasError: boolean
  readonly showSource: boolean
  readonly hasSource: boolean
}

/**
 * What a diagram frame shows.
 *
 * A diagram that failed to render falls back to its own source, because the
 * source is a description of the diagram and an empty box is not. With neither
 * a rendered diagram nor a source there is nothing to fall back to, and the
 * frame says so rather than drawing an empty bordered rectangle.
 */
export function diagramView({ hasError, showSource, hasSource }: DiagramViewInput): DiagramView {
  if (hasError || showSource) {
    return hasSource ? 'source' : 'diagram'
  }

  return 'diagram'
}

/** Whether the "show the source" toggle is worth offering at all. */
export function diagramSourceToggleAvailable({ hasSource, hasError }: DiagramViewInput): boolean {
  return hasSource && !hasError
}

export function diagramFailureMessage(subject = 'this diagram'): string {
  return `We could not draw ${subject}. Its source is below.`
}
