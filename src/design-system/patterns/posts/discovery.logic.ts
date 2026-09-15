/**
 * Horizon Design System v2 - post discovery decisions.
 *
 * The filter bar and the pagination control share one property: everything they
 * do is arithmetic and copy, and none of it needs a DOM. Clamping a page number
 * that arrived from a query string, deciding whether a filter row is empty or
 * merely loading, and pluralising a result count are all things that break
 * quietly and are cheap to prove here.
 */

import { pluralise } from './content.logic'

/* -------------------------------------------------------------------------- */
/* Filters                                                                    */
/* -------------------------------------------------------------------------- */

export interface FilterTag {
  readonly id: string
  readonly name: string
  /** How many posts carry the tag, when the API supplies it. */
  readonly count?: number | null
}

export interface FilterState {
  readonly query: string
  readonly selectedTags: readonly string[]
}

export const emptyFilterState: FilterState = { query: '', selectedTags: [] }

export function hasActiveFilters(state: FilterState): boolean {
  return state.query.trim().length > 0 || state.selectedTags.length > 0
}

/**
 * Toggle a tag, preserving the order the reader selected them in.
 *
 * Order matters more than it looks: the active-filter row is rendered from this
 * array, and re-sorting it on every toggle makes chips jump under the pointer
 * that is about to remove one.
 */
export function toggleTag(state: FilterState, tag: string): FilterState {
  const name = tag.trim()

  if (name.length === 0) {
    return state
  }

  const selected = state.selectedTags.includes(name)

  return {
    ...state,
    selectedTags: selected
      ? state.selectedTags.filter((item) => item !== name)
      : [...state.selectedTags, name],
  }
}

export function removeFilterTag(state: FilterState, tag: string): FilterState {
  return { ...state, selectedTags: state.selectedTags.filter((item) => item !== tag) }
}

export function clearQuery(state: FilterState): FilterState {
  return { ...state, query: '' }
}

export function clearAllFilters(): FilterState {
  return emptyFilterState
}

export type ActiveFilterKind = 'query' | 'tag'

export interface ActiveFilterChip {
  readonly key: string
  readonly kind: ActiveFilterKind
  readonly label: string
  /** The value the caller passes back to `removeFilterTag` / `clearQuery`. */
  readonly value: string
  /** Accessible name of the chip's remove button. Never a bare "x". */
  readonly removeLabel: string
}

/**
 * The chips describing what is currently filtering the list.
 *
 * The search term comes first because it is the strongest filter and the one a
 * reader is most likely to have forgotten about after scrolling.
 */
export function activeFilterChips(state: FilterState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []
  const query = state.query.trim()

  if (query.length > 0) {
    chips.push({
      key: 'query',
      kind: 'query',
      label: `Search: ${query}`,
      value: query,
      removeLabel: `Clear the search for ${query}`,
    })
  }

  for (const tag of state.selectedTags) {
    chips.push({
      key: `tag:${tag}`,
      kind: 'tag',
      label: `#${tag}`,
      value: tag,
      removeLabel: `Remove the ${tag} topic filter`,
    })
  }

  return chips
}

export type FilterBarStatus = 'loading' | 'error' | 'empty' | 'ready'

export interface FilterBarStatusInput {
  readonly isLoading?: boolean
  readonly error?: string | null
  readonly tagCount: number
}

/**
 * Loading beats error beats empty.
 *
 * A refetch after a failure is loading, not still failing - keeping the error
 * visible while a retry is in flight is what makes a retry button feel dead.
 */
export function filterBarStatus({
  isLoading = false,
  error = null,
  tagCount,
}: FilterBarStatusInput): FilterBarStatus {
  if (isLoading) {
    return 'loading'
  }

  if (error) {
    return 'error'
  }

  return tagCount > 0 ? 'ready' : 'empty'
}

/**
 * The result count line: `13 blogs for "dns"`.
 *
 * `null` while loading, because a stale count next to a spinner is a lie the
 * reader has no way to detect. The zero case is not handled here - it is an
 * `EmptyState`, which names the next valid action, and a bare "0 blogs" does
 * not.
 */
