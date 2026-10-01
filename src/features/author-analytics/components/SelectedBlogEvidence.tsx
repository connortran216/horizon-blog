import { Box, HStack, Link, SimpleGrid, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

import {
  formatAnalyticsDuration,
  formatAnalyticsInteger,
  formatAnalyticsPercent,
  formatApproximateReaders,
} from '../author-analytics.format'
import { AnalyticsDateRange, BlogMetricRow } from '../author-analytics.types'

interface SelectedBlogEvidenceProps {
  blog: BlogMetricRow
  range: AnalyticsDateRange
}

const SelectedBlogEvidence = ({ blog, range }: SelectedBlogEvidenceProps) => {
  const readers = formatApproximateReaders(
    blog.estimatedUniqueReaders,
    blog.uniqueReadersApproximate,
  )
  const query = new URLSearchParams({ from: range.from, to: range.to, timezone: range.timezone })

  return (
    <Box
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor="border.subtle"
      py={5}
      px={{ base: 0, md: 2 }}
    >
      <SimpleGrid columns={{ base: 1, lg: 5 }} spacing={{ base: 4, lg: 6 }} alignItems="center">
        <Box gridColumn={{ lg: 'span 2' }} minW={0}>
          <Text color="text.muted" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
            Selected blog
          </Text>
          <Link
            as={RouterLink}
            to={`/analytics/blog/${blog.postId}?${query.toString()}`}
            color="text.primary"
            fontWeight="semibold"
            display="inline-flex"
            alignItems="center"
            gap={1}
            mt={1}
            _hover={{ color: 'action.hover', textDecoration: 'underline' }}
          >
            <Text as="span" noOfLines={2}>
              {blog.title}
            </Text>
            <Box as={FiArrowUpRight} flex="0 0 auto" aria-hidden />
          </Link>
        </Box>

        <EvidenceValue label="Views" value={formatAnalyticsInteger(blog.views)} />
        <EvidenceValue label={readers.label} value={readers.value} />
        <HStack spacing={6} justify={{ base: 'start', lg: 'space-between' }}>
          <EvidenceValue label="Completion" value={formatAnalyticsPercent(blog.completionRate)} />
          <EvidenceValue
            label="Active read"
            value={formatAnalyticsDuration(blog.avgActiveReadSeconds)}
          />
        </HStack>
      </SimpleGrid>
      <Text color="text.muted" fontSize="sm" mt={4}>
        {formatAnalyticsInteger(blog.linkClicks)} link clicks ·{' '}
        {formatAnalyticsInteger(blog.shares)} shares · {formatAnalyticsInteger(blog.heartsReceived)}{' '}
        hearts
      </Text>
    </Box>
  )
}

const EvidenceValue = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Text color="text.muted" fontSize="xs">
      {label}
    </Text>
    <Text color="text.primary" fontWeight="medium" mt={1}>
      {value}
    </Text>
  </Box>
)

export default SelectedBlogEvidence
