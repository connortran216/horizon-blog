import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { AnalyticsReactionTrendPoint } from '../author-analytics.types'
import { formatAnalyticsInteger } from '../author-analytics.format'

interface AnalyticsReactionTrendProps {
  points: AnalyticsReactionTrendPoint[]
}

const AnalyticsReactionTrend = ({ points }: AnalyticsReactionTrendProps) => {
  const totals = points.reduce(
    (sum, point) => ({
      added: sum.added + point.heartsAdded,
      removed: sum.removed + point.heartsRemoved,
    }),
    { added: 0, removed: 0 },
  )

  return (
    <Box border="1px solid" borderColor="border.subtle" bg="bg.secondary" borderRadius="2xl" p={5}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontWeight="semibold" color="text.primary">
            Reaction movement
          </Text>
          <Text fontSize="sm" color="text.secondary">
            Hearts added and removed during the selected range.
          </Text>
        </Box>

        <HStack spacing={4}>
          <ReactionTotal label="Added" value={totals.added} />
          <ReactionTotal label="Removed" value={totals.removed} />
        </HStack>

        <VStack align="stretch" spacing={2}>
          {points.slice(-7).map((point) => (
            <HStack key={point.date} justify="space-between" fontSize="sm">
              <Text color="text.secondary">{point.date}</Text>
              <Text color="text.tertiary">
                +{point.heartsAdded} / -{point.heartsRemoved}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Box>
  )
}

const ReactionTotal = ({ label, value }: { label: string; value: number }) => (
  <Box flex={1} borderRadius="xl" bg="bg.tertiary" p={4}>
    <Text fontSize="xs" color="text.tertiary" textTransform="uppercase" letterSpacing="0.08em">
      {label}
    </Text>
    <Text color="text.primary" fontSize="2xl" fontWeight="bold">
      {formatAnalyticsInteger(value)}
    </Text>
  </Box>
)

export default AnalyticsReactionTrend
