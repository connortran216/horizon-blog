import { describe, expect, it } from 'vitest'

import {
  chakraColorVar,
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
  scrollAffordanceStyle,
  scrollFadeAttributeValue,
  scrollFadeStyle,
  scrollFadeVisibility,
  scrollRegionLabel,
  scrollRegionSelector,
  syncScrollFade,
  syncScrollRegion,
  watchScrollFade,
  widensDocument,
  type CopyState,
  type ScrollContainerLike,
  type ScrollFadeTarget,
} from './code.logic'

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

/** dsv2.5.3 acceptance 1's visible half: reachable content that says so. */
describe('chakraColorVar', () => {
  it('turns a dotted semantic token into the CSS custom property Chakra emits for it', () => {
    expect(chakraColorVar('border.subtle')).toBe('var(--chakra-colors-border-subtle)')
  })

  it('turns every dot into a dash, for a token nested more than one level deep', () => {
    expect(chakraColorVar('code.syntax.keyword')).toBe('var(--chakra-colors-code-syntax-keyword)')
  })
})

describe('scrollAffordanceStyle', () => {
  const thumb = 'var(--chakra-colors-border-subtle)'

  it('declares both the Chromium/Safari and the Firefox scrollbar, from the same colour', () => {
    const style = scrollAffordanceStyle({ thumb })

    expect(style.scrollbarWidth).toBe('thin')
    expect(style.scrollbarColor).toBe(`${thumb} transparent`)
    expect(style['&::-webkit-scrollbar-thumb'].background).toBe(thumb)
  })

  it('defaults the track to transparent, so the container keeps its own background', () => {
    const style = scrollAffordanceStyle({ thumb })

    expect(style['&::-webkit-scrollbar-track'].background).toBe('transparent')
    expect(style.scrollbarColor.endsWith(' transparent')).toBe(true)
  })

  it('accepts an explicit track colour instead', () => {
    const style = scrollAffordanceStyle({ thumb, track: 'var(--chakra-colors-bg-code)' })

    expect(style.scrollbarColor).toBe(`${thumb} var(--chakra-colors-bg-code)`)
    expect(style['&::-webkit-scrollbar-track'].background).toBe('var(--chakra-colors-bg-code)')
  })
})

/**
 * The fade's own half of dsv2.5.3 acceptance 1: a scroll container that says
 * there is more to see, without ever hiding the last real character once the
 * reader has scrolled all the way to it.
 */
describe('scrollFadeVisibility', () => {
  it('shows neither fade when the container does not overflow at all', () => {
    expect(scrollFadeVisibility({ scrollLeft: 0, scrollWidth: 300, clientWidth: 300 })).toEqual({
      start: false,
      end: false,
    })
  })

  it('shows only the end fade at rest, when there is somewhere to scroll to', () => {
    expect(scrollFadeVisibility({ scrollLeft: 0, scrollWidth: 600, clientWidth: 300 })).toEqual({
      start: false,
      end: true,
    })
  })

  it('shows only the start fade once scrolled all the way to the end - never hiding the last character', () => {
    expect(scrollFadeVisibility({ scrollLeft: 300, scrollWidth: 600, clientWidth: 300 })).toEqual({
      start: true,
      end: false,
    })
  })

  it('shows both fades from a position in the middle', () => {
    expect(scrollFadeVisibility({ scrollLeft: 150, scrollWidth: 600, clientWidth: 300 })).toEqual({
      start: true,
      end: true,
    })
  })

  it('absorbs sub-pixel rounding at either extreme rather than leaving a fade lit by 0.3px', () => {
    expect(
      scrollFadeVisibility({ scrollLeft: 0.4, scrollWidth: 600.4, clientWidth: 300 }).start,
    ).toBe(false)
    expect(
      scrollFadeVisibility({ scrollLeft: 300, scrollWidth: 600.4, clientWidth: 300 }).end,
    ).toBe(false)
  })
})

describe('scrollFadeAttributeValue', () => {
  it('names the token CSS keys off with `~=`, one per visible edge', () => {
    expect(scrollFadeAttributeValue({ start: false, end: false })).toBe('')
    expect(scrollFadeAttributeValue({ start: true, end: false })).toBe('start')
    expect(scrollFadeAttributeValue({ start: false, end: true })).toBe('end')
    expect(scrollFadeAttributeValue({ start: true, end: true })).toBe('start end')
  })
})

