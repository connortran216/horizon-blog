import { describe, expect, it } from 'vitest'

import { componentTokens } from '../../../theme/tokens'
import {
  addTag,
  autosaveState,
  draftRecovery,
  normalizeTag,
  removeTag,
  uploadState,
  workspaceLayout,
  workspaceModes,
  type AutosaveStateInput,
} from './workspace.logic'

/**
 * `horizon-blog-dsv2.6.2` acceptance 3: critical state is never communicated by
 * motion or colour alone.
 *
 * The structural half of that claim is testable here - every state carries a
 * non-empty label and a distinct icon alongside its colour. The other half,
 * that the rendered component actually paints all three, belongs to the B6
 * gallery and the manual accessibility matrix.
 */
describe('autosave state', () => {
  const everyState: AutosaveStateInput[] = [
    {},
    { hasUnsavedChanges: true },
    { lastSavedLabel: 'a moment ago' },
    { isSaving: true },
    { error: 'The server rejected the title.' },
    { isOffline: true },
    { permissionLost: true },
  ]

  it('never returns a state without words', () => {
    for (const input of everyState) {
      expect(autosaveState(input).label.trim().length).toBeGreaterThan(0)
    }
  })

  it('gives each status its own icon, so colour is never the only difference', () => {
    const pairs = everyState.map((input) => {
      const state = autosaveState(input)

      return `${state.status}:${state.icon}`
    })

    expect(new Set(pairs).size).toBe(pairs.length)
  })

  it('paints from the workspace tokens rather than a literal', () => {
    const colours = new Set<string>(Object.values(componentTokens.workspace))

    for (const input of everyState) {
      expect(colours.has(autosaveState(input).color)).toBe(true)
    }
  })

  it('is idle before anything is typed', () => {
    expect(autosaveState({}).status).toBe('idle')
  })

  it('reports unsaved changes rather than claiming the last save still holds', () => {
    const state = autosaveState({ hasUnsavedChanges: true, lastSavedLabel: 'a moment ago' })

    expect(state.status).toBe('unsaved')
  })

  it('puts permission loss above every other state', () => {
    const state = autosaveState({
      permissionLost: true,
      isOffline: true,
      isSaving: true,
      error: 'rejected',
      hasUnsavedChanges: true,
    })

    expect(state.status).toBe('permissionLost')
    expect(state.isAtRisk).toBe(true)
  })

  it('tells the author their work is kept locally when access is lost', () => {
    expect(autosaveState({ permissionLost: true }).detail).toContain('kept in this browser')
  })

  it('puts offline above a save in flight, because that save cannot land', () => {
    expect(autosaveState({ isOffline: true, isSaving: true }).status).toBe('offline')
  })

  it('drops a stale failure once a new save starts', () => {
    expect(autosaveState({ isSaving: true, error: 'previous failure' }).status).toBe('saving')
  })

  it('shows the caller failure message rather than a generic sentence', () => {
    const state = autosaveState({ error: 'The title is longer than the server accepts.' })

    expect(state.status).toBe('failed')
    expect(state.detail).toBe('The title is longer than the server accepts.')
    expect(state.label.toLowerCase()).not.toContain('something went wrong')
  })

  it('interrupts only when work is actually at risk', () => {
    expect(autosaveState({ permissionLost: true }).interrupts).toBe(true)
    expect(autosaveState({ isOffline: true }).interrupts).toBe(true)
    expect(autosaveState({ error: 'rejected' }).interrupts).toBe(true)

    expect(autosaveState({ isSaving: true }).interrupts).toBe(false)
    expect(autosaveState({ lastSavedLabel: 'just now' }).interrupts).toBe(false)
    expect(autosaveState({ hasUnsavedChanges: true }).interrupts).toBe(false)
  })

  it('names when the draft was saved rather than saying "saved" forever', () => {
    expect(autosaveState({ lastSavedLabel: 'at 09:14' }).label).toBe('Draft saved at 09:14')
  })
})

describe('draft recovery', () => {
  it('says nothing when there is no local backup', () => {
    expect(draftRecovery({ serverSavedAt: 1000 }).offersRecovery).toBe(false)
  })

  it('offers a local draft that never reached the server', () => {
    const result = draftRecovery({ localSavedAt: 5000 })

    expect(result.offersRecovery).toBe(true)
    expect(result.detail).toContain('never saved to your account')
  })

  it('offers a local draft that is newer than the saved one', () => {
    expect(draftRecovery({ localSavedAt: 20_000, serverSavedAt: 10_000 }).offersRecovery).toBe(true)
  })

  it('stays quiet about an older local draft, which would overwrite good work', () => {
    expect(draftRecovery({ localSavedAt: 10_000, serverSavedAt: 20_000 }).offersRecovery).toBe(
      false,
    )
  })

  it('treats clock skew inside the tolerance as "not newer"', () => {
    expect(
      draftRecovery({ localSavedAt: 10_500, serverSavedAt: 10_000, toleranceMs: 2000 })
        .offersRecovery,
    ).toBe(false)
  })

  it('offers once the difference is bigger than the tolerance', () => {
    expect(
      draftRecovery({ localSavedAt: 13_000, serverSavedAt: 10_000, toleranceMs: 2000 })
        .offersRecovery,
    ).toBe(true)
  })
})

