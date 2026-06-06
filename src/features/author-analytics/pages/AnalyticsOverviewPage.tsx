import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'

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
import AnalyticsMetricCard from '../components/AnalyticsMetricCard'
import AnalyticsTrendChart from '../components/AnalyticsTrendChart'

const sortOptions: Array<{ label: string; value: AnalyticsPostSort }> = [
  { label: 'Views', value: 'views' },
  { label: 'Readers', value: 'unique_readers' },
  { label: 'Completion', value: 'completion_rate' },
  { label: 'Hearts', value: 'hearts_received' },
]

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
            </>
          ) : null}

          <Box
            border="1px solid"
            borderColor="border.subtle"
            bg="bg.secondary"
            borderRadius="2xl"
            p={5}
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'stretch', md: 'center' }}
              gap={4}
              mb={5}
            >
              <Box>
                <Heading size="md" color="text.primary">
                  Blog metrics
                </Heading>
                <Text color="text.secondary" fontSize="sm">
                  Sort and open a blog to inspect detailed diagnostics.
                </Text>
              </Box>
              <HStack flexWrap="wrap">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={sort === option.value ? 'solid' : 'ghost'}
                    bg={sort === option.value ? 'action.primary' : 'bg.tertiary'}
                    color={sort === option.value ? 'white' : 'text.secondary'}
                    _hover={{ bg: sort === option.value ? 'action.hover' : 'action.subtle' }}
                    onClick={() => updateSort(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </HStack>
            </Flex>

            {metrics.isLoading ? (
              <LoadingPanel label="Loading blog metrics" size="sm" minH="220px" />
            ) : metrics.error ? (
              <AnalyticsErrorPanel error={metrics.error} onRetry={metrics.refresh} />
            ) : metrics.data && metrics.data.posts.length > 0 ? (
              <VStack align="stretch" spacing={3}>
                {metrics.data.posts.map((blog) => (
                  <Flex
                    key={blog.postId}
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    gap={3}
                    borderRadius="xl"
                    bg="bg.tertiary"
                    p={4}
                  >
                    <Box>
                      <Text color="text.primary" fontWeight="semibold">
                        {blog.title}
                      </Text>
                      <Text color="text.tertiary" fontSize="sm">
                        {formatAnalyticsInteger(blog.views)} views ·{' '}
                        {
                          formatApproximateReaders(
                            blog.estimatedUniqueReaders,
                            blog.uniqueReadersApproximate,
                          ).value
                        }{' '}
                        readers · {formatAnalyticsPercent(blog.completionRate)} completion
                      </Text>
                    </Box>
                    <Button
                      as={RouterLink}
                      to={`/analytics/blog/${blog.postId}?${serializeAnalyticsRange(range).toString()}`}
                      size="sm"
                      variant="ghost"
                      color="action.primary"
                    >
                      View diagnostics
                    </Button>
                  </Flex>
                ))}
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
              <Text color="text.tertiary">No analytics data for this range yet.</Text>
            )}
          </Box>
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
