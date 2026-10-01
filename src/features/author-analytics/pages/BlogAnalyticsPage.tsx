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
import {
  formatAnalyticsInteger,
  formatAnalyticsPercent,
  formatApproximateReaders,
  formatFreshThrough,
} from '../author-analytics.format'
import { analyticsPanelAccess } from '../author-analytics.hook-state'
import { parseAnalyticsRange, serializeAnalyticsRange } from '../author-analytics.range'
import { AnalyticsDateRange } from '../author-analytics.types'
import AnalyticsDateRangeFilter from '../components/AnalyticsDateRangeFilter'
import BlogDiagnosticWorkspace from '../components/BlogDiagnosticWorkspace'
import { useBlogAnalytics } from '../useBlogAnalytics'

const BlogAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const postId = Number(id)
  const range = parseAnalyticsRange(searchParams)
  const analytics = useBlogAnalytics({
    postId: Number.isFinite(postId) ? postId : undefined,
    range,
  })

  const updateRange = (nextRange: AnalyticsDateRange) => {
    setSearchParams(serializeAnalyticsRange(nextRange))
  }

  const readers = analytics.data
    ? formatApproximateReaders(
        analytics.data.summary.estimatedUniqueReaders,
        analytics.data.summary.uniqueReadersApproximate,
      )
    : null
  const access = analyticsPanelAccess(analytics.error, 'view analytics for this blog')

  return (
    <ContentContainer>
      <Section>
        <Stack gap={12}>
          <Stack as="header" gap={4} maxW="4xl">
            <ActionLink
              standalone
              to={`/analytics?${serializeAnalyticsRange(range).toString()}`}
              underline="hover"
              iconStart={<FiArrowLeft aria-hidden="true" />}
            >
              Analytics
            </ActionLink>
            <Heading as="h1" recipe="pageTitle">
              {analytics.data?.post.title || 'Blog analytics'}
            </Heading>
            {analytics.data && readers ? (
              <Stack direction="row" gap={2} flexWrap="wrap" collapseAt={undefined}>
                <Text recipe="metadata">
                  {formatAnalyticsInteger(analytics.data.summary.views)} views
                </Text>
                <Text recipe="metadata" aria-hidden="true">
                  ·
                </Text>
                <Text recipe="metadata">{readers.value} readers</Text>
                <Text recipe="metadata" aria-hidden="true">
                  ·
                </Text>
                <Text recipe="metadata">
                  {formatAnalyticsPercent(analytics.data.summary.completionRate)} completion
                </Text>
              </Stack>
            ) : null}
            <Text recipe="metadata" color="text.muted">
              {analytics.dataFreshThrough
                ? `Fresh through ${formatFreshThrough(analytics.dataFreshThrough)}`
                : 'Checking how fresh these numbers are'}
            </Text>
          </Stack>

          <AnalyticsDateRangeFilter range={range} onRangeChange={updateRange} />

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
              <BlogDiagnosticWorkspace analytics={analytics.data} />
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
