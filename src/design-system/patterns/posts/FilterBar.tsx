/**
 * Horizon Design System v2 - discovery controls.
 *
 * Search, sort, topic chips and the row of filters currently in force. It is
 * fully controlled: this pattern holds no state, so a page can drive it from a
 * query string and a back button lands the reader on the filters they left.
 *
 * The active-filter row is not decoration. A reader who has scrolled past the
 * topic chips has no other way to find out why the results look thin, and a
 * remove button labelled "x" tells a screen-reader user nothing about which
 * filter it removes - so every chip's remove control carries the filter's own
 * words. `discovery.logic.ts` builds those labels.
 */

import { forwardRef, type ChangeEvent, type ReactNode } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { FiSearch, FiX } from 'react-icons/fi'

import { space, transitionFor } from '../../../theme/tokens'
import { Button, IconButton } from '../../components/actions'
import { ErrorState, RetryAction, Skeleton } from '../../components/feedback'
import { Field, Input, Select } from '../../components/forms'
import { Chip } from '../../components/status'
import { Eyebrow } from '../../components/typography'
import {
  activeFilterChips,
  filterBarStatus,
  hasActiveFilters,
  type FilterState,
  type FilterTag,
} from './discovery.logic'

export interface FilterSortOption {
  readonly value: string
  readonly label: string
}

export interface FilterBarProps extends Omit<BoxProps, 'onChange' | 'children'> {
  state: FilterState
  /** The topics offered as chips. Usually the most-used tags. */
  tags: readonly FilterTag[]
  isLoading?: boolean
  /** Why the topic list could not be loaded. The chips are replaced, not hidden. */
  error?: string | null
  onRetry?: () => void
  onQueryChange: (query: string) => void
  onToggleTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onClearQuery: () => void
  onClearAll: () => void
  /** Omit to hide the search field entirely - an author archive, for instance. */
  searchLabel?: string
  searchPlaceholder?: string
  sortOptions?: readonly FilterSortOption[]
  sortValue?: string
  onSortChange?: (value: string) => void
  /** The result count line, when the page has one. */
  summary?: ReactNode
}

const SKELETON_CHIP_COUNT = 4

export const FilterBar = forwardRef<HTMLElement, FilterBarProps>(function FilterBar(
  {
    state,
    tags,
    isLoading = false,
    error = null,
    onRetry,
    onQueryChange,
    onToggleTag,
    onRemoveTag,
    onClearQuery,
    onClearAll,
    searchLabel = 'Search blogs',
    searchPlaceholder = 'Search a question, a topic, an idea',
    sortOptions,
    sortValue,
    onSortChange,
    summary,
    ...rest
  },
  ref,
) {
  const status = filterBarStatus({ isLoading, error, tagCount: tags.length })
  const chips = activeFilterChips(state)
  const showClearAll = hasActiveFilters(state)

  return (
    <Box
      ref={ref}
      /*
       * `role="search"` rather than the `search` element: React 18's JSX types
       * have no intrinsic for it, and a landmark that has to be cast into place
       * is a landmark waiting to be removed by the next refactor.
       */
      role="search"
      aria-label="Filter blogs"
      display="flex"
      flexDirection="column"
      gap={space[4]}
      {...rest}
    >
      <Box display="flex" flexWrap="wrap" gap={space[3]} alignItems="flex-end">
        <Box flex="1 1 260px" minW={0}>
          {/*
            The field says what it is before anything is typed: a search glyph
            at its start, decorative - the label names the control - and in
            the action colour while the field holds focus.
          */}
          <Box
            position="relative"
            sx={{
              '&:focus-within [data-search-glyph]': { color: 'action.primary' },
            }}
          >
            <Box
              data-search-glyph=""
              aria-hidden="true"
              position="absolute"
              insetInlineStart={space[4]}
              top="50%"
              transform="translateY(-50%)"
              display="flex"
              color="text.muted"
              pointerEvents="none"
              zIndex={1}
              transition={transitionFor('color', 'fast')}
            >
              <FiSearch />
            </Box>
            <Field label={searchLabel} labelHidden>
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={state.query}
                ps={space[12]}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onQueryChange(event.target.value)
                }
              />
            </Field>
          </Box>
        </Box>

        {sortOptions && sortOptions.length > 0 ? (
          <Box flex="0 1 200px">
            <Field label="Sort blogs" labelHidden>
              <Select
                value={sortValue}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onSortChange?.(event.target.value)
                }
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </Box>
        ) : null}
      </Box>

      <Box display="flex" flexDirection="column" gap={space[2]}>
        <Eyebrow as="p">Topics</Eyebrow>

        {status === 'error' ? (
          <ErrorState failedAction="load the topic list" align="start">
            {onRetry ? <RetryAction failedAction="load the topic list" onRetry={onRetry} /> : null}
          </ErrorState>
        ) : null}

        {status === 'loading' ? (
          <Box display="flex" flexWrap="wrap" gap={space[2]}>
            {Array.from({ length: SKELETON_CHIP_COUNT }, (_, index) => (
              <Skeleton
                key={`topic-skeleton-${index}`}
                shape={{ shape: 'block', height: 8, width: '88px' }}
                label={index === 0 ? 'the topic list' : undefined}
              />
            ))}
          </Box>
        ) : null}

        {status === 'ready' ? (
          <Box display="flex" flexWrap="wrap" gap={space[2]}>
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                isSelected={state.selectedTags.includes(tag.name)}
                onClick={() => onToggleTag(tag.name)}
              >
                {tag.name}
              </Chip>
            ))}
          </Box>
        ) : null}
      </Box>

      {chips.length > 0 ? (
        <Box display="flex" flexWrap="wrap" gap={space[2]} alignItems="center">
          <Eyebrow as="p">Active filters</Eyebrow>
          {chips.map((chip) => (
            <Box key={chip.key} display="inline-flex" alignItems="center" gap={space[1]}>
              <Chip>{chip.label}</Chip>
              <IconButton
                label={chip.removeLabel}
                icon={<FiX />}
                size="sm"
                onClick={() => (chip.kind === 'query' ? onClearQuery() : onRemoveTag(chip.value))}
              />
            </Box>
          ))}
          {showClearAll ? (
            <Button tone="link" size="sm" onClick={onClearAll}>
              Clear all filters
            </Button>
          ) : null}
        </Box>
      ) : null}

      {summary}
    </Box>
  )
})
