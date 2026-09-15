import { describe, expect, it } from 'vitest'

import { componentTokens } from '../../../theme/tokens'
import {
  addBlogFieldState,
  addBlogToSeries,
  addableBlogOptions,
  resolveSeriesParts,
  seriesDeleteCopy,
  seriesDeleteState,
  seriesFormDirty,
  seriesFormState,
  seriesSaveGate,
  seriesSaveRequest,
  type SeriesBlogOption,
  type SeriesFormStateInput,
  type SeriesFormValues,
} from './seriesManager.logic'

const saved: SeriesFormValues = {
  title: 'Database Engineering',
  description: 'What a write-ahead log promises.',
  partIds: ['11', '12', '13'],
}

const options: SeriesBlogOption[] = [
  { id: '11', title: 'Durability', status: 'published' },
  { id: '12', title: 'Checkpoints', status: 'published' },
  { id: '13', title: 'Recovery', status: 'draft' },
  { id: '14', title: 'Replication', status: 'draft' },
  { id: '15', title: 'Held elsewhere', status: 'published' },
]

/* -------------------------------------------------------------------------- */
/* Unsaved changes                                                            */
/* -------------------------------------------------------------------------- */

describe('unsaved changes', () => {
  it('is clean when the draft is what the server holds', () => {
    expect(seriesFormDirty(saved, { ...saved }).any).toBe(false)
  })

  it('sees an edited title, description and order separately', () => {
    expect(seriesFormDirty(saved, { ...saved, title: 'Databases' })).toMatchObject({
      title: true,
      description: false,
      order: false,
      any: true,
    })

    expect(seriesFormDirty(saved, { ...saved, description: 'Something else' })).toMatchObject({
      title: false,
      description: true,
      any: true,
    })

    expect(seriesFormDirty(saved, { ...saved, partIds: ['12', '11', '13'] })).toMatchObject({
      order: true,
      any: true,
    })
  })

  it('counts a reorder that keeps every blog, because the server stores position', () => {
    const swapped = { ...saved, partIds: ['11', '13', '12'] }

    expect(seriesFormDirty(saved, swapped).order).toBe(true)
  })

  it('counts a removal and an addition', () => {
    expect(seriesFormDirty(saved, { ...saved, partIds: ['11', '12'] }).order).toBe(true)
    expect(seriesFormDirty(saved, { ...saved, partIds: [...saved.partIds, '14'] }).order).toBe(true)
  })

  it('counts whitespace, because that is what the server would store', () => {
    expect(seriesFormDirty(saved, { ...saved, title: `${saved.title} ` }).title).toBe(true)
  })
})

describe('save request', () => {
  it('asks for nothing when nothing changed', () => {
    expect(seriesSaveRequest(saved, { ...saved })).toEqual({ identity: null, partIds: null })
  })

  it('does not replace the order when only the description changed', () => {
    const request = seriesSaveRequest(saved, { ...saved, description: 'Reworded.' })

    expect(request.partIds).toBeNull()
    expect(request.identity).toEqual({ title: saved.title, description: 'Reworded.' })
  })

  it('does not rewrite the identity when only the order changed', () => {
    const request = seriesSaveRequest(saved, { ...saved, partIds: ['13', '11', '12'] })

    expect(request.identity).toBeNull()
    expect(request.partIds).toEqual(['13', '11', '12'])
  })

  it('sends both when both changed', () => {
    const request = seriesSaveRequest(saved, {
      title: 'Databases',
      description: 'New words.',
      partIds: ['12'],
    })

    expect(request.identity).toEqual({ title: 'Databases', description: 'New words.' })
    expect(request.partIds).toEqual(['12'])
  })
})

/* -------------------------------------------------------------------------- */
/* Form state                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * `horizon-blog-dsv2.6.2` acceptance 3: critical state is never communicated by
 * motion or colour alone.
 *
 * The structural half is testable here - every state carries words, its own
 * icon and a token colour. That the rendered form paints all three is the B6
 * gallery's and the manual accessibility matrix's job, not a render-free test's.
 */
