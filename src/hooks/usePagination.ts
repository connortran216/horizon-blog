import { useMemo } from 'react'

/**
 * Pagination hook that calculates page numbers array using sliding window algorithm
 * Returns an array of page numbers and '...' strings
 */
export const usePagination = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}: {
  /** Total number of items */
  totalCount: number
  /** Number of items per page */
  pageSize: number
  /** Number of page numbers to show on each side of current page */
  siblingCount?: number
  /** Current active page */
  currentPage: number
}): (number | string)[] => {
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize)

    // Critical fix: Return [1] if only one page
    if (totalPageCount === 1) {
      return [1]
    }

    // If total pages is small, show all pages
    const totalPageNumbers = siblingCount * 2 + 3 // siblings + current + first/last

    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1

    const firstPageIndex = 1
    const lastPageIndex = totalPageCount

    // Case 1: Dots on both sides (current page in middle)
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex]
    }

    // Case 2: Dots only on left (current page near end)
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const middleRange = range(totalPageCount - 2, totalPageCount)
      return [firstPageIndex, '...', ...middleRange]
    }

    // Case 3: Dots only on right (current page near start)
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(1, 3)
      return [...middleRange, '...', lastPageIndex]
    }

    // Fallback: should not reach here
    return range(1, totalPageCount)
  }, [totalCount, pageSize, siblingCount, currentPage])

  return paginationRange
}

/**
 * Helper function to create a range of numbers
 */
function range(start: number, end: number): number[] {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}
