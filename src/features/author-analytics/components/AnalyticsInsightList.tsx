import { Badge, Box, HStack, List, ListItem, Text, VStack } from '@chakra-ui/react'

import { AnalyticsInsight } from '../author-analytics.types'
import { formatInsightEvidence } from '../author-analytics.visualization'

interface AnalyticsInsightListProps {
  insights: AnalyticsInsight[]
  title?: string
}

const AnalyticsInsightList = ({ insights, title = 'Insights' }: AnalyticsInsightListProps) => {
  return (
    <Box border="1px solid" borderColor="border.subtle" bg="bg.secondary" borderRadius="2xl" p={5}>
      <HStack justify="space-between" align="start" mb={4}>
        <Box>
          <Text color="text.primary" fontWeight="semibold">
            {title}
          </Text>
          <Text color="text.secondary" fontSize="sm">
            Evidence-backed notes from the backend contract.
          </Text>
        </Box>
        <Badge bg="bg.tertiary" color="text.secondary" borderRadius="full">
          Cautious
        </Badge>
      </HStack>

      {insights.length === 0 ? (
        <Text color="text.tertiary" fontSize="sm">
          No qualifying insights for this range yet.
        </Text>
      ) : (
        <VStack as={List} align="stretch" spacing={4}>
          {insights.map((insight) => {
            const evidence = formatInsightEvidence(insight)

            return (
              <ListItem key={insight.code} borderRadius="xl" bg="bg.tertiary" p={4}>
                <Text color="text.primary" fontWeight="medium">
                  {insight.message}
                </Text>
                <Text color="text.tertiary" fontSize="sm" mt={1}>
                  {evidence.sampleLabel}
                </Text>
                {evidence.evidenceLabels.length > 0 ? (
                  <VStack align="stretch" spacing={1} mt={3}>
                    {evidence.evidenceLabels.map((label) => (
                      <Text key={label} color="text.secondary" fontSize="sm">
                        {label}
                      </Text>
                    ))}
                  </VStack>
                ) : null}
              </ListItem>
            )
          })}
        </VStack>
      )}
    </Box>
  )
}

export default AnalyticsInsightList
