import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useSearchParams } from 'react-router-dom'

import PaginationControls from '../../../components/PaginationControls'
import { LoadingPanel } from '../../../core'
import {
  formatAnalyticsDuration,
  formatAnalyticsInteger,
  formatAnalyticsPercent,
  formatApproximateReaders,
} from '../author-analytics.format'
import { parseAnalyticsRange, serializeAnalyticsRange } from '../author-analytics.range'
import { AnalyticsPostSort, AnalyticsSortOrder } from '../author-analytics.types'
import { getAnalyticsErrorCopy } from '../author-analytics.visualization'
import { useAnalyticsOverview } from '../useAnalyticsOverview'
import { useBlogMetrics } from '../useBlogMetrics'
import AnalyticsDateRangeFilter from '../components/AnalyticsDateRangeFilter'
import AnalyticsInsightList from '../components/AnalyticsInsightList'
import AnalyticsMetricCard from '../components/AnalyticsMetricCard'
import AnalyticsTrendChart from '../components/AnalyticsTrendChart'
import BlogMetricsTable from '../components/BlogMetricsTable'

const pageSize = 10

const AnalyticsOverviewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const range = parseAnalyticsRange(searchParams)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const sort = parseSort(searchParams.get('sort'))
  const order = parseOrder(searchParams.get('order'))
  const overview = useAnalyticsOverview({ range })
  const metrics = useBlogMetrics({ range, sort, order, page, limit: pageSize })

  const updateRange = (nextRange: typeof range) => {
    const next = serializeAnalyticsRange(nextRange)
    next.set('sort', sort)
    next.set('order', order)
    next.set('page', '1')
    setSearchParams(next)
  }

  const updateSort = (nextSort: AnalyticsPostSort) => {
    const next = serializeAnalyticsRange(range)
    next.set('sort', nextSort)
    next.set('order', nextSort === sort && order === 'desc' ? 'asc' : 'desc')
    next.set('page', '1')
    setSearchParams(next)
  }

  const updatePage = (nextPage: number) => {
    const next = serializeAnalyticsRange(range)
    next.set('sort', sort)
    next.set('order', order)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  const readers = overview.data
    ? formatApproximateReaders(
        overview.data.summary.estimatedUniqueReaders,
        overview.data.summary.uniqueReadersApproximate,
      )
    : null
  const totalPages = metrics.data ? Math.ceil(metrics.data.total / metrics.data.limit) : 1

  return (
    <Box position="relative" pb={12} overflowX="hidden">
      <Box
        position="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '92%', md: '76%' }}
        h="280px"
        bg="action.glow"
        filter="blur(130px)"
        opacity={0.6}
        pointerEvents="none"
      />

      <Container maxW="container.xl" py={{ base: 8, md: 12 }} position="relative">
        <VStack align="stretch" spacing={{ base: 7, md: 9 }}>
          <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" spacing={5}>
            <Box>
              <Badge bg="bg.tertiary" color="text.secondary" borderRadius="full" mb={3}>
                Owner analytics
              </Badge>
              <Heading color="text.primary" letterSpacing="-0.04em">
                Understand how your writing is read.
              </Heading>
              <Text color="text.secondary" mt={3} maxW="3xl" lineHeight="tall">
                Track reach, engagement, completion, and freshness without turning your writing
                workspace into a heavy dashboard.
              </Text>
            </Box>
            <Text color="text.tertiary" fontSize="sm">
              Fresh through {overview.dataFreshThrough || metrics.dataFreshThrough || 'loading'}
            </Text>
          </Stack>

          <AnalyticsDateRangeFilter range={range} onRangeChange={updateRange} />

          {overview.isLoading ? (
            <LoadingPanel label="Loading analytics" description="Preparing your overview." />
          ) : overview.error ? (
            <AnalyticsErrorPanel error={overview.error} onRetry={overview.refresh} />
          ) : overview.data && readers ? (
            <>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
                <AnalyticsMetricCard
                  label="Views"
                  value={formatAnalyticsInteger(overview.data.summary.views)}
                  helper="Total blog opens"
                />
                <AnalyticsMetricCard
                  label={readers.label}
                  value={readers.value}
                  helper="Backend HyperLogLog estimate"
                  approximate={readers.isApproximate}
                />
                <AnalyticsMetricCard
                  label="Completion"
                  value={formatAnalyticsPercent(overview.data.summary.completionRate)}
                  helper="Readers reaching the end"
                />
                <AnalyticsMetricCard
                  label="Active read"
                  value={formatAnalyticsDuration(overview.data.summary.avgActiveReadSeconds)}
                  helper="Average active reading time"
                />
              </SimpleGrid>

              <AnalyticsTrendChart title="Views trend" points={overview.data.trend} />
              <AnalyticsInsightList insights={overview.data.insights} title="Overview insights" />
            </>
          ) : null}

          {metrics.isLoading ? (
            <LoadingPanel label="Loading blog metrics" size="sm" minH="220px" />
          ) : metrics.error ? (
            <AnalyticsErrorPanel error={metrics.error} onRetry={metrics.refresh} />
          ) : metrics.data && metrics.data.posts.length > 0 ? (
            <VStack align="stretch" spacing={3}>
              <BlogMetricsTable
                blogs={metrics.data.posts}
                range={range}
                sort={sort}
                order={order}
                onSortChange={updateSort}
              />
              <PaginationControls
                currentPage={page}
                totalPages={Math.max(1, totalPages)}
                totalCount={metrics.data.total}
                pageSize={metrics.data.limit}
                onPageChange={updatePage}
                showOnlyWhenMultiple
              />
            </VStack>
          ) : (
            <Box
              border="1px solid"
              borderColor="border.subtle"
              bg="bg.secondary"
              borderRadius="2xl"
              p={5}
            >
              <Text color="text.tertiary">No analytics data for this range yet.</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

const AnalyticsErrorPanel = ({
  error,
  onRetry,
}: {
  error: NonNullable<ReturnType<typeof useAnalyticsOverview>['error']>
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

const parseSort = (value: string | null): AnalyticsPostSort => {
  if (
    value === 'unique_readers' ||
    value === 'hearts_received' ||
    value === 'shares' ||
    value === 'completion_rate' ||
    value === 'avg_active_read_seconds' ||
    value === 'link_clicks'
  ) {
    return value
  }

  return 'views'
}

const parseOrder = (value: string | null): AnalyticsSortOrder => (value === 'asc' ? 'asc' : 'desc')

export default AnalyticsOverviewPage
