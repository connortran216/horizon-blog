import React, { useState } from 'react'
import { HStack, Input, InputGroup, InputRightElement, Text, IconButton } from '@chakra-ui/react'
import { MotionWrapper, AnimatedPrimaryButton, FocusRing } from '../core'
import { usePagination } from '../hooks/usePagination'
import { ChevronLeftIcon, ChevronRightIcon, ArrowForwardIcon } from '@chakra-ui/icons'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  textColor?: string
  showOnlyWhenMultiple?: boolean
  siblingCount?: number
}

const PaginationControls = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  showOnlyWhenMultiple = true,
  siblingCount = 1,
}: PaginationControlsProps) => {
  // Single Responsibility: Only render pagination controls when conditions are met
  if (showOnlyWhenMultiple && totalPages <= 1) {
    return null
  }

  const paginationRange = usePagination({
    totalCount,
    pageSize,
    currentPage,
    siblingCount,
  })

  const handlePrevious = () => {
    const newPage = Math.max(1, currentPage - 1)
    if (newPage !== currentPage) {
      onPageChange(newPage)
    }
  }

  const handleNext = () => {
    const newPage = Math.min(totalPages, currentPage + 1)
    if (newPage !== currentPage) {
      onPageChange(newPage)
    }
  }

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page)
    }
  }

  const [jumpValue, setJumpValue] = useState('')

  const handleJumpSubmit = () => {
    const pageNum = parseInt(jumpValue, 10)
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum)
      setJumpValue('')
    }
  }

  const handleJumpKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpSubmit()
    }
  }

  return (
    <MotionWrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      duration={0.6}
      delay={0.8}
    >
      {/* Centered Navigation Controls */}
      <HStack spacing={1} justify="center">
        {/* Previous Button */}
        <FocusRing>
          <AnimatedPrimaryButton
            onClick={handlePrevious}
            isDisabled={currentPage === 1}
            variant="outline"
            size="sm"
            p={2}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </AnimatedPrimaryButton>
        </FocusRing>

        {/* Page Numbers */}
        {paginationRange.map((page, index) => {
          if (page === '...') {
            return (
              <MotionWrapper
                key={`dots-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                duration={0.3}
                delay={index * 0.05}
              >
                <Text px={3} py={2} color="gray.500" pointerEvents="none" fontSize="sm">
                  ...
                </Text>
              </MotionWrapper>
            )
          }

          const isActive = page === currentPage
          return (
            <MotionWrapper
              key={`page-${page}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              duration={0.3}
              delay={index * 0.05}
            >
              <FocusRing>
                <AnimatedPrimaryButton
                  onClick={() => handlePageClick(page)}
                  colorScheme={isActive ? 'purple' : undefined}
                  variant={isActive ? 'solid' : 'outline'}
                  size="sm"
                  px={3}
                  py={2}
                  isDisabled={isActive}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </AnimatedPrimaryButton>
              </FocusRing>
            </MotionWrapper>
          )
        })}

        {/* Next Button */}
        <FocusRing>
          <AnimatedPrimaryButton
            onClick={handleNext}
            isDisabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            p={2}
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </AnimatedPrimaryButton>
        </FocusRing>

        {/* Jump to Page Input */}
        <MotionWrapper
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          duration={0.4}
          delay={0.8}
        >
          <InputGroup size="sm" ml={4} width="140px">
            <Input
              placeholder="Go to page"
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyPress={handleJumpKeyPress}
              type="number"
              min={1}
              max={totalPages}
              bg="background.secondary"
              borderRadius="md"
              _hover={{ borderColor: 'accent.primary' }}
              _focus={{ borderColor: 'accent.primary', boxShadow: '0 0 0 1px purple.500' }}
              size="sm"
            />
            <InputRightElement>
              <IconButton
                aria-label="Go to page"
                icon={<ArrowForwardIcon />}
                size="sm"
                variant="ghost"
                onClick={handleJumpSubmit}
                _hover={{ bg: 'accent.primary', color: 'white' }}
                borderRadius="md"
                h="full"
              />
            </InputRightElement>
          </InputGroup>
        </MotionWrapper>
      </HStack>

      {/* Metadata */}
      <MotionWrapper
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        duration={0.4}
        delay={1}
      >
        <Text textAlign="center" fontSize="sm" color="text.secondary" mt={2}>
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to{' '}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
        </Text>
      </MotionWrapper>
    </MotionWrapper>
  )
}

export default PaginationControls
