import { Flex } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import PaginationControls from '../../../components/PaginationControls'
import {
  ContentContainer,
  EmptyState,
  ErrorState,
  Heading,
  PanelLoading,
  PermissionState,
  RetryAction,
  Section,
  Stack,
  Text,
  Input,
  Select,
} from '../../../design-system'
import { formatAnalyticsRangeLabel, formatFreshThrough } from '../author-analytics.format'
import { analyticsPanelAccess } from '../author-analytics.hook-state'
import { parseAnalyticsRange, serializeAnalyticsRange } from '../author-analytics.range'
import { AnalyticsDateRange } from '../author-analytics.types'
import { AuthorAnalyticsService } from '../author-analytics.service'
import {
  filterReportBlogs,
  parseReportControls,
  reportSortOptions,
} from '../author-analytics.report'
import { sortBlogMetrics } from '../author-analytics.visualization'
import AnalyticsDateRangeFilter from '../components/AnalyticsDateRangeFilter'
import AnalyticsReportSection from '../components/AnalyticsReportSection'
import AnalyticsReportSummary from '../components/AnalyticsReportSummary'
import AnalyticsDailyViews from '../components/AnalyticsDailyViews'
import BlogPerformanceReport from '../components/BlogPerformanceReport'
import { useAnalyticsOverview } from '../useAnalyticsOverview'
import { useBlogMetrics } from '../useBlogMetrics'

const PAGE_SIZE = 10

const AnalyticsOverviewPage = ({ service }: { service?: AuthorAnalyticsService }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const range = parseAnalyticsRange(searchParams)
  const controls = parseReportControls(searchParams)
  const overview = useAnalyticsOverview({ range, service })
  const metrics = useBlogMetrics({ range, all: true, service })
  const blogs = useMemo(
    () =>
      sortBlogMetrics(
        filterReportBlogs(metrics.data?.posts ?? [], controls.query),
        controls.sort,
        controls.order,
      ),
    [metrics.data, controls.query, controls.sort, controls.order],
  )
  const totalPages = Math.max(1, Math.ceil(blogs.length / PAGE_SIZE))
  const page = Math.min(controls.page, totalPages)
  const updateControls = (values: Record<string, string>, replace = false) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setSearchParams(next, { replace })
  }
  const updateRange = (nextRange: AnalyticsDateRange) => {
    const next = serializeAnalyticsRange(nextRange)
    if (controls.query) next.set('q', controls.query)
    next.set('sort', controls.sort)
    next.set('order', controls.order)
    setSearchParams(next)
  }
  const detailQuery = serializeAnalyticsRange(range)
  detailQuery.set('page', String(page))
  detailQuery.set('sort', controls.sort)
  detailQuery.set('order', controls.order)
  if (controls.query) detailQuery.set('q', controls.query)
  const overviewAccess = analyticsPanelAccess(overview.error, 'view your analytics')
  const metricsAccess = analyticsPanelAccess(metrics.error, 'view your blog signals')
  return (
    <ContentContainer>
      <Section density="compact">
        <Stack gap={8}>
          <Stack as="header" gap={3}>
            <Flex justify="space-between" align="start" gap={4} wrap="wrap">
              <Heading as="h1" recipe="pageTitle" fontSize={{ base: '2xl', md: '3xl' }}>
                Analytics
              </Heading>
              <AnalyticsDateRangeFilter compact range={range} onRangeChange={updateRange} />
            </Flex>
            {!overview.isLoading && !overview.error && overview.data && (
              <AnalyticsReportSummary summary={overview.data.summary} />
            )}
            <Text recipe="metadata">
              {overview.dataFreshThrough
                ? `Fresh through ${formatFreshThrough(overview.dataFreshThrough)}`
                : 'Checking how fresh these numbers are'}
            </Text>
          </Stack>
          {overview.isLoading ? (
            <PanelLoading task="your audience report" />
          ) : overviewAccess.deniedAction ? (
            <PermissionState deniedAction={overviewAccess.deniedAction} />
          ) : overviewAccess.failedAction ? (
            <ErrorState failedAction={overviewAccess.failedAction}>
              <RetryAction failedAction={overviewAccess.failedAction} onRetry={overview.refresh} />
            </ErrorState>
          ) : overview.data ? (
            <AnalyticsReportSection
              number="01"
              title="Audience over time"
              detail={`Daily views for ${formatAnalyticsRangeLabel(range.from, range.to)} (UTC).`}
            >
              <AnalyticsDailyViews
                points={overview.data.trend}
                freshThrough={overview.data.dataFreshThrough}
                rangeEnd={range.to}
              />
            </AnalyticsReportSection>
          ) : null}
          <AnalyticsReportSection
            number="02"
            title="Blog performance"
            detail="Compare writing by views, reading completion and active read time."
            controls={
              <Flex gap={3} wrap="wrap" w={{ base: 'full', lg: 'auto' }}>
                <Input
                  aria-label="Search all blogs"
                  placeholder="Search all blogs…"
                  value={controls.query}
                  onChange={(event) => updateControls({ q: event.target.value, page: '1' }, true)}
                  w={{ base: 'full', md: '240px' }}
                />
                <Select
                  aria-label="Sort blogs"
                  value={`${controls.sort}:${controls.order}`}
                  onChange={(event) => {
                    const [sort, order] = event.target.value.split(':')
                    updateControls({ sort, order, page: '1' })
                  }}
                  w={{ base: 'full', md: '240px' }}
                >
                  {Object.entries(reportSortOptions).flatMap(([key, label]) => [
                    <option key={`${key}:desc`} value={`${key}:desc`}>
                      {label}: high to low
                    </option>,
                    <option key={`${key}:asc`} value={`${key}:asc`}>
                      {label}: low to high
                    </option>,
                  ])}
                </Select>
              </Flex>
            }
          >
            {metrics.isLoading ? (
              <PanelLoading task="all blog metrics" />
            ) : metricsAccess.deniedAction ? (
              <PermissionState deniedAction={metricsAccess.deniedAction} />
            ) : metricsAccess.failedAction ? (
              <ErrorState failedAction={metricsAccess.failedAction}>
                <RetryAction failedAction={metricsAccess.failedAction} onRetry={metrics.refresh} />
              </ErrorState>
            ) : blogs.length ? (
              <>
                <Text recipe="metadata" role="status">
                  {blogs.length}{' '}
                  {controls.query
                    ? `matching blogs of ${metrics.data?.total ?? 0}`
                    : 'blogs in this range'}
                </Text>
                <BlogPerformanceReport
                  blogs={blogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
                  query={detailQuery.toString()}
                  start={(page - 1) * PAGE_SIZE}
                />
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  totalCount={blogs.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(nextPage) => updateControls({ page: String(nextPage) })}
                  showOnlyWhenMultiple
                />
              </>
            ) : (
              <EmptyState
                subject={
                  controls.query ? 'blogs matching this search' : 'blog analytics for this range'
                }
                nextAction={
                  controls.query
                    ? 'Try another title or clear the search.'
                    : 'Widen the date range, or come back once this writing has had readers.'
                }
              />
            )}
          </AnalyticsReportSection>
        </Stack>
      </Section>
    </ContentContainer>
  )
}
export default AnalyticsOverviewPage
