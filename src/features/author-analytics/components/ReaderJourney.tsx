import { Box, Flex, HStack, Stack, Text } from '@chakra-ui/react'

import { formatAnalyticsInteger, formatAnalyticsPercent } from '../author-analytics.format'
import { AnalyticsSummary } from '../author-analytics.types'
import { buildReaderJourney } from '../author-analytics.visualization'
import AnalyticsInfoTooltip from './AnalyticsInfoTooltip'

interface ReaderJourneyProps {
  summary: AnalyticsSummary
}

const definitions = {
  views: 'Every recorded blog open in the selected range.',
  readers: 'Estimated distinct readers. This may be approximate by analytics contract.',
  completed: 'Estimated views that reached the end, derived from views × completion rate.',
  actions:
    'Hearts received, shares, and link clicks added together. These are events, not unique readers.',
}

const ReaderJourney = ({ summary }: ReaderJourneyProps) => {
  const stages = buildReaderJourney(summary)

  return (
    <Box
      as="section"
      aria-labelledby="reader-journey-title"
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor="border.subtle"
      py={{ base: 6, md: 8 }}
    >
      <HStack spacing={2} mb={5}>
        <Text id="reader-journey-title" fontWeight="semibold" color="text.primary">
          Reader journey
        </Text>
        <AnalyticsInfoTooltip
          ariaLabel="About the reader journey"
          label="A directional view of reach, reading, and response. Actions are related events rather than a strict funnel step."
        />
      </HStack>

      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 3, md: 0 }} align="stretch">
        {stages.map((stage, index) => (
          <Flex key={stage.id} flex="1" align="center" minW={0}>
            <Box
              w="full"
              px={{ base: 0, md: 4 }}
              borderLeft={{ base: '2px solid', md: index === 0 ? 'none' : '1px solid' }}
              borderColor={{ base: 'action.primary', md: 'border.subtle' }}
              pl={{ base: 4, md: 4 }}
            >
              <HStack spacing={1}>
                <Text fontSize="sm" color="text.muted">
                  {stage.label}
                </Text>
                <AnalyticsInfoTooltip
                  ariaLabel={`About ${stage.label}`}
                  label={definitions[stage.id]}
                />
              </HStack>
              <Text
                color="text.primary"
                fontSize={{ base: '2xl', lg: '3xl' }}
                fontWeight="semibold"
              >
                {stage.approximate ? '~' : ''}
                {formatAnalyticsInteger(stage.value)}
              </Text>
              <Text color="text.muted" fontSize="xs" mt={1}>
                {stage.id === 'completed'
                  ? `${formatAnalyticsPercent(summary.completionRate)} completion`
                  : stage.id === 'actions'
                    ? 'event total'
                    : stage.id === 'readers' && stage.approximate
                      ? 'estimated'
                      : '\u00a0'}
              </Text>
            </Box>
          </Flex>
        ))}
      </Stack>
    </Box>
  )
}

export default ReaderJourney
