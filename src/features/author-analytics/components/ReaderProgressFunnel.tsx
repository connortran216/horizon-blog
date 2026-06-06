import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { AnalyticsFunnelStage } from '../author-analytics.types'
import { formatAnalyticsInteger, formatAnalyticsPercent } from '../author-analytics.format'
import { normalizeFunnelStages } from '../author-analytics.visualization'

interface ReaderProgressFunnelProps {
  stages: AnalyticsFunnelStage[]
}

const ReaderProgressFunnel = ({ stages }: ReaderProgressFunnelProps) => {
  const normalizedStages = normalizeFunnelStages(stages)

  return (
    <Box border="1px solid" borderColor="border.subtle" bg="bg.secondary" borderRadius="2xl" p={5}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontWeight="semibold" color="text.primary">
            Reading progress
          </Text>
          <Text fontSize="sm" color="text.secondary">
            Where readers tend to continue or drop off.
          </Text>
        </Box>

        <VStack align="stretch" spacing={3}>
          {normalizedStages.map((stage) => (
            <Box key={stage.label}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color="text.secondary">
                  {stage.label}
                </Text>
                <Text fontSize="sm" color="text.tertiary">
                  {formatAnalyticsInteger(stage.sessions)} sessions ·{' '}
                  {formatAnalyticsPercent(stage.rate)}
                </Text>
              </HStack>
              <Box h="10px" borderRadius="full" bg="bg.tertiary" overflow="hidden">
                <Box
                  h="100%"
                  w={`${stage.widthPercent}%`}
                  minW={stage.sessions > 0 ? '8px' : 0}
                  bg="action.primary"
                  borderRadius="full"
                />
              </Box>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  )
}

export default ReaderProgressFunnel
