import { describe, expect, it } from 'vitest'

import {
  codeLanguageLabel,
  codeTextStyle,
  copyAnnouncement,
  copyIsBusy,
  copyLabel,
  copyLiveRegion,
  copyReducer,
  diagramFailureMessage,
  diagramSourceToggleAvailable,
  diagramView,
  idleCopyState,
  localScrollStyle,
  proseRenderState,
  releaseScrollRegion,
  scrollRegionLabel,
  scrollRegionSelector,
  syncScrollRegion,
  widensDocument,
  type CopyState,
  type ScrollContainerLike,
} from './code.logic'

describe('codeTextStyle', () => {
  it('reads at the type ramp step below prose, not at the ambient prose size', () => {
    expect(codeTextStyle.textStyle).toBe('body')
  })

  it('carries the design system mono family rather than an unstyled monospace', () => {
    expect(codeTextStyle.fontFamily).toBe('mono')
  })
})

/** dsv2.5.3 acceptance 1: code and tables scroll locally. */
describe('localScrollStyle', () => {
  it('scrolls inside itself', () => {
    expect(localScrollStyle().overflowX).toBe('auto')
  })

  it('caps its own width, so it cannot widen the document', () => {
    expect(localScrollStyle().maxWidth).toBe('100%')
  })

  it('overrides the flex and grid min-width default, which is the real culprit', () => {
    // Without `min-width: 0` a grid child is at least as wide as its content, so
    // a 2000px table stretches the column and the whole page scrolls sideways
    // however carefully `overflow` was set.
    expect(localScrollStyle().minWidth).toBe(0)
  })

  it('recognises a container that would widen the document', () => {
    expect(widensDocument(localScrollStyle())).toBe(false)
    expect(widensDocument({ ...localScrollStyle(), minWidth: undefined })).toBe(true)
    expect(widensDocument({ ...localScrollStyle(), maxWidth: undefined })).toBe(true)
    expect(widensDocument({ ...localScrollStyle(), overflowX: undefined })).toBe(true)
  })
})

describe('copyReducer', () => {
  const copying: CopyState = { status: 'copying' }

  it('starts a copy', () => {
    expect(copyReducer(idleCopyState, { type: 'copy' }).status).toBe('copying')
  })

  it('reaches the confirmed state', () => {
    expect(copyReducer(copying, { type: 'succeeded' }).status).toBe('copied')
  })

  it('reaches the failed state', () => {
    expect(copyReducer(copying, { type: 'failed' }).status).toBe('failed')
  })

  it('ignores a result that arrives when nothing is in flight', () => {
    expect(copyReducer(idleCopyState, { type: 'succeeded' })).toBe(idleCopyState)
    expect(copyReducer({ status: 'copied' }, { type: 'failed' }).status).toBe('copied')
  })

  it('ignores a second press while a copy is in flight', () => {
    expect(copyReducer(copying, { type: 'copy' })).toBe(copying)
  })

  it('can be copied again after a success or a failure', () => {
    expect(copyReducer({ status: 'copied' }, { type: 'copy' }).status).toBe('copying')
    expect(copyReducer({ status: 'failed' }, { type: 'copy' }).status).toBe('copying')
  })

  it('resets from a settled state, and never out of one in flight', () => {
    expect(copyReducer({ status: 'copied' }, { type: 'reset' })).toEqual(idleCopyState)
    expect(copyReducer({ status: 'failed' }, { type: 'reset' })).toEqual(idleCopyState)
    expect(copyReducer(copying, { type: 'reset' })).toBe(copying)
    expect(copyReducer(idleCopyState, { type: 'reset' })).toBe(idleCopyState)
  })

  it('reports whether a copy is in flight', () => {
    expect(copyIsBusy('copying')).toBe(true)
    expect(copyIsBusy('copied')).toBe(false)
  })
})

