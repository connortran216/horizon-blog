/**
 * Horizon Design System v2 - paging through a listing.
 *
 * A `nav` landmark with its own accessible name, numbered buttons carrying
 * `aria-current="page"`, and a visible "Page 2 of 7".
 *
 * The visible range is deliberate here and deliberately absent on the Series
 * rail. A rail's arrows sit against the items they move, and the movement
 * itself says where you are; two arrows under a grid say nothing about how much
 * is left, and a reader who cannot see how many pages exist cannot decide
 * whether to keep going.
 *
 * Every control is a real `button` and the whole model - clamping, the window,
 * the gaps - is in `discovery.logic.ts`, so a `?page=999` in the address bar is
 * a solved problem rather than an empty grid.
 */

import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

import { space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { Text } from '../../components/typography'
import { pageButtonLabel, paginationModel, type PaginationInput } from './discovery.logic'

export interface PaginationProps extends Omit<BoxProps, 'onChange' | 'children'>, PaginationInput {
  onPageChange: (page: number) => void
  /** Landmark name. Set it when a page has two paginated lists. */
  label?: string
  /** Hide the numbered buttons, leaving only the two arrows and the range. */
  compact?: boolean
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    pageSize,
    totalItems,
    maxPageButtons,
    onPageChange,
    label = 'Blog pagination',
    compact = false,
    ...rest
  },
  ref,
) {
  const model = paginationModel({ page, pageSize, totalItems, maxPageButtons })

  // One page is not a pagination control; drawing two dead arrows under a short
  // list is furniture that costs two keyboard stops and communicates nothing.
  if (model.totalPages <= 1) {
    return null
  }

  return (
    <Box
      ref={ref}
      as="nav"
      aria-label={label}
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="center"
      gap={space[3]}
      {...rest}
    >
      <Button
        tone="quiet"
        size="sm"
        iconStart={<FiChevronLeft aria-hidden="true" />}
        isDisabled={!model.hasPrevious}
        onClick={() => onPageChange(model.previousPage)}
      >
        Previous
      </Button>

      {compact ? null : (
        <Box as="ol" display="flex" alignItems="center" gap={space[1]} listStyleType="none" m={0}>
          {model.entries.map((entry) =>
            entry.kind === 'gap' ? (
              <Box as="li" key={entry.key} paddingInline={space[1]} aria-hidden="true">
                <Text as="span" recipe="metadata">
                  …
                </Text>
              </Box>
            ) : (
              <Box as="li" key={`page-${entry.page}`}>
                <Button
                  tone={entry.isCurrent ? 'secondary' : 'quiet'}
                  size="sm"
                  aria-label={pageButtonLabel(entry.page, entry.isCurrent)}
                  aria-current={entry.isCurrent ? 'page' : undefined}
                  onClick={() => onPageChange(entry.page)}
                >
                  {entry.page}
                </Button>
              </Box>
            ),
          )}
        </Box>
      )}

      <Button
        tone="quiet"
        size="sm"
        iconEnd={<FiChevronRight aria-hidden="true" />}
        isDisabled={!model.hasNext}
        onClick={() => onPageChange(model.nextPage)}
      >
        Next
      </Button>

      <Text as="p" recipe="metadata" width="100%" textAlign="center" aria-label={model.srSummary}>
        {model.rangeLabel}
      </Text>
    </Box>
  )
})
