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