describe('form state', () => {
  const everyState: ReadonlyArray<{ name: string; input: SeriesFormStateInput }> = [
    { name: 'idle', input: { partCount: 3 } },
    { name: 'saved', input: { partCount: 3, lastSavedLabel: 'a moment ago' } },
    { name: 'emptySeries', input: { partCount: 0 } },
    { name: 'unsaved', input: { partCount: 3, isDirty: true } },
    { name: 'deleteDenied', input: { deleteDeniedAction: 'delete this Series' } },
    { name: 'saveFailed', input: { saveError: 'The title is longer than the server accepts.' } },
    { name: 'saving', input: { isSaving: true } },
    { name: 'deleting', input: { isDeleting: true } },
    { name: 'loading', input: { isLoading: true } },
    { name: 'permissionLost', input: { deniedAction: 'edit this Series' } },
  ]

  it('reaches every documented status', () => {
    expect(everyState.map(({ input }) => seriesFormState(input).status)).toEqual([
      'idle',
      'saved',
      'emptySeries',
      'unsaved',
      'deleteDenied',
      'saveFailed',
      'saving',
      'deleting',
      'loading',
      'permissionLost',
    ])
  })

  it('never returns a state without words', () => {
    for (const { name, input } of everyState) {
      expect(seriesFormState(input).label.trim().length, name).toBeGreaterThan(0)
    }
  })

  it('gives each status its own icon, so colour is never the only difference', () => {
    const pairs = everyState.map(({ input }) => seriesFormState(input).icon)

    expect(new Set(pairs).size).toBe(pairs.length)
  })

  it('paints from the token source rather than a literal', () => {
    const tokens = new Set<string>([
      ...Object.values(componentTokens.workspace),
      ...Object.values(componentTokens.feedback),
    ])

    for (const { name, input } of everyState) {
      expect(tokens.has(seriesFormState(input).color), name).toBe(true)
    }
  })

  it('pairs each tone with one colour, in every state that uses it', () => {
    const byTone = new Map<string, string>()

    for (const { input } of everyState) {
      const state = seriesFormState(input)
      const seen = byTone.get(state.tone)

      if (seen === undefined) byTone.set(state.tone, state.color)
      else expect(state.color).toBe(seen)
    }

    expect(byTone.size).toBe(5)
  })

  it('puts permission loss above every other state', () => {
    const state = seriesFormState({
      deniedAction: 'edit this Series',
      isLoading: true,
      isDeleting: true,
      isSaving: true,
      saveError: 'rejected',
      isDirty: true,
    })

    expect(state.status).toBe('permissionLost')
    expect(state.isAtRisk).toBe(true)
    expect(state.isReadOnly).toBe(true)
    expect(state.interrupts).toBe(true)
  })

  it('tells the author their changes are still on screen when access is lost', () => {
    expect(seriesFormState({ deniedAction: 'edit this Series' }).detail).toContain(
      'still on screen',
    )
  })

  it('says nothing about content while the Series is still loading', () => {
    const state = seriesFormState({ isLoading: true, partCount: 0, isDirty: true })

    expect(state.status).toBe('loading')
    expect(state.isReadOnly).toBe(true)
  })

  it('puts a delete in flight above a save in flight', () => {
    expect(seriesFormState({ isDeleting: true, isSaving: true }).status).toBe('deleting')
  })

  it('never reads as saved while a save is in flight', () => {
    const state = seriesFormState({ isSaving: true, lastSavedLabel: 'a moment ago', partCount: 3 })

    expect(state.status).toBe('saving')
    expect(state.isAtRisk).toBe(true)
    expect(state.label.toLowerCase()).not.toContain('saved ')
  })

  it('drops a stale failure once a new save starts', () => {
    expect(seriesFormState({ isSaving: true, saveError: 'previous failure' }).status).toBe('saving')
  })

  it('shows the caller failure message rather than a generic sentence', () => {
    const state = seriesFormState({ saveError: 'The Series title is already taken.' })

    expect(state.status).toBe('saveFailed')
    expect(state.detail).toBe('The Series title is already taken.')
    expect(state.label.toLowerCase()).not.toContain('something went wrong')
  })

  it('reports a refused delete rather than letting it pass as unsaved changes', () => {
    const state = seriesFormState({
      deleteDeniedAction: 'delete this Series',
      isDirty: true,
      partCount: 3,
    })

    expect(state.status).toBe('deleteDenied')
    expect(state.label).toBe('This Series was not deleted')
    expect(state.detail).toContain('do not have permission to delete this Series')
    expect(state.interrupts).toBe(true)
  })

  it('names the unsaved order, which nothing else on the form can show', () => {
    const ordinary = seriesFormState({ isDirty: true, partCount: 3 })
    const reordered = seriesFormState({ isDirty: true, hasDirtyOrder: true, partCount: 3 })

    expect(ordinary.label).toBe('Unsaved changes')
    expect(reordered.label).toContain('order')
    expect(reordered.detail).toContain('replaces the whole order')
  })

  it('treats an emptied-but-unsaved Series as unsaved rather than as empty', () => {
    expect(seriesFormState({ isDirty: true, partCount: 0 }).status).toBe('unsaved')
  })

  it('says a saved Series is empty, and what to do about it', () => {
    const state = seriesFormState({ partCount: 0, lastSavedLabel: 'a moment ago' })

    expect(state.status).toBe('emptySeries')
    expect(state.detail).toContain('Add one')
  })

  it('names when the Series was saved rather than saying "saved" forever', () => {
    expect(seriesFormState({ partCount: 2, lastSavedLabel: 'at 09:14' }).label).toBe(
      'Series saved at 09:14',
    )
  })

  it('interrupts only for states the author has to act on', () => {
    expect(seriesFormState({ deniedAction: 'edit this Series' }).interrupts).toBe(true)
    expect(seriesFormState({ saveError: 'rejected' }).interrupts).toBe(true)
    expect(seriesFormState({ deleteDeniedAction: 'delete this Series' }).interrupts).toBe(true)

    expect(seriesFormState({ isSaving: true }).interrupts).toBe(false)
    expect(seriesFormState({ isDeleting: true }).interrupts).toBe(false)
    expect(seriesFormState({ isLoading: true }).interrupts).toBe(false)
    expect(seriesFormState({ isDirty: true, partCount: 1 }).interrupts).toBe(false)
    expect(seriesFormState({ partCount: 1, lastSavedLabel: 'just now' }).interrupts).toBe(false)
  })
})

