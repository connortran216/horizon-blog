import { describe, expect, it } from 'vitest'

import {
  activeFilterChips,
  clearAllFilters,
  clearQuery,
  emptyFilterState,
  filterBarStatus,
  filterResultSummary,
  hasActiveFilters,
  noResultsNextAction,
  pageButtonLabel,
  paginationModel,
  removeFilterTag,
  toggleTag,
} from './discovery.logic'

describe('filter state', () => {
  it('starts with nothing selected', () => {
    expect(hasActiveFilters(emptyFilterState)).toBe(false)
  })

  it('treats a whitespace query as no query', () => {
    expect(hasActiveFilters({ query: '   ', selectedTags: [] })).toBe(false)
  })

  it('adds and removes a topic without reordering the others', () => {
    const withTwo = toggleTag(toggleTag(emptyFilterState, 'python'), 'kafka')

    expect(withTwo.selectedTags).toEqual(['python', 'kafka'])
    expect(toggleTag(withTwo, 'python').selectedTags).toEqual(['kafka'])
  })

  it('ignores a blank topic', () => {
    expect(toggleTag(emptyFilterState, '  ')).toBe(emptyFilterState)
  })

  it('clears one filter at a time and all of them at once', () => {
    const state = { query: 'dns', selectedTags: ['python', 'kafka'] }

    expect(clearQuery(state).selectedTags).toEqual(['python', 'kafka'])
    expect(removeFilterTag(state, 'python').selectedTags).toEqual(['kafka'])
    expect(clearAllFilters()).toEqual(emptyFilterState)
  })
})

describe('activeFilterChips', () => {
  it('puts the search term first, because it is the strongest filter', () => {
    const chips = activeFilterChips({ query: 'dns', selectedTags: ['python'] })

    expect(chips.map((chip) => chip.kind)).toEqual(['query', 'tag'])
  })

  it('names what each remove button removes, never a bare x', () => {
    const chips = activeFilterChips({ query: 'dns', selectedTags: ['python'] })

    expect(chips[0].removeLabel).toBe('Clear the search for dns')
    expect(chips[1].removeLabel).toBe('Remove the python topic filter')
  })

  it('is empty when nothing is filtering', () => {
    expect(activeFilterChips(emptyFilterState)).toEqual([])
  })
})

describe('filterBarStatus', () => {
  it('shows loading even when the previous attempt failed', () => {
    expect(filterBarStatus({ isLoading: true, error: 'boom', tagCount: 0 })).toBe('loading')
  })

  it('shows the failure once the retry is no longer in flight', () => {
    expect(filterBarStatus({ error: 'boom', tagCount: 0 })).toBe('error')
  })

  it('separates a loaded-but-empty topic list from a loaded one', () => {
    expect(filterBarStatus({ tagCount: 0 })).toBe('empty')
    expect(filterBarStatus({ tagCount: 3 })).toBe('ready')
  })
})

describe('filterResultSummary', () => {
  it('quotes the search term in the count', () => {
    expect(filterResultSummary({ query: 'dns', selectedTags: [] }, 13)).toBe('13 blogs for “dns”')
  })

  it('pluralises the count', () => {
    expect(filterResultSummary(emptyFilterState, 1)).toBe('1 blog')
  })

  it('says nothing while loading, rather than showing a stale count', () => {
    expect(filterResultSummary(emptyFilterState, 13, true)).toBeNull()
  })

  it('leaves the zero case to an empty state that names the next action', () => {
    expect(filterResultSummary(emptyFilterState, 0)).toBeNull()
    expect(noResultsNextAction({ query: 'dns', selectedTags: [] })).toContain('clear')
    expect(noResultsNextAction(emptyFilterState)).toContain('published')
  })
})

describe('paginationModel', () => {
  it('clamps a page number that arrived from an edited query string', () => {
    expect(paginationModel({ page: 0, pageSize: 6, totalItems: 30 }).page).toBe(1)
    expect(paginationModel({ page: 999, pageSize: 6, totalItems: 30 }).page).toBe(5)
    expect(paginationModel({ page: Number.NaN, pageSize: 6, totalItems: 30 }).page).toBe(1)
  })

  it('never reports fewer than one page, even with no results', () => {
    const model = paginationModel({ page: 1, pageSize: 6, totalItems: 0 })

    expect(model.totalPages).toBe(1)
    expect(model.isEmpty).toBe(true)
    expect(model.srSummary).toBe('No blogs to page through')
  })

  it('survives a nonsense page size', () => {
    expect(paginationModel({ page: 1, pageSize: 0, totalItems: 3 }).totalPages).toBe(3)
  })

  it('knows where the ends are', () => {
    const first = paginationModel({ page: 1, pageSize: 10, totalItems: 45 })
    const last = paginationModel({ page: 5, pageSize: 10, totalItems: 45 })

    expect(first.hasPrevious).toBe(false)
    expect(first.hasNext).toBe(true)
    expect(first.previousPage).toBe(1)
    expect(last.hasNext).toBe(false)
    expect(last.nextPage).toBe(5)
  })

  it('shows every page while they fit', () => {
    const model = paginationModel({ page: 2, pageSize: 10, totalItems: 45, maxPageButtons: 7 })

    expect(model.entries.map((entry) => (entry.kind === 'page' ? entry.page : '…'))).toEqual([
      1, 2, 3, 4, 5,
    ])
  })

  it('keeps the first and last page one press away once gaps appear', () => {
    const model = paginationModel({ page: 10, pageSize: 10, totalItems: 200, maxPageButtons: 7 })
    const shown = model.entries.map((entry) => (entry.kind === 'page' ? entry.page : '…'))

    expect(shown[0]).toBe(1)
    expect(shown[shown.length - 1]).toBe(20)
    expect(shown).toContain('…')
    expect(shown).toContain(10)
  })

  it('never emits a gap that stands in for a single page', () => {
    const model = paginationModel({ page: 2, pageSize: 10, totalItems: 200, maxPageButtons: 7 })
    const shown = model.entries.map((entry) => (entry.kind === 'page' ? entry.page : '…'))

    expect(shown.slice(0, 2)).toEqual([1, 2])
  })

  it('marks exactly one entry as current', () => {
    const model = paginationModel({ page: 3, pageSize: 10, totalItems: 200 })
    const current = model.entries.filter((entry) => entry.kind === 'page' && entry.isCurrent)

    expect(current).toHaveLength(1)
  })

  it('shows the reader where they are in words', () => {
    const model = paginationModel({ page: 2, pageSize: 6, totalItems: 61 })

    expect(model.rangeLabel).toBe('Page 2 of 11')
    expect(model.srSummary).toBe('Showing 7 to 12 of 61 blogs')
  })

  it('caps the last item at the total on a short final page', () => {
    expect(paginationModel({ page: 11, pageSize: 6, totalItems: 61 }).srSummary).toBe(
      'Showing 61 to 61 of 61 blogs',
    )
  })
})

describe('pageButtonLabel', () => {
  it('turns a bare number into a destination', () => {
    expect(pageButtonLabel(2, false)).toBe('Go to page 2')
    expect(pageButtonLabel(2, true)).toBe('Page 2, current page')
  })
})
