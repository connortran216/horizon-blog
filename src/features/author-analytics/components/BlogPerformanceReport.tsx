import { Box, Flex, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { Text } from '../../../design-system'
import {
  formatAnalyticsDuration,
  formatAnalyticsInteger,
  formatAnalyticsPercent,
} from '../author-analytics.format'
import { completionPercent } from '../author-analytics.report'
import { BlogMetricRow } from '../author-analytics.types'

export default function BlogPerformanceReport({
  blogs,
  query,
  start = 0,
}: {
  blogs: BlogMetricRow[]
  query: string
  start?: number
}) {
  return (
    <Box overflowX="auto" role="region" aria-label="Blog performance table" tabIndex={0}>
      <Table
        variant="simple"
        size="sm"
        minW="640px"
        sx={{
          'th, td': { borderColor: 'border.subtle', px: 3, py: 4 },
          th: { textTransform: 'none', letterSpacing: 'normal', color: 'text.secondary' },
          td: { fontVariantNumeric: 'tabular-nums' },
        }}
      >
        <Box as="caption" position="absolute" w="1px" h="1px" overflow="hidden">
          Blog performance for the selected date range
        </Box>
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th w="48%">Blog</Th>
            <Th isNumeric>Views</Th>
            <Th>Completion (sessions)</Th>
            <Th isNumeric>Active read</Th>
          </Tr>
        </Thead>
        <Tbody>
          {blogs.map((blog, index) => (
            <Tr key={blog.postId} _hover={{ bg: 'bg.subtle' }}>
              <Td color="text.muted">{start + index + 1}</Td>
              <Td>
                <Box
                  as={RouterLink}
                  to={`/analytics/blog/${blog.postId}?${query}`}
                  display="inline-block"
                  py={2}
                  fontWeight="medium"
                  color="text.primary"
                  _hover={{ color: 'action.primary', textDecoration: 'underline' }}
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'action.primary',
                    outlineOffset: '2px',
                  }}
                >
                  {blog.title}
                </Box>
              </Td>
              <Td isNumeric data-metric="views">
                {formatAnalyticsInteger(blog.views)}
              </Td>
              <Td>
                <Flex align="center" gap={3}>
                  <Box
                    flex={1}
                    minW="64px"
                    h="6px"
                    bg="bg.subtle"
                    borderRadius="full"
                    aria-hidden="true"
                  >
                    <Box
                      h="full"
                      w={`${completionPercent(blog.completionRate)}%`}
                      bg="action.primary"
                      borderRadius="full"
                    />
                  </Box>
                  <Text recipe="metadata" whiteSpace="nowrap" color="text.primary">
                    {blog.views > 0 ? formatAnalyticsPercent(blog.completionRate) : '—'}
                  </Text>
                </Flex>
                <Text recipe="metadata" fontSize="xs" mt={1}>
                  Based on {formatAnalyticsInteger(blog.views)} opens
                </Text>
              </Td>
              <Td isNumeric>
                {blog.views > 0 ? formatAnalyticsDuration(blog.avgActiveReadSeconds) : '—'}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
