import { describe, expect, it } from 'vitest'
import { autosaveState } from '../../design-system'
import {
  GENERIC_SAVE_FAILURE,
  autosaveIndicator,
  lastSavedLabel,
  wordCount,
  workspaceFooter,
  type EditorSaveSnapshot,
} from './editor-status.utils'

const idle: EditorSaveSnapshot = {
  isSaving: false,
  saveStatus: 'saved',
  permissionLost: false,
  isOffline: false,
  hasSavedDraft: false,
  locale: 'en-GB',
}

/** What the author actually reads, rather than the flags behind it. */
const label = (snapshot: EditorSaveSnapshot) => autosaveState(autosaveIndicator(snapshot))

describe('autosave indicator', () => {
  it('says nothing has been typed yet before the first save', () => {
    expect(label(idle).status).toBe('idle')
    expect(label(idle).label).toBe('Draft')
  })

  it('names the moment the draft reached the server', () => {
    const state = label({
      ...idle,
      hasSavedDraft: true,
      lastSaved: new Date('2026-03-03T14:32:00Z'),
      locale: 'en-GB',
    })

    expect(state.status).toBe('saved')
    expect(state.label).toMatch(/^Draft saved at \d{2}:\d{2}$/)
  })

  it('reports a save in flight whether the flag or the status says so', () => {
    expect(label({ ...idle, isSaving: true }).status).toBe('saving')
    expect(label({ ...idle, saveStatus: 'saving' }).status).toBe('saving')
  })

  it('carries the backend validation message when there is one', () => {
    const state = label({
      ...idle,
      saveStatus: 'error',
      validationMessage: 'Title must be under 200 characters.',
    })

    expect(state.status).toBe('failed')
    expect(state.detail).toBe('Title must be under 200 characters.')
  })

  it('still says where the work is when the failure has no message', () => {
    const state = label({ ...idle, saveStatus: 'error' })

    expect(state.status).toBe('failed')
    expect(state.detail).toBe(GENERIC_SAVE_FAILURE)
  })

  it('reports being offline rather than a failed save', () => {
    const state = label({ ...idle, isOffline: true, saveStatus: 'error' })

    expect(state.status).toBe('offline')
    expect(state.isAtRisk).toBe(true)
  })

  it('puts a lost permission above every other signal', () => {
    const state = label({
      ...idle,
      permissionLost: true,
      isOffline: true,
      isSaving: true,
      saveStatus: 'error',
    })

    expect(state.status).toBe('permissionLost')
    expect(state.interrupts).toBe(true)
  })

  it('never reports a save time it does not have', () => {
    expect(autosaveIndicator({ ...idle, hasSavedDraft: true }).lastSavedLabel).toBeUndefined()
    expect(
      autosaveIndicator({ ...idle, lastSaved: new Date('2026-03-03T14:32:00Z') }).lastSavedLabel,
    ).toBeUndefined()
  })

  it('degrades to a phrase rather than "at Invalid Date"', () => {
    expect(lastSavedLabel(new Date('not a date'))).toBe('a moment ago')
  })
})

describe('workspace footer', () => {
  it('counts nothing in an empty draft', () => {
    expect(wordCount('')).toBe(0)
    expect(wordCount('   \n\n  ')).toBe(0)
    expect(workspaceFooter('')).toBe('0 words · Markdown')
  })

  it('counts one word as a word', () => {
    expect(workspaceFooter('Xin')).toBe('1 word · Markdown')
  })

  it('counts Vietnamese the same way it counts English', () => {
    expect(wordCount('Xin chào các bạn')).toBe(4)
    expect(wordCount('Hello there, everyone')).toBe(3)
  })

  it('does not let repeated whitespace inflate the count', () => {
    expect(wordCount('one   two\n\nthree\tfour')).toBe(4)
  })
})
