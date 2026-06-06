import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { AnalyticsTrafficSourceMetric } from '../author-analytics.types'
import {
  formatAnalyticsDuration,
  formatAnalyticsInteger,
  formatAnalyticsPercent,
} from '../author-analytics.format'

interface TrafficSourceBreakdownProps {
  sources: AnalyticsTrafficSourceMetric[]
}

const TrafficSourceBreakdown = ({ sources }: TrafficSourceBreakdownProps) => {
  return (
    <Box border="1px solid" borderColor="border.subtle" bg="bg.secondary" borderRadius="2xl" p={5}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontWeight="semibold" color="text.primary">
            Traffic sources
          </Text>
          <Text fontSize="sm" color="text.secondary">
            Where readers came from and how deeply they read.
          </Text>
        </Box>

        {sources.length === 0 ? (
          <Text color="text.tertiary" fontSize="sm">
            No source data in this range.
          </Text>
        ) : (
          sources.map((source) => (
            <Box key={`${source.category}:${source.host}`} borderRadius="xl" bg="bg.tertiary" p={4}>
              <HStack justify="space-between" align="start">
                <Box>
                  <Text color="text.primary" fontWeight="medium">
                    {source.category}
                  </Text>
                  <Text color="text.tertiary" fontSize="sm">
                    {source.host || 'Direct or unknown'}
                  </Text>
                </Box>
                <Text color="text.primary" fontWeight="semibold">
                  {formatAnalyticsInteger(source.views)}
                </Text>
              </HStack>
              <Text mt={2} color="text.tertiary" fontSize="sm">
                {formatAnalyticsPercent(source.completionRate)} completion ·{' '}
                {formatAnalyticsDuration(source.avgActiveReadSeconds)} active read
              </Text>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  )
}

export default TrafficSourceBreakdown