describe('copy copy', () => {
  it('labels the button with a verb and a subject', () => {
    expect(copyLabel('idle')).toBe('Copy the code')
    expect(copyLabel('idle', 'link')).toBe('Copy the link')
    expect(copyLabel('copying')).toBe('Copying the code')
    expect(copyLabel('copied')).toBe('Copied')
    expect(copyLabel('failed')).toBe('Copy failed')
  })

  it('announces the outcome and nothing else', () => {
    expect(copyAnnouncement('idle')).toBeNull()
    expect(copyAnnouncement('copying')).toBeNull()
    expect(copyAnnouncement('copied')).toContain('clipboard')
  })

  it('tells the reader what to do instead when the clipboard refuses', () => {
    expect(copyAnnouncement('failed')).toContain('Select it')
  })

  it('interrupts for a failure and stays polite for a success', () => {
    expect(copyLiveRegion('failed')).toEqual({ role: 'alert', 'aria-live': 'assertive' })
    expect(copyLiveRegion('copied')).toEqual({ role: 'status', 'aria-live': 'polite' })
  })
})

describe('codeLanguageLabel', () => {
  it('accepts a bare language and a renderer class name alike', () => {
    expect(codeLanguageLabel('ts')).toBe('ts')
    expect(codeLanguageLabel('language-ts')).toBe('ts')
  })

  it('falls back to a word rather than an empty chip', () => {
    expect(codeLanguageLabel(null)).toBe('Code')
    expect(codeLanguageLabel('  ')).toBe('Code')
    expect(codeLanguageLabel('language-')).toBe('Code')
  })
})

describe('proseRenderState', () => {
  it('separates a renderer that threw from an article with no body', () => {
    expect(proseRenderState({ hasContent: false, error: 'boom' })).toBe('error')
    expect(proseRenderState({ hasContent: false })).toBe('empty')
    expect(proseRenderState({ hasContent: true })).toBe('ready')
  })

  it('reports a failure even when there is stale content on screen', () => {
    expect(proseRenderState({ hasContent: true, error: 'boom' })).toBe('error')
  })
})

describe('diagramView', () => {
  it('shows the diagram by default', () => {
    expect(diagramView({ hasError: false, showSource: false, hasSource: true })).toBe('diagram')
  })

  it('shows the source on request', () => {
    expect(diagramView({ hasError: false, showSource: true, hasSource: true })).toBe('source')
  })

  it('falls back to the source when the renderer failed', () => {
    expect(diagramView({ hasError: true, showSource: false, hasSource: true })).toBe('source')
  })

  it('has nothing to fall back to without a source', () => {
    expect(diagramView({ hasError: true, showSource: true, hasSource: false })).toBe('diagram')
  })

  it('does not offer a toggle there is nothing to toggle to', () => {
    expect(
      diagramSourceToggleAvailable({ hasError: false, showSource: false, hasSource: false }),
    ).toBe(false)
  })

  it('does not offer a toggle while the source is already the only thing showing', () => {
    expect(
      diagramSourceToggleAvailable({ hasError: true, showSource: false, hasSource: true }),
    ).toBe(false)
  })

  it('names the diagram in its failure message', () => {
    expect(diagramFailureMessage('Request flow')).toContain('Request flow')
  })
})

/**
 * Reaching a wide container with a keyboard.
 *
 * `CodeBlock` builds its own `pre` and writes these attributes by hand. `Prose`
 * cannot: it holds a third-party renderer's output, and the rule that keeps that
 * output inside the measure is a CSS descendant selector, which can add overflow
 * and cannot add attributes - so a wide table inside a Crepe surface scrolled
 * for a mouse and was unreachable otherwise.
 *
 * The repair is here as decisions over a plain object, which is what makes the
 * awkward halves provable without a DOM: an element somebody else already owns,
 * an element that stops overflowing, and a second sweep over the same element.
 */
interface FakeElement extends ScrollContainerLike {
  readonly attributes: Map<string, string>
}

function fakeElement({
  tagName = 'TABLE',
  scrollWidth = 2000,
  clientWidth = 343,
  attributes = {},
}: {
  tagName?: string
  scrollWidth?: number
  clientWidth?: number
  attributes?: Record<string, string>
} = {}): FakeElement {
  const store = new Map(Object.entries(attributes))

  return {
    tagName,
    scrollWidth,
    clientWidth,
    attributes: store,
    hasAttribute: (name) => store.has(name),
    getAttribute: (name) => store.get(name) ?? null,
    setAttribute: (name, value) => {
      store.set(name, value)
    },
    removeAttribute: (name) => {
      store.delete(name)
    },
  }
}

