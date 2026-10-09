import { Flex } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useParams, useSearchParams } from 'react-router-dom'

import {
  ActionLink,
  ContentContainer,
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
import { AnalyticsDateRange } from '../author-analytics.types'
import AnalyticsDateRangeFilter from '../components/AnalyticsDateRangeFilter'
import BlogReadingReport from '../components/BlogReadingReport'
import AnalyticsReportSummary from '../components/AnalyticsReportSummary'
import { AuthorAnalyticsService } from '../author-analytics.service'
import { parseReportControls } from '../author-analytics.report'
import { useBlogAnalytics } from '../useBlogAnalytics'

const BlogAnalyticsPage = ({ service }: { service?: AuthorAnalyticsService }) => {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const postId = Number(id)
  const range = parseAnalyticsRange(searchParams)
  const analytics = useBlogAnalytics({
    postId: Number.isFinite(postId) ? postId : undefined,
    range,
    service,
  })

  const updateRange = (nextRange: AnalyticsDateRange) => {
    const next = new URLSearchParams(searchParams)
    next.set('from', nextRange.from)
    next.set('to', nextRange.to)
    next.delete('page')
    setSearchParams(next)
  }

  const controls = parseReportControls(searchParams)
  const backQuery = serializeAnalyticsRange(range)
  backQuery.set('page', String(controls.page))
  backQuery.set('sort', controls.sort)
  backQuery.set('order', controls.order)
  if (controls.query) backQuery.set('q', controls.query)

  const access = analyticsPanelAccess(analytics.error, 'view analytics for this blog')

  return (
    <ContentContainer>
      <Section density="compact">
        <Stack gap={8}>
          <Stack as="header" gap={3}>
            <ActionLink
              standalone
              to={`/analytics?${backQuery.toString()}`}
              underline="hover"
              iconStart={<FiArrowLeft aria-hidden="true" />}
            >
              Analytics
            </ActionLink>
            <Heading as="h1" recipe="pageTitle" fontSize={{ base: '2xl', md: '3xl' }}>
              {analytics.data?.post.title || 'Blog analytics'}
            </Heading>
            <Text recipe="metadata" color="text.muted">
              {analytics.dataFreshThrough
                ? `Fresh through ${formatFreshThrough(analytics.dataFreshThrough)}`
                : 'Checking how fresh these numbers are'}
            </Text>
          </Stack>

          <Flex justify="space-between" gap={4} align="center" wrap="wrap">
            {!analytics.isLoading && !analytics.error && analytics.data && (
              <AnalyticsReportSummary summary={analytics.data.summary} detail />
            )}
            <AnalyticsDateRangeFilter compact range={range} onRangeChange={updateRange} />
          </Flex>

          {analytics.isLoading ? (
            <PanelLoading task="this blog's analytics" />
          ) : access.deniedAction ? (
            <PermissionState deniedAction={access.deniedAction} />
          ) : access.failedAction ? (
            <ErrorState failedAction={access.failedAction}>
              <RetryAction failedAction={access.failedAction} onRetry={analytics.refresh} />
            </ErrorState>
          ) : analytics.data ? (
            <Stack gap={6}>
              <BlogReadingReport analytics={analytics.data} />
              {analytics.isEmpty ? (
                <Text recipe="metadata" color="text.muted">
                  No measurable activity in this range yet.
                </Text>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default BlogAnalyticsPage
