/**
 * Author analytics overview - migrated onto Horizon Design System v2.
 *
 * The summary row, the trend, the insights and the blog table each carry
 * their own loading, denied, error and empty state rather than one gate for
 * the whole page: the trend can be ready while the paginated table below it
 * is still loading its own page, and both remain independently true when one
 * of the two requests is denied and the other is not.
 */

import { useSearchParams } from 'react-router-dom'

import {
  ContentContainer,
  Eyebrow,
  Heading,
  Section,
  Stack,
  Text,
  Typeset,
} from '../../../design-system'
import { formatFreshThrough } from '../author-analytics.format'
import PaginationControls from '../../../components/PaginationControls'
import { analyticsPanelAccess } from '../author-analytics.hook-state'
import { parseAnalyticsRange, serializeAnalyticsRange } from '../author-analytics.range'
import {
  AnalyticsDateRange,
  AnalyticsPostSort,
  AnalyticsSortOrder,
} from '../author-analytics.types'
import { useAnalyticsOverview } from '../useAnalyticsOverview'
import { useBlogMetrics } from '../useBlogMetrics'
import AnalyticsDateRangeFilter from '../components/AnalyticsDateRangeFilter'
import AnalyticsInsightList from '../components/AnalyticsInsightList'
import AnalyticsTrendChart from '../components/AnalyticsTrendChart'
import { AnalyticsSummaryMetrics } from '../components/AnalyticsSummaryMetrics'
import BlogMetricsTable from '../components/BlogMetricsTable'

const PAGE_SIZE = 10

const AnalyticsOverviewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const range = parseAnalyticsRange(searchParams)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const sort = parseSort(searchParams.get('sort'))
  const order = parseOrder(searchParams.get('order'))
  const overview = useAnalyticsOverview({ range })
  const metrics = useBlogMetrics({ range, sort, order, page, limit: PAGE_SIZE })

  const updateRange = (nextRange: AnalyticsDateRange) => {
    const next = serializeAnalyticsRange(nextRange)
    next.set('sort', sort)
    next.set('order', order)
    next.set('page', '1')
    setSearchParams(next)
  }

  const updateSort = (nextSort: AnalyticsPostSort, nextOrder: AnalyticsSortOrder) => {
    const next = serializeAnalyticsRange(range)
    next.set('sort', nextSort)
    next.set('order', nextOrder)
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

  const overviewAccess = analyticsPanelAccess(overview.error, 'view your analytics')
  const metricsAccess = analyticsPanelAccess(metrics.error, 'view your blog comparison')
  const totalPages = metrics.data ? Math.ceil(metrics.data.total / metrics.data.limit) : 1
  const freshThrough = overview.dataFreshThrough ?? metrics.dataFreshThrough

  return (
    <ContentContainer>
      {/*
        A reading report, not a dashboard: the title on the display face, the
        period it covers stated under it, then the figures on one rule, the
        trend, the notes and the comparison - each opened on a hairline rather
        than boxed.
      */}
      <Section>
        <Stack gap={12}>
          <Stack as="header" gap={6} maxW="4xl">
            <Eyebrow as="p">Owner analytics</Eyebrow>
            <Heading as="h1" recipe="display">
              <Typeset emphasis="read.">Understand how your writing is read.</Typeset>
            </Heading>
            <Text recipe="prose" color="text.secondary">
              Reach, completion, reactions and freshness for your writing - a report you can read,
              not a dashboard to watch.
            </Text>
            <Text recipe="metadata" color="text.muted">
              {freshThrough
                ? `Fresh through ${formatFreshThrough(freshThrough)}`
                : 'Checking how fresh these numbers are'}
            </Text>
          </Stack>

          <AnalyticsDateRangeFilter range={range} onRangeChange={updateRange} />

          <AnalyticsSummaryMetrics
            summary={overview.data?.summary ?? null}
            isLoading={overview.isLoading}
            deniedAction={overviewAccess.deniedAction}
            failedAction={overviewAccess.failedAction}
            onRetry={overview.refresh}
          />

          <AnalyticsTrendChart
            title="Views trend"
            points={overview.data?.trend ?? []}
            dataFreshThrough={overview.data?.dataFreshThrough}
            rangeEnd={range.to}
            isLoading={overview.isLoading}
            deniedAction={overviewAccess.deniedAction}
            failedAction={overviewAccess.failedAction}
          />

          <AnalyticsInsightList
            title="Overview insights"
            insights={overview.data?.insights ?? []}
            isLoading={overview.isLoading}
            deniedAction={overviewAccess.deniedAction}
            failedAction={overviewAccess.failedAction}
          />
        </Stack>
      </Section>

      <Section density="compact">
        <Stack gap={4}>
          <BlogMetricsTable
            blogs={metrics.data?.posts ?? []}
            range={range}
            sort={sort}
            order={order}
            onSortChange={updateSort}
            isLoading={metrics.isLoading}
            deniedAction={metricsAccess.deniedAction}
            failedAction={metricsAccess.failedAction}
          />
          {metrics.data && metrics.data.posts.length > 0 ? (
            <PaginationControls
              currentPage={page}
              totalPages={Math.max(1, totalPages)}
              totalCount={metrics.data.total}
              pageSize={metrics.data.limit}
              onPageChange={updatePage}
              showOnlyWhenMultiple
            />
          ) : null}
        </Stack>
      </Section>
    </ContentContainer>
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