export function filterResultSummary(
  state: FilterState,
  resultCount: number | null,
  isLoading = false,
): string | null {
  if (isLoading || resultCount == null || resultCount <= 0) {
    return null
  }

  const count = pluralise(resultCount, 'blog')
  const query = state.query.trim()

  return query.length > 0 ? `${count} for “${query}”` : count
}

/** The sentence an `EmptyState` shows when the filters match nothing. */
export function noResultsNextAction(state: FilterState): string {
  return hasActiveFilters(state)
    ? 'Try a broader phrase, or clear the topic filters.'
    : 'New writing appears here as it is published.'
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

export interface PaginationInput {
  /** One-based, and trusted from a query string, so it is clamped. */
  readonly page: number
  readonly pageSize: number
  readonly totalItems: number
  /** Numbered buttons drawn before gaps appear. Minimum 5. */
  readonly maxPageButtons?: number
}

export type PaginationEntry =
  | { readonly kind: 'page'; readonly page: number; readonly isCurrent: boolean }
  | { readonly kind: 'gap'; readonly key: string }

export interface PaginationModel {
  readonly page: number
  readonly totalPages: number
  readonly hasPrevious: boolean
  readonly hasNext: boolean
  readonly previousPage: number
  readonly nextPage: number
  readonly entries: readonly PaginationEntry[]
  /** `Page 2 of 7`. Visible: two arrows alone do not say where you are. */
  readonly rangeLabel: string
  /** `Showing 7 to 12 of 61 blogs`, for the navigation's accessible name. */
  readonly srSummary: string
  readonly isEmpty: boolean
}

const MIN_PAGE_BUTTONS = 5

/**
 * The pagination model.
 *
 * Everything here is defensive because the page number arrives from a URL a
 * reader can edit: `?page=0`, `?page=999` and `?page=abc` all have to resolve
 * to a page that exists rather than to an empty grid with no way back.
 *
 * Unlike the Series rail, this control does show its position in words. The
 * rail's arrows sit beside the items they move and the movement itself carries
 * the meaning; two pagination arrows at the foot of a grid do not, and "Page 2
 * of 7" is the only thing that tells a reader there is a page 7 at all.
 */
export function paginationModel({
  page,
  pageSize,
  totalItems,
  maxPageButtons = 7,
}: PaginationInput): PaginationModel {
  const size = Math.max(1, Math.floor(pageSize))
  const total = Math.max(0, Math.floor(totalItems))
  const totalPages = Math.max(1, Math.ceil(total / size))
  const requested = Number.isFinite(page) ? Math.floor(page) : 1
  const current = Math.min(Math.max(1, requested), totalPages)
  const buttons = Math.max(MIN_PAGE_BUTTONS, Math.floor(maxPageButtons))

  const firstItem = total === 0 ? 0 : (current - 1) * size + 1
  const lastItem = Math.min(current * size, total)

  return {
    page: current,
    totalPages,
    hasPrevious: current > 1,
    hasNext: current < totalPages,
    previousPage: Math.max(1, current - 1),
    nextPage: Math.min(totalPages, current + 1),
    entries: pageEntries(current, totalPages, buttons),
    rangeLabel: `Page ${current} of ${totalPages}`,
    srSummary:
      total === 0
        ? 'No blogs to page through'
        : `Showing ${firstItem} to ${lastItem} of ${pluralise(total, 'blog')}`,
    isEmpty: total === 0,
  }
}

/**
 * Numbered entries with gaps.
 *
 * The first and last page are always reachable in one press - they are the two
 * a reader actually asks for - and the window slides around the current page in
 * between. A gap is only emitted where it replaces more than one page number,
 * because an ellipsis standing in for a single page costs a press and saves
 * nothing.
 */
function pageEntries(current: number, totalPages: number, buttons: number): PaginationEntry[] {
  const asEntry = (page: number): PaginationEntry => ({
    kind: 'page',
    page,
    isCurrent: page === current,
  })

  if (totalPages <= buttons) {
    return Array.from({ length: totalPages }, (_, index) => asEntry(index + 1))
  }

  // One slot each for the first page, the last page and the two gaps.
  const windowSize = buttons - 4
  const half = Math.floor(windowSize / 2)
  let start = Math.min(Math.max(2, current - half), totalPages - windowSize)
  start = Math.max(2, start)
  const end = Math.min(totalPages - 1, start + windowSize - 1)

  const entries: PaginationEntry[] = [asEntry(1)]

  if (start > 2) {
    entries.push({ kind: 'gap', key: 'gap-start' })
  }

  for (let page = start; page <= end; page += 1) {
    entries.push(asEntry(page))
  }

  if (end < totalPages - 1) {
    entries.push({ kind: 'gap', key: 'gap-end' })
  }

  entries.push(asEntry(totalPages))

  return entries
}

/** Accessible name for a numbered button. `2` alone is not a destination. */
export function pageButtonLabel(page: number, isCurrent: boolean): string {
  return isCurrent ? `Page ${page}, current page` : `Go to page ${page}`
}

/* -------------------------------------------------------------------------- */
/* Moving the reader to the new page                                          */
/* -------------------------------------------------------------------------- */

/**
 * Pressing "Next" replaces the whole list under a viewport that does not move,
 * so a reader who was halfway down page one lands halfway down page two with
 * nothing saying anything changed. Putting the top of the list back on screen
 * is half the fix; the other half is focus, because a keyboard reader who was
 * on the "Next" button is still on it, at the bottom of content they have not
 * seen.
 *
 * Both halves are one decision and they live here rather than at four call
 * sites - blog, author archive, Series index and the three profile tabs - none
 * of which implemented either half.
 */

/**
 * The part of an element this move touches, typed structurally so a test can
 * hand in a plain object and assert the order and the arguments without a DOM.
 */
export interface PagedRegionElement {
  hasAttribute(name: string): boolean
  setAttribute(name: string, value: string): void
  scrollIntoView(options: { block: 'start'; behavior: 'auto' | 'smooth' }): void
  focus(options: { preventScroll: boolean }): void
  readonly style: { scrollMarginBlockStart: string }
}

export interface PagedRegionMove {
  /** `auto` under reduced motion: the distance is the same, the travel is not. */
  readonly behavior: 'auto' | 'smooth'
  /** Clearance above the region, so the floating header does not cover it. */
  readonly scrollMargin: string
}

/**
 * Whether a press actually changed the page.
 *
 * The numbered buttons call `onPageChange` for the current page too, and moving
 * the viewport for a press that changed nothing is a jump with no cause.
 */
export function pagingMovesReader(fromPage: number, toPage: number): boolean {
  return Number.isFinite(fromPage) && Number.isFinite(toPage) && fromPage !== toPage
}

/**
 * Smooth scrolling is movement, so it stops under reduced motion - the same
 * rule `railScrollBehavior` applies to the Series rail, and the reason neither
 * reads the media query itself.
 */
export function pagingScrollBehavior(policy: { reduced: boolean }): 'auto' | 'smooth' {
  return policy.reduced ? 'auto' : 'smooth'
}

/**
 * Put the top of the paged region on screen and give it focus.
 *
 * `tabindex="-1"` is written rather than required of the caller, and only when
 * the element does not already carry one, so a region that is genuinely
 * focusable keeps its own value and a plain container becomes a focus
 * destination without the page having to remember. `preventScroll` stops the
 * browser's own focus scroll from racing the smooth one and landing the region
 * at the top of the window underneath the header.
 */
export function movePagedRegionIntoView(
  element: PagedRegionElement | null | undefined,
  { behavior, scrollMargin }: PagedRegionMove,
): boolean {
  if (!element) {
    return false
  }

  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1')
  }

  element.style.scrollMarginBlockStart = scrollMargin
  element.scrollIntoView({ block: 'start', behavior })
  element.focus({ preventScroll: true })

  return true
}
