import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom'

import { LoadingPanel } from '../../../core'
import {
  formatAnalyticsDuration,
  formatAnalyticsInteger,
  formatAnalyticsPercent,
  formatApproximateReaders,
} from '../author-analytics.format'
import { parseAnalyticsRange, serializeAnalyticsRange } from '../author-analytics.range'
import { getAnalyticsErrorCopy } from '../author-analytics.visualization'
import { useBlogAnalytics } from '../useBlogAnalytics'
import AnalyticsDateRangeFilter from '../components/AnalyticsDateRangeFilter'
import AnalyticsInsightList from '../components/AnalyticsInsightList'
import AnalyticsMetricCard from '../components/AnalyticsMetricCard'
import AnalyticsReactionTrend from '../components/AnalyticsReactionTrend'
import LinkPerformanceTable from '../components/LinkPerformanceTable'
import ReaderProgressFunnel from '../components/ReaderProgressFunnel'
import TrafficSourceBreakdown from '../components/TrafficSourceBreakdown'

const BlogAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const postId = Number(id)
  const range = parseAnalyticsRange(searchParams)
  const analytics = useBlogAnalytics({
    postId: Number.isFinite(postId) ? postId : undefined,
    range,
  })

  const updateRange = (nextRange: typeof range) => {
    setSearchParams(serializeAnalyticsRange(nextRange))
  }

  const readers = analytics.data
    ? formatApproximateReaders(
        analytics.data.summary.estimatedUniqueReaders,
        analytics.data.summary.uniqueReadersApproximate,
      )
    : null

  return (
    <Box position="relative" pb={12} overflowX="hidden">
      <Box
        position="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '92%', md: '76%' }}
        h="260px"
        bg="action.glow"
        filter="blur(130px)"
        opacity={0.55}
        pointerEvents="none"
      />

      <Container maxW="container.xl" py={{ base: 8, md: 12 }} position="relative">
        <VStack align="stretch" spacing={{ base: 7, md: 9 }}>
          <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" spacing={5}>
            <Box>
              <Button
                as={RouterLink}
                to={`/analytics?${serializeAnalyticsRange(range).toString()}`}
                size="sm"
                variant="ghost"
                color="action.primary"
                mb={4}
              >
                Back to analytics
              </Button>
              <Badge bg="bg.tertiary" color="text.secondary" borderRadius="full" mb={3}>
                Blog diagnostics
              </Badge>
              <Heading color="text.primary" letterSpacing="-0.04em">
                {analytics.data?.post.title || 'Blog analytics'}
              </Heading>
              <Text color="text.secondary" mt={3} maxW="3xl" lineHeight="tall">
                Diagnose reader progress, reactions, links, and source quality for this blog.
              </Text>
            </Box>
            <Text color="text.tertiary" fontSize="sm">
              Fresh through {analytics.dataFreshThrough || 'loading'}
            </Text>
          </Stack>

          <AnalyticsDateRangeFilter range={range} onRangeChange={updateRange} />

          {analytics.isLoading ? (
            <LoadingPanel label="Loading blog analytics" description="Preparing diagnostics." />
          ) : analytics.error ? (
            <AnalyticsErrorPanel error={analytics.error} onRetry={analytics.refresh} />
          ) : analytics.data && readers ? (
            <>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
                <AnalyticsMetricCard
                  label="Views"
                  value={formatAnalyticsInteger(analytics.data.summary.views)}
                  helper="Total opens"
                />
                <AnalyticsMetricCard
                  label={readers.label}
                  value={readers.value}
                  helper="Approximate by contract"
                  approximate={readers.isApproximate}
                />
                <AnalyticsMetricCard
                  label="Completion"
                  value={formatAnalyticsPercent(analytics.data.summary.completionRate)}
                  helper="Readers reaching the end"
                />
                <AnalyticsMetricCard
                  label="Active read"
                  value={formatAnalyticsDuration(analytics.data.summary.avgActiveReadSeconds)}
                  helper="Average active reading"
                />
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
                <ReaderProgressFunnel stages={analytics.data.progressFunnel} />
                <AnalyticsReactionTrend points={analytics.data.reactionTrend} />
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
                <LinkPerformanceTable links={analytics.data.topLinks} />
                <TrafficSourceBreakdown sources={analytics.data.trafficSources} />
              </SimpleGrid>

              <AnalyticsInsightList insights={analytics.data.insights} title="Blog insights" />

              {analytics.isEmpty ? (
                <HStack
                  border="1px solid"
                  borderColor="border.subtle"
                  bg="bg.secondary"
                  borderRadius="2xl"
                  p={5}
                >
                  <Text color="text.secondary">
                    This blog has no measurable activity in the selected range yet.
                  </Text>
                </HStack>
              ) : null}
            </>
          ) : null}
        </VStack>
      </Container>
    </Box>
  )
}

const AnalyticsErrorPanel = ({
  error,
  onRetry,
}: {
  error: NonNullable<ReturnType<typeof useBlogAnalytics>['error']>
  onRetry: () => void
}) => {
  const copy = getAnalyticsErrorCopy(error)

  return (
    <Box border="1px solid" borderColor="border.subtle" bg="bg.secondary" borderRadius="2xl" p={6}>
      <Heading size="sm" color="text.primary">
        {copy.title}
      </Heading>
      <Text color="text.secondary" mt={2}>
        {copy.description}
      </Text>
      <Button mt={4} size="sm" variant="ghost" color="action.primary" onClick={onRetry}>
        Retry
      </Button>
    </Box>
  )
}

export default BlogAnalyticsPage
