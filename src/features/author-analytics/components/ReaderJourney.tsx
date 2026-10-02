import { Box, Flex, Grid, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import { FiArrowDown, FiArrowRight } from 'react-icons/fi'

import { formatAnalyticsInteger, formatAnalyticsPercent } from '../author-analytics.format'
import { AnalyticsSummary } from '../author-analytics.types'
import { AnalyticsJourneyStage, buildReaderJourney } from '../author-analytics.visualization'
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
      py={{ base: 5, md: 6 }}
    >
      <HStack spacing={2} mb={{ base: 5, md: 4 }}>
        <Heading
          as="h2"
          id="reader-journey-title"
          color="text.primary"
          fontSize="md"
          lineHeight="short"
        >
          Reader journey
        </Heading>
        <AnalyticsInfoTooltip
          ariaLabel="About the reader journey"
          label="A directional view of reach, reading, and response. Actions are related events rather than a strict funnel step."
        />
      </HStack>

      <Stack display={{ base: 'flex', md: 'none' }} spacing={0}>
        {stages.map((stage, index) => (
          <Grid key={stage.id} templateColumns="28px minmax(0, 1fr)" columnGap={4}>
            <Flex direction="column" align="center" aria-hidden="true">
              <JourneyNode filled={index < 2} prominent={index === 0} />
              {index < stages.length - 1 ? (
                <Flex direction="column" align="center" flex="1" minH="44px">
                  <Box w="1px" flex="1" bg="action.primary" />
                  <Icon as={FiArrowDown} boxSize={4} color="action.primary" />
                </Flex>
              ) : null}
            </Flex>
            <Box pb={index < stages.length - 1 ? 4 : 0}>
              <JourneyStageContent stage={stage} summary={summary} />
            </Box>
          </Grid>
        ))}
      </Stack>

      <Box display={{ base: 'none', md: 'block' }} overflowX="auto" pb={1}>
        <Grid templateColumns="repeat(4, minmax(160px, 1fr))" minW="720px">
          {stages.map((stage, index) => (
            <Box key={stage.id} minW={0}>
              <JourneyStageLabel stage={stage} />
              <HStack spacing={0} mt={3} aria-hidden="true">
                <JourneyNode filled={index < 2} prominent={index === 0} />
                {index < stages.length - 1 ? (
                  <Flex flex="1" align="center" pr={2}>
                    <Box h="1px" flex="1" bg="action.primary" />
                    <Icon as={FiArrowRight} boxSize={4} color="action.primary" ml={-1} />
                  </Flex>
                ) : null}
              </HStack>
              <JourneyStageValue stage={stage} summary={summary} />
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

const JourneyNode = ({ filled, prominent }: { filled: boolean; prominent: boolean }) => (
  <Box
    flex="0 0 auto"
    w={prominent ? '28px' : '22px'}
    h={prominent ? '28px' : '22px'}
    borderRadius="full"
    border="3px solid"
    borderColor="action.primary"
    bg={filled ? 'action.primary' : 'bg.page'}
    boxShadow={filled ? '0 0 0 5px var(--chakra-colors-action-subtle)' : 'none'}
  />
)

const JourneyStageContent = ({
  stage,
  summary,
}: {
  stage: AnalyticsJourneyStage
  summary: AnalyticsSummary
}) => (
  <Box minW={0}>
    <JourneyStageLabel stage={stage} />
    <JourneyStageValue stage={stage} summary={summary} />
  </Box>
)

const JourneyStageLabel = ({ stage }: { stage: AnalyticsJourneyStage }) => (
  <HStack spacing={1} minH="32px">
    <Heading as="h3" color="text.secondary" fontSize="sm" fontWeight="semibold">
      {stage.label}
    </Heading>
    <AnalyticsInfoTooltip ariaLabel={`About ${stage.label}`} label={definitions[stage.id]} />
  </HStack>
)

const JourneyStageValue = ({
  stage,
  summary,
}: {
  stage: AnalyticsJourneyStage
  summary: AnalyticsSummary
}) => (
  <Box mt={{ base: 1, md: 2 }}>
    <Text
      color="text.primary"
      fontSize={{ base: '2xl', lg: '3xl' }}
      fontWeight="semibold"
      lineHeight="short"
      sx={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {stage.approximate ? '~' : ''}
      {formatAnalyticsInteger(stage.value)}
    </Text>
    <Text color="text.muted" fontSize="xs" mt={1} minH="18px">
      {getJourneyDetail(stage, summary)}
    </Text>
  </Box>
)

const getJourneyDetail = (stage: AnalyticsJourneyStage, summary: AnalyticsSummary) => {
  if (stage.id === 'completed')
    return `${formatAnalyticsPercent(summary.completionRate)} completion`
  if (stage.id === 'actions') return 'event total'
  if (stage.id === 'readers' && stage.approximate) return 'estimated'
  return '\u00a0'
}

export default ReaderJourney
