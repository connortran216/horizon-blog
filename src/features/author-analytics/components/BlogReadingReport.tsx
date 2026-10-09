import { Box, Flex, Grid } from '@chakra-ui/react'
import { Heading, Stack, Text } from '../../../design-system'
import { formatAnalyticsInteger, formatAnalyticsPercent } from '../author-analytics.format'
import { readingObservation, completionPercent } from '../author-analytics.report'
import { BlogAnalyticsDetail } from '../author-analytics.types'
import AnalyticsReportSection from './AnalyticsReportSection'
import ReadingRetentionChart from './ReadingRetentionChart'
import AnalyticsInsightList from './AnalyticsInsightList'
import LinkPerformanceTable from './LinkPerformanceTable'

export default function BlogReadingReport({ analytics }: { analytics: BlogAnalyticsDetail }) {
  const observation = readingObservation(analytics.progressFunnel)
  const sources = [...analytics.trafficSources].sort((a, b) => b.views - a.views)
  const sourceViews = sources.reduce((total, source) => total + Math.max(0, source.views), 0)
  const added = analytics.reactionTrend.reduce((total, point) => total + point.heartsAdded, 0)
  const removed = analytics.reactionTrend.reduce((total, point) => total + point.heartsRemoved, 0)
  return (
    <Stack gap={8}>
      <AnalyticsReportSection
        number="01"
        title="Where reading stops"
        detail="Reading progression through this blog, measured in sessions."
      >
        <Grid
          templateColumns={{ base: '1fr', lg: '240px minmax(0, 1fr)' }}
          gap={8}
          alignItems="center"
        >
          <Box>
            {observation ? (
              <>
                <Heading as="h3" recipe="sectionTitle">
                  {formatAnalyticsInteger(observation.reached)} of{' '}
                  {formatAnalyticsInteger(observation.opened)}
                </Heading>
                <Text recipe="body" mt={2}>
                  sessions reached 25%
                </Text>
                <Text recipe="body" mt={6}>
                  {formatAnalyticsInteger(observation.notReached)} of{' '}
                  {formatAnalyticsInteger(observation.opened)} sessions did not reach 25%.
                </Text>
                <Text recipe="metadata" mt={2}>
                  Observed progress, not a reason for leaving.
                </Text>
              </>
            ) : (
              <Text recipe="body">
                An early-reading comparison needs both opened and 25% progress measurements.
              </Text>
            )}
          </Box>
          <ReadingRetentionChart stages={analytics.progressFunnel} />
        </Grid>
      </AnalyticsReportSection>
      <AnalyticsReportSection
        number="02"
        title="Traffic sources"
        detail="Share of attributed views for this blog in the selected range."
      >
        {sourceViews === 0 ? (
          <Text recipe="body">No attributed views in this range.</Text>
        ) : (
          <Stack gap={4}>
            {sources.map((source) => {
              const share = source.views / sourceViews
              return (
                <Grid
                  key={`${source.category}:${source.host}`}
                  templateColumns={{
                    base: 'minmax(0, 1fr) auto',
                    md: 'minmax(160px, 1fr) 64px minmax(120px, 2fr) 56px',
                  }}
                  gap={4}
                  alignItems="center"
                >
                  <Box>
                    <Text recipe="body" overflowWrap="anywhere">
                      {source.host || 'Direct / unknown'}
                    </Text>
                    <Text recipe="metadata">{source.category}</Text>
                  </Box>
                  <Text recipe="body" textAlign="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatAnalyticsInteger(source.views)}
                    <Text as="span" display={{ base: 'inline', md: 'none' }}>
                      {' '}
                      views
                    </Text>
                  </Text>
                  <Box h="6px" bg="bg.subtle" borderRadius="full" aria-hidden="true">
                    <Box
                      w={`${completionPercent(share)}%`}
                      h="full"
                      bg="action.primary"
                      borderRadius="full"
                    />
                  </Box>
                  <Text recipe="metadata" textAlign="right">
                    {formatAnalyticsPercent(share)}
                  </Text>
                </Grid>
              )
            })}
          </Stack>
        )}
        <Text recipe="metadata">Percentages describe the source mix, not reading completion.</Text>
      </AnalyticsReportSection>
      <AnalyticsReportSection
        number="03"
        title="Reader actions"
        detail="Events recorded in the selected range, not unique people."
      >
        <Flex gap={5} wrap="wrap">
          <Text recipe="body">
            {formatAnalyticsInteger(analytics.summary.linkClicks)} link clicks
          </Text>
          <Text recipe="body">
            {formatAnalyticsInteger(analytics.summary.heartsReceived)} hearts received
          </Text>
          <Text recipe="body">{formatAnalyticsInteger(analytics.summary.shares)} shares</Text>
        </Flex>
        <Box as="details">
          <Box as="summary" py={2} color="text.secondary" cursor="pointer">
            Link and reaction details
          </Box>
          <Stack gap={4} pt={4}>
            <Text recipe="metadata">
              {formatAnalyticsInteger(added)} hearts added · {formatAnalyticsInteger(removed)}{' '}
              removed during this range
            </Text>
            <LinkPerformanceTable links={analytics.topLinks} />
          </Stack>
        </Box>
      </AnalyticsReportSection>
      {analytics.insights.length > 0 && (
        <Box as="details" borderTop="1px solid" borderColor="border.subtle" pt={4}>
          <Box as="summary" py={2} color="text.secondary" cursor="pointer">
            Insights and supporting evidence
          </Box>
          <AnalyticsInsightList insights={analytics.insights} />
        </Box>
      )}
    </Stack>
  )
}
