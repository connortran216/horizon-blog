/**
 * Horizon Design System v2 - content-shaped loading.
 *
 * A skeleton is the only loading state that knows what is coming, so it is the
 * only one that can hold the final layout. Its dimensions come from the same
 * tokens the real content will use - see `Skeleton.logic.ts` - which is what
 * makes "nothing jumps when data lands" a derivation rather than a hope.
 *
 * The pulse is opacity only, and it is the one continuous animation the system
 * permits, because it is loading. Under reduced motion it does not run at all
 * and the skeleton is a still block.
 */

import { Box, type BoxProps } from '@chakra-ui/react'

import { componentTokens } from '../../../theme/tokens'
import { loadingPulseAnimation, useMotionPolicy } from '../../motion'
import { liveRegionFor } from './feedback.logic'
import { resolveSkeletonDimensions, type SkeletonShape } from './Skeleton.logic'

export type SkeletonProps = Omit<BoxProps, 'children' | 'width' | 'height'> & {
  shape: SkeletonShape
  /**
   * What the skeleton stands in for, e.g. "the article list". Announced once
   * by the region that owns the skeleton, so a screen reader is told the page
   * is busy instead of hearing nothing.
   */
  label?: string
}

export function Skeleton({ shape, label, ...rest }: SkeletonProps) {
  const policy = useMotionPolicy()
  const dimensions = resolveSkeletonDimensions(shape)
  const animation = loadingPulseAnimation(policy)

  const block = (key: string, width: string, height?: string | { base: string; sm: string }) => (
    <Box
      key={key}
      bg={componentTokens.feedback.skeletonBase}
      borderRadius={dimensions.borderRadius}
      width={width}
      height={height}
      aspectRatio={dimensions.aspectRatio}
      animation={animation}
    />
  )

  return (
    <Box
      {...(label ? liveRegionFor('loading') : { 'aria-hidden': true })}
      aria-label={label}
      display="flex"
      flexDirection="column"
      gap={dimensions.gap}
      width={dimensions.width}
      {...rest}
    >
      {dimensions.lines.length > 0
        ? dimensions.lines.map((line, index) => block(`line-${index}`, line.width, line.height))
        : block('body', '100%', dimensions.height)}
    </Box>
  )
}
