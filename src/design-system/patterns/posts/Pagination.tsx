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
 *
 * Changing the page also moves the reader. That belongs here and not at the
 * call sites: the page change is this control's own event, the three decisions
 * it needs - where to go, how to travel, where focus lands - are the same
 * wherever it is used, and the four call sites that were free to implement it
 * themselves all implemented none of it. `regionRef` is required rather than
 * optional so a fifth call site cannot quietly inherit the old behaviour; the
 * arithmetic is in `movePagedRegionIntoView`.
 */

import { forwardRef, type RefObject } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

import { space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { Text } from '../../components/typography'
import { useMotionPolicy } from '../../motion'
import {
  movePagedRegionIntoView,
  pageButtonLabel,
  paginationModel,
  pagingMovesReader,
  pagingScrollBehavior,
  type PaginationInput,
} from './discovery.logic'

/**
 * Clearance above the region when it is scrolled into view.
 *
 * The site header floats over the content at up to 72px, so a region parked
 * exactly at the top of the viewport starts underneath it. `space[16]` is the
 * same clearance `Prose` gives a deep-linked heading, for the same reason.
 */
const REGION_SCROLL_MARGIN = space[16]

export interface PaginationProps extends Omit<BoxProps, 'onChange' | 'children'>, PaginationInput {
  onPageChange: (page: number) => void
  /**
   * The region this control pages - the block that holds the list, not the
   * list itself, because a list is usually replaced by skeletons while the
   * next page loads and a focus destination must survive that swap.
   *
   * On a page change its top is scrolled into view and it receives focus, so
   * the next `Tab` continues from the new content rather than from the button
   * that was just pressed at the bottom of content nobody has seen.
   */
  regionRef: RefObject<HTMLElement | null>
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
    itemNoun,
    onPageChange,
    regionRef,
    label = 'Blog pagination',
    compact = false,
    ...rest
  },
  ref,
) {
  const policy = useMotionPolicy()
  const model = paginationModel({ page, pageSize, totalItems, maxPageButtons, itemNoun })

  /*
   * The move is made from the press, synchronously, rather than from an effect
   * watching `page`.
   *
   * Three of the four call sites hide this control while the next page loads
   * (`{loading ? null : <Pagination/>}`), so the component that would run the
   * effect is unmounted before the new page arrives and remounted with no
   * memory that anything was pressed. The press is the only moment that is
   * guaranteed to happen, and it is also the only one that means "the reader
   * asked for this": someone arriving on `?page=3` from the address bar or the
   * back button has not asked to be scrolled anywhere.
   *
   * Measuring the region before the re-render is safe because only its height
   * changes - the list is replaced by skeletons of its own shape - and because
   * the browser's scroll anchoring compensates for anything that appears or
   * disappears above it, which on the blog archive is the Series shelf that page
   * two drops. Measured on `/blog` at 1440: 2400px -> 540px, the region's top
   * 64px below the viewport's, with the shelf unmounting mid-travel.
   */
  const goToPage = (nextPage: number) => {
    const moves = pagingMovesReader(model.page, nextPage)

    onPageChange(nextPage)

    if (moves) {
      movePagedRegionIntoView(regionRef.current, {
        behavior: pagingScrollBehavior(policy),
        scrollMargin: REGION_SCROLL_MARGIN,
      })
    }
  }

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
        onClick={() => goToPage(model.previousPage)}
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
                  onClick={() => goToPage(entry.page)}
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
        onClick={() => goToPage(model.nextPage)}
      >
        Next
      </Button>

      <Text as="p" recipe="metadata" width="100%" textAlign="center" aria-label={model.srSummary}>
        {model.rangeLabel}
      </Text>
    </Box>
  )
})