describe('the prose scroll-region selector', () => {
  it('covers the two containers Prose gives local overflow to, and no others', () => {
    expect(scrollRegionSelector).toBe('pre, table')
  })
})

describe('naming a scroll region', () => {
  it('says what the container is, so focus does not land on an unnamed group', () => {
    expect(scrollRegionLabel('PRE')).toBe('Code block')
    expect(scrollRegionLabel('table')).toBe('Table')
  })

  it('still names a container it does not recognise', () => {
    expect(scrollRegionLabel('figure')).toBe('Scrollable content')
  })
})

describe('syncScrollRegion', () => {
  it('gives a wide container the three attributes CodeBlock gives its own', () => {
    const element = fakeElement()

    expect(syncScrollRegion(element)).toBe('adopted')
    expect(element.attributes.get('tabindex')).toBe('0')
    expect(element.attributes.get('role')).toBe('group')
    expect(element.attributes.get('aria-label')).toBe('Table')
  })

  /*
   * A tab stop per code block, on an article that has twelve of them, for
   * scrolling that cannot happen. The narrow case is the common one.
   */
  it('leaves a container that fits alone', () => {
    const element = fakeElement({ tagName: 'PRE', scrollWidth: 320, clientWidth: 343 })

    expect(syncScrollRegion(element)).toBe('ignored')
    expect(element.attributes.size).toBe(0)
  })

  it("leaves CodeBlock's own frame alone rather than owning it twice", () => {
    const element = fakeElement({
      tagName: 'PRE',
      attributes: { tabindex: '0', role: 'group', 'aria-label': 'ts code block' },
    })

    expect(syncScrollRegion(element)).toBe('ignored')
    expect(element.attributes.get('aria-label')).toBe('ts code block')
  })

  it('leaves a container a renderer has already made focusable', () => {
    const element = fakeElement({ attributes: { tabindex: '-1' } })

    expect(syncScrollRegion(element)).toBe('ignored')
    expect(element.attributes.has('role')).toBe(false)
  })

  it('keeps a name the renderer supplied rather than overwriting it', () => {
    const element = fakeElement({ attributes: { 'aria-label': 'Quarterly figures' } })

    expect(syncScrollRegion(element)).toBe('adopted')
    expect(element.attributes.get('aria-label')).toBe('Quarterly figures')
  })

  it('changes nothing on a second sweep over the same element', () => {
    const element = fakeElement()

    syncScrollRegion(element)
    const afterFirst = new Map(element.attributes)

    expect(syncScrollRegion(element)).toBe('adopted')
    expect(element.attributes).toEqual(afterFirst)
  })

  /*
   * A table that only overflows at 375px must not stay a tab stop once the
   * reader turns the tablet around.
   */
  it('hands the attributes back when the container stops overflowing', () => {
    const element = fakeElement()

    syncScrollRegion(element)

    const narrowed = { ...element, clientWidth: 2000 }

    expect(syncScrollRegion(narrowed)).toBe('released')
    expect(element.attributes.size).toBe(0)
  })
})

describe('releaseScrollRegion', () => {
  it('removes exactly what the adoption added', () => {
    const element = fakeElement({ attributes: { 'aria-label': 'Quarterly figures' } })

    syncScrollRegion(element)
    releaseScrollRegion(element)

    // The name was the renderer's, so it survives; the focus behaviour was ours.
    expect(element.attributes.get('aria-label')).toBe('Quarterly figures')
    expect(element.attributes.has('tabindex')).toBe(false)
    expect(element.attributes.has('role')).toBe(false)
  })

  it('leaves an element it never adopted untouched', () => {
    const element = fakeElement({ attributes: { role: 'presentation', tabindex: '0' } })

    releaseScrollRegion(element)

    expect(element.attributes.get('role')).toBe('presentation')
    expect(element.attributes.get('tabindex')).toBe('0')
  })

  it('is safe to call twice, which is what unmount after a release does', () => {
    const element = fakeElement()

    syncScrollRegion(element)
    releaseScrollRegion(element)
    releaseScrollRegion(element)

    expect(element.attributes.size).toBe(0)
  })
})