/* -------------------------------------------------------------------------- */
/* Saving                                                                     */
/* -------------------------------------------------------------------------- */

describe('save gate', () => {
  const dirty = { title: 'Database Engineering', isDirty: true }

  it('saves a changed, titled Series', () => {
    const gate = seriesSaveGate(dirty)

    expect(gate.canSave).toBe(true)
    expect(gate.blockedReason).toBeNull()
    expect(gate.submitLabel).toBe('Save this Series')
  })

  it('refuses to write an unchanged Series, because saving replaces the order', () => {
    const gate = seriesSaveGate({ title: 'Database Engineering' })

    expect(gate.canSave).toBe(false)
    expect(gate.blockedReason).toBe('Nothing has changed yet.')
  })

  it('refuses a Series with no title, and says so', () => {
    const gate = seriesSaveGate({ title: '   ', isDirty: true })

    expect(gate.canSave).toBe(false)
    expect(gate.blockedReason).toContain('needs a title')
  })

  it('will not fire a second time while a save is in flight', () => {
    const gate = seriesSaveGate({ ...dirty, isSaving: true })

    expect(gate.canSave).toBe(false)
    // Not a blocked reason: nothing is wrong, the request is simply open, and
    // the button says so through `submittingLabel` instead of going dead.
    expect(gate.blockedReason).toBeNull()
    expect(gate.submittingLabel).toBe('Saving this Series')
  })

  it('will not save while the Series is loading or being deleted', () => {
    expect(seriesSaveGate({ ...dirty, isLoading: true }).blockedReason).toContain('still loading')
    expect(seriesSaveGate({ ...dirty, isDeleting: true }).blockedReason).toContain('being deleted')
  })

  it('reflects a refusal from the server above every other reason', () => {
    const gate = seriesSaveGate({
      title: '',
      isDirty: false,
      isLoading: true,
      deniedAction: 'edit this Series',
    })

    expect(gate.canSave).toBe(false)
    expect(gate.blockedReason).toBe('You do not have permission to edit this Series.')
  })
})

/* -------------------------------------------------------------------------- */
/* Deleting                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * `horizon-blog-dsv2.6.3` acceptance 3: destructive actions retain backend
 * authority. Expressed as a value - `reportsRemoved` - so it can be asserted
 * across every branch rather than reviewed by eye in a component.
 */
