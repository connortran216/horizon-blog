import { useEffect, useState } from 'react'
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
} from '../../../design-system'
import { formatFreshThrough } from '../author-analytics.format'
import { analyticsPanelAccess } from '../author-analytics.hook-state'
import { parseAnalyticsRange, serializeAnalyticsRange } from '../author-analytics.range'
import { AnalyticsDateRange, BlogMetricRow } from '../author-analytics.types'
import AnalyticsDateRangeFilter from '../components/AnalyticsDateRangeFilter'
import ReachDepthMap from '../components/ReachDepthMap'
import ReaderJourney from '../components/ReaderJourney'
import SelectedBlogEvidence from '../components/SelectedBlogEvidence'
import { useAnalyticsOverview } from '../useAnalyticsOverview'
import { useBlogMetrics } from '../useBlogMetrics'

const PAGE_SIZE = 10
const EMPTY_BLOGS: BlogMetricRow[] = []

const AnalyticsOverviewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const range = parseAnalyticsRange(searchParams)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const overview = useAnalyticsOverview({ range })
  const metrics = useBlogMetrics({ range, sort: 'views', order: 'desc', page, limit: PAGE_SIZE })
  const blogs = metrics.data?.posts ?? EMPTY_BLOGS
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  useEffect(() => {
    if (blogs.length === 0) {
      setSelectedPostId(null)
      return
    }

    if (!blogs.some((blog) => blog.postId === selectedPostId)) {
      setSelectedPostId(blogs[0].postId)
    }
  }, [blogs, selectedPostId])

  const updateRange = (nextRange: AnalyticsDateRange) => {
    const next = serializeAnalyticsRange(nextRange)
    next.set('page', '1')
    setSearchParams(next)
  }

  const updatePage = (nextPage: number) => {
    const next = serializeAnalyticsRange(range)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  const selectedBlog = blogs.find((blog) => blog.postId === selectedPostId) ?? blogs[0]
  const totalPages = metrics.data ? Math.ceil(metrics.data.total / metrics.data.limit) : 1
  const freshThrough = overview.dataFreshThrough ?? metrics.dataFreshThrough
  const overviewAccess = analyticsPanelAccess(overview.error, 'view your analytics')
  const metricsAccess = analyticsPanelAccess(metrics.error, 'view your blog signals')

  return (
    <ContentContainer>
      <Section>
        <Stack gap={8}>
          <Stack as="header" gap={3} maxW="4xl">
            <Heading as="h1" recipe="pageTitle">
              Analytics
            </Heading>
            <Text recipe="prose" color="text.secondary">
              See what earns attention—and what keeps it.
            </Text>
            <Text recipe="metadata" color="text.muted">
              {freshThrough
                ? `Fresh through ${formatFreshThrough(freshThrough)}`
                : 'Checking how fresh these numbers are'}
            </Text>
          </Stack>

          <AnalyticsDateRangeFilter range={range} onRangeChange={updateRange} />

          {overview.isLoading ? (
            <PanelLoading task="the reader journey" />
          ) : overviewAccess.deniedAction ? (
            <PermissionState deniedAction={overviewAccess.deniedAction} />
          ) : overviewAccess.failedAction ? (
            <ErrorState failedAction={overviewAccess.failedAction}>
              <RetryAction failedAction={overviewAccess.failedAction} onRetry={overview.refresh} />
            </ErrorState>
          ) : overview.data ? (
            <ReaderJourney summary={overview.data.summary} />
          ) : null}

          {metrics.isLoading ? (
            <PanelLoading task="your blog signals" />
          ) : metricsAccess.deniedAction ? (
            <PermissionState deniedAction={metricsAccess.deniedAction} />
          ) : metricsAccess.failedAction ? (
            <ErrorState failedAction={metricsAccess.failedAction}>
              <RetryAction failedAction={metricsAccess.failedAction} onRetry={metrics.refresh} />
            </ErrorState>
          ) : blogs.length > 0 && selectedBlog ? (
            <Stack gap={4}>
              <ReachDepthMap
                blogs={blogs}
                selectedPostId={selectedBlog.postId}
                onSelect={setSelectedPostId}
              />
              <SelectedBlogEvidence blog={selectedBlog} range={range} />
              <PaginationControls
                currentPage={page}
                totalPages={Math.max(1, totalPages)}
                totalCount={metrics.data?.total ?? 0}
                pageSize={metrics.data?.limit ?? PAGE_SIZE}
                onPageChange={updatePage}
                showOnlyWhenMultiple
              />
            </Stack>
          ) : (
            <EmptyState
              subject="blog analytics for this range"
              nextAction="Widen the date range, or come back once this writing has had some readers."
            />
          )}
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default AnalyticsOverviewPage
