import { describe, expect, it } from 'vitest'

import {
  codeLanguageLabel,
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
  widensDocument,
  type CopyState,
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
