/**
 * Single-blog analytics diagnostics - migrated onto Horizon Design System v2.
 *
 * One request backs the whole page, so every panel shares its loading, denied
 * and error state - unlike the overview page, where the summary and the table
 * are two independent requests. Each panel still receives its own props
 * rather than one page-level branch, so the zero-sample state (a real post
 * with no activity yet) keeps rendering each pattern's own honest "no data"
 * copy instead of a single blanket message that would talk about the whole
 * page when only the numbers are the story.
 */

import { useParams, useSearchParams } from 'react-router-dom'

import {
  ActionLink,
  ContentContainer,
  Eyebrow,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
  Typeset,
} from '../../../design-system'
import { fontFamilies } from '../../../theme/tokens'
import { FiArrowLeft } from 'react-icons/fi'
import { analyticsPanelAccess } from '../author-analytics.hook-state'
import { parseAnalyticsRange, serializeAnalyticsRange } from '../author-analytics.range'
import { AnalyticsDateRange } from '../author-analytics.types'
import { useBlogAnalytics } from '../useBlogAnalytics'
import AnalyticsDateRangeFilter from '../components/AnalyticsDateRangeFilter'
import AnalyticsInsightList from '../components/AnalyticsInsightList'
import AnalyticsReactionTrend from '../components/AnalyticsReactionTrend'
import { AnalyticsSummaryMetrics } from '../components/AnalyticsSummaryMetrics'
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

  const updateRange = (nextRange: AnalyticsDateRange) => {
    setSearchParams(serializeAnalyticsRange(nextRange))
  }

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
              Back to analytics
            </ActionLink>
            <Eyebrow as="p">Blog diagnostics</Eyebrow>
            {/*
              A blog title can run long, so it takes the page-title size on the
              display face rather than the full display ramp.
            */}
            <Heading as="h1" recipe="pageTitle" fontFamily={fontFamilies.display}>
              {analytics.data ? (
                <Typeset key={analytics.data.post.id}>{analytics.data.post.title}</Typeset>
              ) : (
                'Blog analytics'
              )}
            </Heading>
            <Text recipe="prose" color="text.secondary">
              How far readers get, what they react to, which links they follow and where they come
              from.
            </Text>
          </Stack>

          <AnalyticsDateRangeFilter range={range} onRangeChange={updateRange} />

          <AnalyticsSummaryMetrics
            scope="blog"
            summary={analytics.data?.summary ?? null}
            isLoading={analytics.isLoading}
            deniedAction={access.deniedAction}
            failedAction={access.failedAction}
            onRetry={analytics.refresh}
          />

          <Grid columns={2} gap={8} collapseAt="xl">
            <ReaderProgressFunnel
              stages={analytics.data?.progressFunnel ?? []}
              isLoading={analytics.isLoading}
              deniedAction={access.deniedAction}
              failedAction={access.failedAction}
            />
            <AnalyticsReactionTrend
              points={analytics.data?.reactionTrend ?? []}
              isLoading={analytics.isLoading}
              deniedAction={access.deniedAction}
              failedAction={access.failedAction}
            />
          </Grid>

          <Grid columns={2} gap={8} collapseAt="xl">
            <LinkPerformanceTable
              links={analytics.data?.topLinks ?? []}
              isLoading={analytics.isLoading}
              deniedAction={access.deniedAction}
              failedAction={access.failedAction}
            />
            <TrafficSourceBreakdown
              sources={analytics.data?.trafficSources ?? []}
              isLoading={analytics.isLoading}
              deniedAction={access.deniedAction}
              failedAction={access.failedAction}
            />
          </Grid>

          <AnalyticsInsightList
            title="Blog insights"
            insights={analytics.data?.insights ?? []}
            isLoading={analytics.isLoading}
            deniedAction={access.deniedAction}
            failedAction={access.failedAction}
          />
        </Stack>
      </Section>
    </ContentContainer>
  )
}

export default BlogAnalyticsPage