describe('delete state', () => {
  it('offers the confirmation and nothing else when idle', () => {
    const state = seriesDeleteState({})

    expect(state.status).toBe('idle')
    expect(state.showsConfirmation).toBe(false)
    expect(state.canRequestDelete).toBe(true)
    expect(state.canConfirmDelete).toBe(false)
  })

  it('opens the confirmation when the author asks', () => {
    const state = seriesDeleteState({ isConfirming: true })

    expect(state.status).toBe('confirming')
    expect(state.showsConfirmation).toBe(true)
    expect(state.canConfirmDelete).toBe(true)
  })

  it('never reports the Series as removed until the server says so', () => {
    const branches = [
      {},
      { isConfirming: true },
      { isConfirming: true, isDeleting: true },
      { isDeleting: true },
      { error: 'The server refused.' },
      { deniedAction: 'delete this Series' },
      { isConfirming: true, isDeleting: true, error: 'The server refused.' },
    ]

    for (const input of branches) {
      expect(seriesDeleteState(input).reportsRemoved, JSON.stringify(input)).toBe(false)
    }

    expect(seriesDeleteState({ deletedByServer: true }).reportsRemoved).toBe(true)
  })

  it('keeps the confirmation up while the request is open, and refuses a second press', () => {
    const state = seriesDeleteState({ isConfirming: true, isDeleting: true })

    expect(state.status).toBe('deleting')
    expect(state.showsConfirmation).toBe(true)
    expect(state.canConfirmDelete).toBe(false)
    expect(state.canRequestDelete).toBe(false)
    expect(state.message).toContain('until the server confirms it')
  })

  it('leaves the confirmation open on a failure, with the server reason', () => {
    const state = seriesDeleteState({ isConfirming: true, error: 'This Series is still in use.' })

    expect(state.status).toBe('failed')
    expect(state.showsConfirmation).toBe(true)
    expect(state.canConfirmDelete).toBe(true)
    expect(state.message).toBe('This Series is still in use.')
  })

  it('blocks the confirmation outright when the server refused the action', () => {
    const state = seriesDeleteState({ isConfirming: true, deniedAction: 'delete this Series' })

    expect(state.status).toBe('denied')
    expect(state.canConfirmDelete).toBe(false)
    expect(state.canRequestDelete).toBe(false)
    expect(state.message).toBe('You do not have permission to delete this Series.')
  })

  it('puts the server answer above a delete the browser still thinks is running', () => {
    expect(seriesDeleteState({ isDeleting: true, deletedByServer: true }).status).toBe('deleted')
    expect(seriesDeleteState({ deniedAction: 'delete this Series', isDeleting: true }).status).toBe(
      'denied',
    )
  })

  it('says what a deletion actually costs, and that the blogs survive it', () => {
    const copy = seriesDeleteCopy('Database Engineering')

    expect(copy.action).toBe('Delete this Series')
    expect(copy.subject).toBe('Database Engineering')
    expect(copy.consequence).toContain('blogs in it stay')
    expect(copy.isReversible).toBe(false)
  })

  it('still names something when the Series has no title yet', () => {
    expect(seriesDeleteCopy('   ').subject.trim().length).toBeGreaterThan(0)
  })
})

/* -------------------------------------------------------------------------- */
/* Adding a blog                                                              */
/* -------------------------------------------------------------------------- */

describe('addable blogs', () => {
  const assigned = new Map([
    ['11', 'series-7'],
    ['12', 'series-7'],
    ['13', 'series-7'],
    ['15', 'series-8'],
  ])

  it('does not offer a blog that is already in this Series', () => {
    const addable = addableBlogOptions({
      options,
      partIds: saved.partIds,
      assignedSeriesByPartId: assigned,
      seriesId: 'series-7',
    })

    expect(addable.map((option) => option.id)).toEqual(['14'])
  })

  it('does not offer a blog that belongs to another Series', () => {
    const addable = addableBlogOptions({
      options,
      partIds: [],
      assignedSeriesByPartId: assigned,
      seriesId: 'series-7',
    })

    expect(addable.map((option) => option.id)).not.toContain('15')
  })

  it('offers everything when nothing is assigned yet', () => {
    const addable = addableBlogOptions({ options, partIds: [], seriesId: 'series-7' })

    expect(addable).toHaveLength(options.length)
  })
})

describe('adding a blog', () => {
  const assigned = new Map([['15', 'series-8']])
  const base = {
    options,
    partIds: saved.partIds,
    assignedSeriesByPartId: assigned,
    seriesId: 'series-7',
  }

  it('appends to the end of the order, where a new part belongs', () => {
    const result = addBlogToSeries({ ...base, candidateId: '14' })

    expect(result.partIds).toEqual(['11', '12', '13', '14'])
    expect(result.rejection).toBeNull()
    expect(result.clearsSelection).toBe(true)
  })

  it('does nothing, and says nothing, when no blog is chosen', () => {
    const result = addBlogToSeries({ ...base, candidateId: '' })

    expect(result.partIds).toBe(base.partIds)
    expect(result.rejection).toBeNull()
    expect(result.clearsSelection).toBe(false)
  })

  it('refuses a duplicate by name, rather than silently doing nothing', () => {
    const result = addBlogToSeries({ ...base, candidateId: '12' })

    expect(result.partIds).toBe(base.partIds)
    expect(result.rejection).toBe('Checkpoints is already in this Series.')
    expect(result.clearsSelection).toBe(true)
  })

  it('refuses a blog another Series holds, and keeps it in the control', () => {
    const result = addBlogToSeries({ ...base, candidateId: '15' })

    expect(result.partIds).toBe(base.partIds)
    expect(result.rejection).toContain('already belongs to another Series')
    expect(result.clearsSelection).toBe(false)
  })

  it('accepts a blog this same Series is recorded against', () => {
    const result = addBlogToSeries({
      ...base,
      partIds: [],
      assignedSeriesByPartId: new Map([['14', 'series-7']]),
      candidateId: '14',
    })

    expect(result.partIds).toEqual(['14'])
    expect(result.rejection).toBeNull()
  })

  it("refuses an id that is not one of the author's own blogs", () => {
    const result = addBlogToSeries({ ...base, candidateId: '999' })

    expect(result.partIds).toBe(base.partIds)
    expect(result.rejection).toBe('Choose one of your own blogs.')
  })

  it('ignores the whitespace a select can hand back', () => {
    expect(addBlogToSeries({ ...base, candidateId: '  ' }).rejection).toBeNull()
    expect(addBlogToSeries({ ...base, candidateId: ' 14 ' }).partIds).toEqual([
      '11',
      '12',
      '13',
      '14',
    ])
  })
})

