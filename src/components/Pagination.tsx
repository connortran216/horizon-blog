import { HStack, Button, IconButton, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { MotionWrapper } from '../core'
import { usePagination } from '../hooks/usePagination'

interface PaginationProps {
  /** Callback when user changes page */
  onPageChange: (page: number) => void
  /** Current active page */
  currentPage: number
  /** Total number of items */
  totalCount: number
  /** Number of items per page */
  pageSize: number
  /** Number of page numbers to show on each side of current page */
  siblingCount?: number
}

const MotionButton = motion(Button)
const MotionIconButton = motion(IconButton)

export const Pagination: React.FC<PaginationProps> = ({
  onPageChange,
  currentPage,
  totalCount,
  pageSize,
  siblingCount = 1,
}) => {
  const totalPageCount = Math.ceil(totalCount / pageSize)
  const paginationRange = usePagination({
    totalCount,
    pageSize,
    siblingCount,
    currentPage,
  })

  // Calculate if we have previous/next pages
  const hasPreviousPage = currentPage > 1
  const hasNextPage = currentPage < totalPageCount

  // Motion variants for buttons
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.1 } },
    tap: { scale: 0.95, transition: { duration: 0.05 } },
  }

  // Handler for page change
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPageCount) {
      onPageChange(page)
    }
  }

  return (
    <MotionWrapper>
      <HStack spacing={2} justify="center" wrap="wrap">
        {/* Previous button */}
        <MotionIconButton
          aria-label="Previous page"
          icon={<FiChevronLeft />}
          size="md"
          variant="ghost"
          colorScheme="gray"
          isDisabled={!hasPreviousPage}
          onClick={() => handlePageChange(currentPage - 1)}
          variants={buttonVariants}
          whileHover={hasPreviousPage ? 'hover' : {}}
          whileTap={hasPreviousPage ? 'tap' : {}}
        />

        {/* Page numbers */}
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return (
              <Text key={`dots-${index}`} color="text.tertiary" fontSize="sm" userSelect="none">
                ...
              </Text>
            )
          }

          const pageNum = pageNumber as number
          const isCurrentPage = pageNum === currentPage

          return (
            <MotionButton
              key={pageNum}
              size="sm"
              variant={isCurrentPage ? 'solid' : 'ghost'}
              colorScheme="gray"
              bg={isCurrentPage ? 'accent.primary' : undefined}
              color={isCurrentPage ? 'white' : undefined}
              onClick={() => handlePageChange(pageNum)}
              variants={buttonVariants}
              whileHover={!isCurrentPage ? 'hover' : {}}
              whileTap={!isCurrentPage ? 'tap' : {}}
              initial={buttonVariants.initial}
            >
              {pageNum}
            </MotionButton>
          )
        })}

        {/* Next button */}
        <MotionIconButton
          aria-label="Next page"
          icon={<FiChevronRight />}
          size="md"
          variant="ghost"
          colorScheme="gray"
          isDisabled={!hasNextPage}
          onClick={() => handlePageChange(currentPage + 1)}
          variants={buttonVariants}
          whileHover={hasNextPage ? 'hover' : {}}
          whileTap={hasNextPage ? 'tap' : {}}
        />
      </HStack>
    </MotionWrapper>
  )
}
