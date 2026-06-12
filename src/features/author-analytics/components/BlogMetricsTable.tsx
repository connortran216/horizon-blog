import {
  Badge,
  Box,
  Button,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

import {
  formatAnalyticsDuration,
  formatAnalyticsInteger,
  formatAnalyticsPercent,
  formatApproximateReaders,
} from '../author-analytics.format'
import { serializeAnalyticsRange } from '../author-analytics.range'
import {
  AnalyticsDateRange,
  AnalyticsPostSort,
  AnalyticsSortOrder,
  BlogMetricRow,
} from '../author-analytics.types'
import { sortBlogMetrics } from '../author-analytics.visualization'

interface BlogMetricsTableProps {
  blogs: BlogMetricRow[]
  range: AnalyticsDateRange
  sort: AnalyticsPostSort
  order: AnalyticsSortOrder
  onSortChange: (sort: AnalyticsPostSort) => void
}

const columns: Array<{ label: string; sort: AnalyticsPostSort }> = [
  { label: 'Views', sort: 'views' },
  { label: 'Readers', sort: 'unique_readers' },
  { label: 'Completion', sort: 'completion_rate' },
  { label: 'Active read', sort: 'avg_active_read_seconds' },
  { label: 'Hearts received', sort: 'hearts_received' },
]

const BlogMetricsTable = ({ blogs, range, sort, order, onSortChange }: BlogMetricsTableProps) => {
  const sortedBlogs = sortBlogMetrics(blogs, sort, order)
  const rangeQuery = serializeAnalyticsRange(range).toString()

  return (
    <Box border="1px solid" borderColor="border.subtle" bg="bg.secondary" borderRadius="2xl" p={5}>
      <HStack justify="space-between" align="start" mb={4} gap={4}>
        <Box>
          <Text color="text.primary" fontWeight="semibold">
            Blog comparison
          </Text>
          <Text color="text.secondary" fontSize="sm">
            Compare blogs by reach, completion, active reading, and reactions.
          </Text>
        </Box>
        <Badge bg="bg.tertiary" color="text.secondary" borderRadius="full">
          {order === 'asc' ? 'Ascending' : 'Descending'}
        </Badge>
      </HStack>

      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Blog</Th>
              {columns.map((column) => (
                <Th key={column.sort} isNumeric>
                  <Button
                    variant="ghost"
                    size="xs"
                    color={sort === column.sort ? 'action.primary' : 'text.secondary'}
                    aria-label={
                      sort === column.sort
                        ? order === 'asc'
                          ? `Sort by ${column.label}, currently ascending`
                          : `Sort by ${column.label}, currently descending`
                        : `Sort by ${column.label}`
                    }
                    onClick={() => onSortChange(column.sort)}
                  >
                    {column.label}
                  </Button>
                </Th>
              ))}
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {sortedBlogs.map((blog) => {
              const readers = formatApproximateReaders(
                blog.estimatedUniqueReaders,
                blog.uniqueReadersApproximate,
              )

              return (
                <Tr key={blog.postId}>
                  <Td>
                    <Text color="text.primary" fontWeight="medium" noOfLines={2}>
                      {blog.title}
                    </Text>
                    <Text color="text.tertiary" fontSize="xs">
                      {formatAnalyticsInteger(blog.linkClicks)} link clicks ·{' '}
                      {formatAnalyticsInteger(blog.shares)} shares ·{' '}
                      {formatAnalyticsInteger(blog.activeHeartCount)} active hearts
                    </Text>
                  </Td>
                  <Td isNumeric>{formatAnalyticsInteger(blog.views)}</Td>
                  <Td isNumeric>
                    {readers.value}
                    {readers.isApproximate ? (
                      <Text as="span" srOnly>
                        {' '}
                        approximate
                      </Text>
                    ) : null}
                  </Td>
                  <Td isNumeric>{formatAnalyticsPercent(blog.completionRate)}</Td>
                  <Td isNumeric>{formatAnalyticsDuration(blog.avgActiveReadSeconds)}</Td>
                  <Td isNumeric>{formatAnalyticsInteger(blog.heartsReceived)}</Td>
                  <Td isNumeric>
                    <Button
                      as={RouterLink}
                      to={`/analytics/blog/${blog.postId}?${rangeQuery}`}
                      size="xs"
                      variant="ghost"
                      color="action.primary"
                    >
                      Open
                    </Button>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default BlogMetricsTable
