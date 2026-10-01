import { Box, Button, HStack, Text, Tooltip } from '@chakra-ui/react'

import { formatAnalyticsInteger, formatAnalyticsPercent } from '../author-analytics.format'
import { BlogMetricRow } from '../author-analytics.types'
import { getReachDepthPosition } from '../author-analytics.visualization'
import AnalyticsInfoTooltip from './AnalyticsInfoTooltip'

interface ReachDepthMapProps {
  blogs: BlogMetricRow[]
  selectedPostId: number
  onSelect: (postId: number) => void
}

const ReachDepthMap = ({ blogs, selectedPostId, onSelect }: ReachDepthMapProps) => {
  const maxViews = Math.max(0, ...blogs.map((blog) => blog.views))
  const maxReaders = Math.max(1, ...blogs.map((blog) => blog.estimatedUniqueReaders))

  return (
    <Box as="section" aria-labelledby="reach-depth-title">
      <HStack spacing={2} mb={4}>
        <Text id="reach-depth-title" fontWeight="semibold" color="text.primary">
          Reach × reading depth
        </Text>
        <AnalyticsInfoTooltip
          ariaLabel="About the reach and reading depth map"
          label="Further right means more views. Higher means a larger completion rate. Larger points indicate more estimated unique readers."
        />
      </HStack>

      <Box pl={{ base: 7, md: 10 }} pb={7} position="relative">
        <Text
          position="absolute"
          left={0}
          top="50%"
          transform="translate(-42%, -50%) rotate(-90deg)"
          fontSize="xs"
          color="text.muted"
          whiteSpace="nowrap"
        >
          Completion
        </Text>
        <Box
          role="group"
          aria-label="Blog reach and completion plot"
          position="relative"
          h={{ base: '300px', md: '390px' }}
          borderLeft="1px solid"
          borderBottom="1px solid"
          borderColor="border.subtle"
          bgImage="linear-gradient(to right, var(--chakra-colors-border-subtle) 1px, transparent 1px), linear-gradient(to bottom, var(--chakra-colors-border-subtle) 1px, transparent 1px)"
          bgSize="25% 25%"
          borderRadius="0 2xl 0 0"
        >
          {blogs.map((blog) => {
            const position = getReachDepthPosition(blog, maxViews)
            const size = 30 + Math.round((blog.estimatedUniqueReaders / maxReaders) * 22)
            const isSelected = blog.postId === selectedPostId
            const accessibleLabel = `${blog.title}: ${formatAnalyticsInteger(blog.views)} views, ${formatAnalyticsPercent(blog.completionRate)} completion`

            return (
              <Tooltip
                key={blog.postId}
                label={accessibleLabel}
                hasArrow
                bg="bg.elevated"
                color="text.primary"
                border="1px solid"
                borderColor="border.subtle"
              >
                <Button
                  position="absolute"
                  left={`${position.xPercent}%`}
                  top={`${position.yPercent}%`}
                  transform="translate(-50%, -50%)"
                  w={`${size}px`}
                  minW={`${size}px`}
                  h={`${size}px`}
                  p={0}
                  borderRadius="full"
                  bg={isSelected ? 'action.primary' : 'bg.elevated'}
                  color={isSelected ? 'white' : 'action.primary'}
                  border="2px solid"
                  borderColor="action.primary"
                  boxShadow={isSelected ? '0 0 0 5px var(--chakra-colors-action-subtle)' : 'md'}
                  aria-label={accessibleLabel}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(blog.postId)}
                  _hover={{
                    transform: 'translate(-50%, -50%) scale(1.08)',
                    bg: 'action.hover',
                    color: 'white',
                  }}
                  _focusVisible={{ boxShadow: '0 0 0 4px var(--chakra-colors-action-subtle)' }}
                  transition="transform 150ms ease, background 150ms ease"
                >
                  <Box as="span" w="6px" h="6px" borderRadius="full" bg="currentColor" />
                </Button>
              </Tooltip>
            )
          })}
        </Box>
        <Text
          position="absolute"
          bottom={0}
          left="50%"
          transform="translateX(-50%)"
          fontSize="xs"
          color="text.muted"
        >
          Views
        </Text>
      </Box>
    </Box>
  )
}

export default ReachDepthMap