describe('add control state', () => {
  it('reaches every documented status', () => {
    expect(addBlogFieldState({ deniedAction: 'change this Series' }).status).toBe('denied')
    expect(addBlogFieldState({ isLoading: true }).status).toBe('loading')
    expect(addBlogFieldState({ error: 'Your blogs could not load.' }).status).toBe('failed')
    expect(addBlogFieldState({ addableCount: 0 }).status).toBe('empty')
    expect(addBlogFieldState({ addableCount: 2 }).status).toBe('ready')
  })

  it('explains every state it disables the control in', () => {
    const inputs = [
      { deniedAction: 'change this Series' },
      { isLoading: true },
      { error: 'Your blogs could not load.' },
      { addableCount: 0 },
      { addableCount: 2 },
    ]

    for (const input of inputs) {
      const state = addBlogFieldState(input)

      expect(state.label.trim().length, JSON.stringify(input)).toBeGreaterThan(0)
    }
  })

  it('only lets the author choose when there is something to choose', () => {
    expect(addBlogFieldState({ addableCount: 2 }).canChoose).toBe(true)
    expect(addBlogFieldState({ addableCount: 0 }).canChoose).toBe(false)
    expect(addBlogFieldState({ isLoading: true, addableCount: 2 }).canChoose).toBe(false)
    expect(addBlogFieldState({ error: 'failed', addableCount: 2 }).canChoose).toBe(false)
  })

  it('offers a retry only for the failure a retry could fix', () => {
    expect(addBlogFieldState({ error: 'Your blogs could not load.' }).canRetry).toBe(true)
    expect(addBlogFieldState({ addableCount: 0 }).canRetry).toBe(false)
    expect(addBlogFieldState({ deniedAction: 'change this Series' }).canRetry).toBe(false)
  })

  it('shows the loader rather than "nothing left to add" before the list arrives', () => {
    expect(addBlogFieldState({ isLoading: true, addableCount: 0 }).status).toBe('loading')
  })

  it('reflects a refusal above a failure and a loader', () => {
    const state = addBlogFieldState({
      deniedAction: 'change this Series',
      isLoading: true,
      error: 'failed',
    })

    expect(state.status).toBe('denied')
    expect(state.label).toBe('You do not have permission to change this Series.')
  })
})

/* -------------------------------------------------------------------------- */
/* Rows                                                                       */
/* -------------------------------------------------------------------------- */

describe('resolving rows', () => {
  it('keeps the order on screen, not the order of the options list', () => {
    const parts = resolveSeriesParts({ partIds: ['13', '11'], options })

    expect(parts.map((part) => part.id)).toEqual(['13', '11'])
    expect(parts.map((part) => part.title)).toEqual(['Recovery', 'Durability'])
  })

  it('carries the publication status the row badge shows', () => {
    expect(resolveSeriesParts({ partIds: ['13'], options })[0].status).toBe('draft')
  })

  it('keeps a row whose title has not loaded, rather than dropping it from the order', () => {
    const parts = resolveSeriesParts({ partIds: ['11', '99'], options })

    expect(parts).toHaveLength(2)
    expect(parts[1].title).toContain('99')
  })

  it('prefers what the Series itself reported over an invented title', () => {
    const parts = resolveSeriesParts({
      partIds: ['99'],
      options,
      fallbacks: [{ id: '99', title: 'Known from the Series', status: 'scheduled' }],
    })

    expect(parts[0]).toEqual({ id: '99', title: 'Known from the Series', status: 'scheduled' })
  })
})
