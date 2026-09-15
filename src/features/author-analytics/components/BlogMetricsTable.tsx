/**
 * The blog-comparison table, composed from the design system's `DataTable`
 * pattern.
 *
 * Seven columns is exactly the shape `tableAdaptation`'s docstring names as
 * the reason the stacked mobile layout exists - a scrolling 900px table would
 * otherwise widen the whole document on a phone. Below 800px this becomes a
 * stack of labelled cards instead, per `horizon-blog-dsv2.6.3` acceptance 2.
 *
 * "Hearts received" - the range-scoped column - and "active hearts" - the
 * always-current count folded into the title cell's detail line - are kept
 * visually distinct so a reader does not read one number for the other.
 */

import { Box, VisuallyHidden } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

import {
  DataTable,
  metricValue,
  Text,
  type DataPanelStateInput,
  type DataTableColumn,
} from '../../../design-system'
import { componentTokens } from '../../../theme/tokens'
import {
  formatAnalyticsInteger,
  formatAnalyticsPercent,
  formatAnalyticsDuration,
} from '../author-analytics.format'
import { serializeAnalyticsRange } from '../author-analytics.range'
import {
  AnalyticsDateRange,
  AnalyticsPostSort,
  AnalyticsSortOrder,
  BlogMetricRow,
} from '../author-analytics.types'
import { sortBlogMetrics } from '../author-analytics.visualization'

interface BlogMetricsTableProps extends DataPanelStateInput {
  blogs: BlogMetricRow[]
  range: AnalyticsDateRange
  sort: AnalyticsPostSort
  order: AnalyticsSortOrder
  onSortChange: (sort: AnalyticsPostSort, order: AnalyticsSortOrder) => void
  deniedDetail?: string
}

const ApproximateReaders = ({
  value,
  isApproximate,
}: {
  value: number
  isApproximate: boolean
}) => {
  const resolved = metricValue({ value, isApproximate })

  return (
    <>
      {resolved.display}
      {resolved.spokenSuffix === null ? null : (
        <VisuallyHidden> {resolved.spokenSuffix}</VisuallyHidden>
      )}
    </>
  )
}

const BlogMetricsTable = ({
  blogs,
  range,
  sort,
  order,
  onSortChange,
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: BlogMetricsTableProps) => {
  const sortedBlogs = sortBlogMetrics(blogs, sort, order)
  const rangeQuery = serializeAnalyticsRange(range).toString()

  const columns: DataTableColumn<BlogMetricRow>[] = [
    {
      key: 'title',
      label: 'Blog',
      render: (blog) => (
        <Box minW="0">
          <Text recipe="body" as="span" lineClamp={2} fontWeight="medium" color="text.primary">
            {blog.title}
          </Text>
          <Text recipe="metadata" as="span" color="text.muted">
            {formatAnalyticsInteger(blog.linkClicks)} link clicks &middot;{' '}
            {formatAnalyticsInteger(blog.shares)} shares &middot;{' '}
            {formatAnalyticsInteger(blog.activeHeartCount)} active hearts
          </Text>
        </Box>
      ),
    },
    {
      key: 'views',
      label: 'Views',
      isNumeric: true,
      isSortable: true,
      render: (blog) => formatAnalyticsInteger(blog.views),
    },
    {
      key: 'unique_readers',
      label: 'Readers',
      isNumeric: true,
      isSortable: true,
      render: (blog) => (
        <ApproximateReaders
          value={blog.estimatedUniqueReaders}
          isApproximate={blog.uniqueReadersApproximate}
        />
      ),
    },
    {
      key: 'completion_rate',
      label: 'Completion',
      isNumeric: true,
      isSortable: true,
      render: (blog) => formatAnalyticsPercent(blog.completionRate),
    },
    {
      key: 'avg_active_read_seconds',
      label: 'Active read',
      isNumeric: true,
      isSortable: true,
      render: (blog) => formatAnalyticsDuration(blog.avgActiveReadSeconds),
    },
    {
      key: 'hearts_received',
      label: 'Hearts received',
      isNumeric: true,
      isSortable: true,
      render: (blog) => formatAnalyticsInteger(blog.heartsReceived),
    },
    {
      key: 'details',
      label: 'Details',
      render: (blog) => (
        <Box
          as={RouterLink}
          to={`/analytics/blog/${blog.postId}?${rangeQuery}`}
          display="inline-flex"
          alignItems="center"
          minH={componentTokens.control.minTouchTarget}
          color="action.primary"
          fontWeight="semibold"
        >
          Open
        </Box>
      ),
    },
  ]

  return (
    <DataTable<BlogMetricRow>
      caption="Blog comparison"
      title="Blog comparison"
      detail="Compare blogs by reach, completion, active reading, and reactions."
      rows={sortedBlogs}
      rowKey={(blog) => String(blog.postId)}
      sortKey={sort}
      sortOrder={order}
      onSortChange={(key, nextOrder) => onSortChange(key as AnalyticsPostSort, nextOrder)}
      isLoading={isLoading}
      deniedAction={deniedAction}
      deniedDetail={deniedDetail}
      failedAction={failedAction}
      emptySubject="posts with analytics"
      emptyNextAction="Publish a blog, or widen the date range."
      columns={columns}
    />
  )
}

export default BlogMetricsTable
