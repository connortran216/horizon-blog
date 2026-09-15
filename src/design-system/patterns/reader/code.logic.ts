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
/* Copying code                                                               */
/* -------------------------------------------------------------------------- */

export type CopyStatus = 'idle' | 'copying' | 'copied' | 'failed'

export interface CopyState {
  readonly status: CopyStatus
}

export type CopyEvent =
  | { readonly type: 'copy' }
  | { readonly type: 'succeeded' }
  | { readonly type: 'failed' }
  | { readonly type: 'reset' }

export const idleCopyState: CopyState = { status: 'idle' }

/**
 * The copy button's state machine.
 *
 * `succeeded` and `failed` are ignored unless a copy is actually in flight, so
 * a clipboard promise that settles after the reader has already pressed the
 * button again cannot overwrite the newer attempt's result.
 *
 * There is no timer here, and that is deliberate. The confirmation would need a
 * hold duration of a second or two, the token source has no such value, and
 * inventing one in a component is exactly the raw design value `CONVENTIONS.md`
 * forbids. The frame resets on `pointerleave` and `blur` instead - an event the
 * reader generates, which needs no duration at all.
 */
export function copyReducer(state: CopyState, event: CopyEvent): CopyState {
  switch (event.type) {
    case 'copy':
      return state.status === 'copying' ? state : { status: 'copying' }

    case 'succeeded':
      return state.status === 'copying' ? { status: 'copied' } : state

    case 'failed':
      return state.status === 'copying' ? { status: 'failed' } : state

    case 'reset':
      return state.status === 'idle' || state.status === 'copying' ? state : idleCopyState
  }
}

/** The button's own words. Never an icon alone - this is a labelled control. */
export function copyLabel(status: CopyStatus, subject = 'code'): string {
  switch (status) {
    case 'copying':
      return `Copying the ${subject}`
    case 'copied':
      return 'Copied'
    case 'failed':
      return 'Copy failed'
    default:
      return `Copy the ${subject}`
  }
}

/**
 * What is announced, and `null` when there is nothing worth interrupting for.
 *
 * The failure says what to do instead. A clipboard write can be refused by the
 * browser for reasons the reader can do nothing about - an insecure origin, a
 * denied permission, a browser with no clipboard API - and "Copy failed" on its
 * own leaves them stuck in front of code they can still select by hand.
 */
export function copyAnnouncement(status: CopyStatus, subject = 'code'): string | null {
  switch (status) {
    case 'copied':
      return `The ${subject} is on your clipboard`
    case 'failed':
      return `We could not copy the ${subject}. Select it to copy it by hand.`
    default:
      return null
  }
}

/** A failure is asserted; a success is polite. */
export function copyLiveRegion(status: CopyStatus): {
  readonly role: 'status' | 'alert'
  readonly 'aria-live': 'polite' | 'assertive'
} {
  return status === 'failed'
    ? { role: 'alert', 'aria-live': 'assertive' }
    : { role: 'status', 'aria-live': 'polite' }
}

export function copyIsBusy(status: CopyStatus): boolean {
  return status === 'copying'
}

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
