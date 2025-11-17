import React from 'react'
import { Box, VStack, HStack, SimpleGrid } from '@chakra-ui/react'
import { motion } from 'framer-motion'

/**
 * Shimmer Loading Components
 * Creates elegant skeleton loading states with animated gradients
 */

interface ShimmerProps {
  /** Width variant for different skeleton sizes */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Number of lines for multi-line skeletons */
  lines?: number
  /** Custom height override */
  height?: string | number
  /** Custom width override */
  width?: string | number
  /** Border radius */
  borderRadius?: string | number
}

// Enhanced single shimmer with gradient animation
export const Shimmer: React.FC<ShimmerProps> = ({
  size = 'md',
  lines = 1,
  height,
  borderRadius = 'md',
}) => {
  // Size configurations
  const heights = {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  }

  const skeletonHeight = height || heights[size]

  // Animated gradient for shimmer effect
  const shimmerVariants = {
    initial: { backgroundPosition: '-200px 0' },
    animate: {
      backgroundPosition: '200px 0',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
  }

  const ShimmerLine = ({
    width = '100%',
    delay = 0,
  }: {
    width?: string | number
    delay?: number
  }) => (
    <motion.div
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
      style={{
        width,
        height: skeletonHeight,
        borderRadius,
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f7fafc 50%, #e2e8f0 75%)',
        backgroundSize: '200px 100%',
      }}
      transition={{
        delay,
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut',
      }}
    />
  )

  if (lines === 1) {
    return <ShimmerLine />
  }

  return (
    <VStack spacing={2} align="stretch" width="100%">
      {Array.from({ length: lines }, (_, i) => (
        <ShimmerLine key={i} width={i === lines - 1 ? '60%' : '100%'} delay={i * 0.1} />
      ))}
    </VStack>
  )
}

// Blog post card skeleton loader
export const BlogCardSkeleton = () => (
  <Box
    maxW="100%"
    bg="white"
    boxShadow="xl"
    rounded="md"
    overflow="hidden"
    borderWidth="1px"
    borderColor="gray.200"
    p={6}
  >
    {/* Image placeholder */}
    <Shimmer height="200px" borderRadius="md" />

    <VStack spacing={3} align="stretch" mt={4}>
      {/* Status tag */}
      <Shimmer size="xs" width="60px" />

      {/* Title */}
      <VStack spacing={2} align="stretch">
        <Shimmer height="24px" width="90%" />
        <Shimmer height="24px" width="70%" />
      </VStack>

      {/* Content */}
      <VStack spacing={2} align="stretch" mt={2}>
        <Shimmer height="16px" />
        <Shimmer height="16px" width="85%" />
        <Shimmer height="16px" width="60%" />
      </VStack>

      {/* Meta info */}
      <HStack spacing={4}>
        <HStack spacing={2}>
          <Shimmer width="20px" height="20px" borderRadius="full" />
          <Shimmer size="sm" width="80px" />
        </HStack>
        <Shimmer size="sm" width="60px" />
      </HStack>

      {/* Button */}
      <Shimmer height="32px" width="100px" borderRadius="full" />
    </VStack>
  </Box>
)

// Blog list skeleton loader
export const BlogListSkeleton = ({ count = 6 }: { count?: number }) => (
  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} width="100%">
    {Array.from({ length: count }, (_, i) => (
      <BlogCardSkeleton key={i} />
    ))}
  </SimpleGrid>
)

// Compact horizontal blog cards for trending/featured sections
export const CompactBlogSkeleton = () => (
  <HStack align="start" spacing={4} p={4} borderBottom="1px" borderColor="gray.200">
    <Shimmer width="48px" height="48px" borderRadius="full" />
    <Box flex="1">
      <VStack spacing={1} align="stretch">
        <Shimmer height="16px" width="120px" />
        <Shimmer height="14px" width="200px" />
        <Shimmer height="12px" width="80px" />
      </VStack>
    </Box>
  </HStack>
)

// Article content skeleton loader
export const ArticleSkeleton = () => (
  <VStack spacing={6} align="stretch">
    {/* Title */}
    <VStack spacing={2} align="stretch">
      <Shimmer height="40px" width="80%" />
      <Shimmer height="40px" width="60%" />
    </VStack>

    {/* Meta info */}
    <HStack spacing={4}>
      <Shimmer width="40px" height="40px" borderRadius="full" />
      <VStack spacing={1} align="stretch">
        <Shimmer height="16px" width="100px" />
        <Shimmer height="14px" width="120px" />
      </VStack>
    </HStack>

    {/* Content blocks */}
    <VStack spacing={4} align="stretch">
      <Shimmer height="20px" width="100%" />
      <Shimmer height="20px" width="95%" />
      <Shimmer height="20px" width="85%" />
      <Shimmer height="20px" width="100%" />
      <Shimmer height="20px" width="70%" />
    </VStack>

    <VStack spacing={4} align="stretch">
      <Shimmer height="16px" width="90%" />
      <Shimmer height="16px" width="100%" />
      <Shimmer height="16px" width="75%" />
      <Shimmer height="16px" width="85%" />
      <Shimmer height="16px" width="40%" />
    </VStack>

    <VStack spacing={4} align="stretch">
      <Shimmer height="18px" width="100%" />
      <Shimmer height="18px" width="88%" />
      <Shimmer height="18px" width="92%" />
    </VStack>
  </VStack>
)

// Generic loading state with different variants
export const ShimmerLoader = ({
  variant = 'blog',
  count = 6,
}: {
  variant?: 'blog' | 'list' | 'article' | 'compact'
  count?: number
}) => {
  switch (variant) {
    case 'article':
      return <ArticleSkeleton />
    case 'compact':
      return <CompactBlogSkeleton />
    case 'list':
      return <BlogListSkeleton count={count} />
    case 'blog':
    default:
      return <BlogListSkeleton count={count} />
  }
}

// Fade-in wrapper for loading states
export const FadeInShimmer = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    {children}
  </motion.div>
)

export default ShimmerLoader