function fakeScrollElement({
  scrollLeft = 0,
  scrollWidth = 600,
  clientWidth = 300,
  attributes = {},
}: {
  scrollLeft?: number
  scrollWidth?: number
  clientWidth?: number
  attributes?: Record<string, string>
} = {}) {
  const store = new Map(Object.entries(attributes))
  const listeners = new Set<() => void>()

  return {
    scrollLeft,
    scrollWidth,
    clientWidth,
    attributes: store,
    setAttribute: (name: string, value: string) => {
      store.set(name, value)
    },
    removeAttribute: (name: string) => {
      store.delete(name)
    },
    addEventListener: (_type: 'scroll', listener: () => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: 'scroll', listener: () => void) => {
      listeners.delete(listener)
    },
    fireScroll: () => listeners.forEach((listener) => listener()),
    listenerCount: () => listeners.size,
  }
}

describe('syncScrollFade', () => {
  it('writes the attribute when there is somewhere left to scroll', () => {
    const element = fakeScrollElement({ scrollWidth: 600, clientWidth: 300 })

    syncScrollFade(element)

    expect(element.attributes.get('data-scroll-fade')).toBe('end')
  })

  it('removes the attribute rather than writing an empty string when nothing overflows', () => {
    const element = fakeScrollElement({
      scrollWidth: 300,
      clientWidth: 300,
      attributes: { 'data-scroll-fade': 'end' },
    })

    syncScrollFade(element)

    expect(element.attributes.has('data-scroll-fade')).toBe(false)
  })
})

describe('watchScrollFade', () => {
  it('syncs once immediately, without waiting for a scroll event', () => {
    const element = fakeScrollElement({ scrollWidth: 600, clientWidth: 300 })

    watchScrollFade(element as unknown as ScrollFadeTarget)

    expect(element.attributes.get('data-scroll-fade')).toBe('end')
  })

  it('re-syncs on every scroll event, tracking the reader across the container', () => {
    const element = fakeScrollElement({ scrollLeft: 0, scrollWidth: 600, clientWidth: 300 })

    watchScrollFade(element as unknown as ScrollFadeTarget)
    element.scrollLeft = 300
    element.fireScroll()

    expect(element.attributes.get('data-scroll-fade')).toBe('start')
  })

  it('stops watching once the returned disposer runs', () => {
    const element = fakeScrollElement({ scrollLeft: 0, scrollWidth: 600, clientWidth: 300 })

    const dispose = watchScrollFade(element as unknown as ScrollFadeTarget)
    dispose()
    element.scrollLeft = 300
    element.fireScroll()

    // Still "end" from the initial sync - the disposed listener never ran.
    expect(element.attributes.get('data-scroll-fade')).toBe('end')
    expect(element.listenerCount()).toBe(0)
  })
})

describe('scrollFadeStyle', () => {
  const background = 'var(--chakra-colors-bg-code)'

  it('positions the container so its pseudo-elements have something to anchor to', () => {
    expect(scrollFadeStyle({ background }).position).toBe('relative')
  })

  it('fades each edge from the real background to transparent, in front of the content', () => {
    const style = scrollFadeStyle({ background })

    expect(style['&::before'].background).toBe(
      `linear-gradient(to right, ${background}, transparent)`,
    )
    expect(style['&::after'].background).toBe(
      `linear-gradient(to left, ${background}, transparent)`,
    )
    expect(style['&::before'].position).toBe('absolute')
  })

  it('starts both edges invisible, never obscuring content nothing yet says is cut off', () => {
    const style = scrollFadeStyle({ background })

    expect(style['&::before'].opacity).toBe(0)
    expect(style['&::after'].opacity).toBe(0)
  })

  it('lights each edge only under the attribute state that names it', () => {
    const style = scrollFadeStyle({ background })

    expect(style['&[data-scroll-fade~="start"]::before'].opacity).toBe(1)
    expect(style['&[data-scroll-fade~="end"]::after'].opacity).toBe(1)
  })

  it('never intercepts a click or a drag', () => {
    const style = scrollFadeStyle({ background })

    expect(style['&::before'].pointerEvents).toBe('none')
    expect(style['&::after'].pointerEvents).toBe('none')
  })

  it('reaches the width the caller asked for, defaulting to 32px', () => {
    expect(scrollFadeStyle({ background }).position).toBe('relative')
    expect(scrollFadeStyle({ background })['&::before'].width).toBe('32px')
    expect(scrollFadeStyle({ background, width: '48px' })['&::after'].width).toBe('48px')
  })
})

describe('codeTextStyle', () => {
  it('reads at the type ramp step below prose, not at the ambient prose size', () => {
    expect(codeTextStyle.textStyle).toBe('body')
  })

  it('carries the design system mono family rather than an unstyled monospace', () => {
    expect(codeTextStyle.fontFamily).toBe('mono')
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