describe('workspace layout', () => {
  it('offers exactly three modes', () => {
    expect(workspaceModes).toEqual(['write', 'preview', 'split'])
  })

  it('shows one pane at a time in the single modes', () => {
    expect(workspaceLayout('write')).toMatchObject({ showsEditor: true, showsPreview: false })
    expect(workspaceLayout('preview')).toMatchObject({ showsEditor: false, showsPreview: true })
  })

  it('shows both panes in split', () => {
    const layout = workspaceLayout('split')

    expect(layout.showsEditor).toBe(true)
    expect(layout.showsPreview).toBe(true)
  })

  it('stacks the split into one column below the columns breakpoint', () => {
    const layout = workspaceLayout('split')

    expect(layout.templateColumns.base).toBe('minmax(0, 1fr)')
    expect(layout.templateColumns.md).toBe('minmax(0, 1fr) minmax(0, 1fr)')
  })

  it('keeps both panes when the split stacks - a narrow screen hides nothing', () => {
    const layout = workspaceLayout('split')

    expect(layout.stacksBelowColumns).toBe(true)
    expect(layout.showsEditor && layout.showsPreview).toBe(true)
  })

  it('uses minmax tracks, so a long code line scrolls in its pane', () => {
    for (const mode of workspaceModes) {
      expect(workspaceLayout(mode).templateColumns.base).toContain('minmax(0,')
    }
  })
})

describe('tags', () => {
  it('collapses whitespace without touching the author capitalisation', () => {
    expect(normalizeTag('  Distributed   Systems ')).toBe('Distributed Systems')
  })

  it('adds a tag', () => {
    expect(addTag({ tags: [], candidate: 'Databases' }).tags).toEqual(['Databases'])
  })

  it('ignores an empty candidate without complaining', () => {
    const result = addTag({ tags: ['a'], candidate: '   ' })

    expect(result.tags).toEqual(['a'])
    expect(result.rejection).toBeNull()
    expect(result.clearsInput).toBe(false)
  })

  it('clears the input on a duplicate rather than reporting an error', () => {
    // The author asked for a tag that is already there. They have it.
    const result = addTag({ tags: ['Databases'], candidate: 'databases' })

    expect(result.tags).toEqual(['Databases'])
    expect(result.rejection).toBeNull()
    expect(result.clearsInput).toBe(true)
  })

  it('keeps an over-long tag in the input so it can be shortened', () => {
    const result = addTag({ tags: [], candidate: 'x'.repeat(40), maxLength: 32 })

    expect(result.rejection).toContain('32 characters')
    expect(result.clearsInput).toBe(false)
  })

  it('refuses a tag past the limit and says how to make room', () => {
    const result = addTag({ tags: ['a', 'b'], candidate: 'c', maxTags: 2 })

    expect(result.tags).toEqual(['a', 'b'])
    expect(result.rejection).toContain('Remove one')
  })

  it('treats zero as no limit', () => {
    expect(addTag({ tags: ['a', 'b'], candidate: 'c', maxTags: 0 }).tags).toHaveLength(3)
  })

  it('removes a tag by value', () => {
    expect(removeTag(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
  })
})

describe('media upload state', () => {
  it('is idle with no image', () => {
    expect(uploadState({}).status).toBe('idle')
  })

  it('reports the unsaved-draft precondition before a file is chosen', () => {
    const state = uploadState({ requiresSavedDraft: true })

    expect(state.status).toBe('blocked')
    expect(state.label).toContain('Save the draft once')
    expect(state.canChoose).toBe(false)
  })

  it('puts denial above the unsaved-draft precondition', () => {
    const state = uploadState({
      deniedAction: 'add images to this post',
      requiresSavedDraft: true,
      isUploading: true,
    })

    expect(state.status).toBe('denied')
    expect(state.canChoose).toBe(false)
  })

  it('locks the picker while an upload is in flight', () => {
    expect(uploadState({ isUploading: true }).canChoose).toBe(false)
  })

  it('offers a retry after a failure and keeps the picker open', () => {
    const state = uploadState({ error: 'Image is larger than 5MB.' })

    expect(state.status).toBe('failed')
    expect(state.label).toBe('Image is larger than 5MB.')
    expect(state.canRetry).toBe(true)
    expect(state.canChoose).toBe(true)
  })

  it('offers removal only once there is something to remove', () => {
    expect(uploadState({ hasMedia: true }).canRemove).toBe(true)
    expect(uploadState({}).canRemove).toBe(false)
  })

  it('never returns a state without words', () => {
    const inputs = [
      {},
      { hasMedia: true },
      { isUploading: true },
      { error: 'failed' },
      { requiresSavedDraft: true },
      { deniedAction: 'add images' },
    ]

    for (const input of inputs) {
      expect(uploadState(input).label.trim().length).toBeGreaterThan(0)
    }
  })
})
