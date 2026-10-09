import { Flex } from '@chakra-ui/react'
import { Text } from '../../../design-system'
import {
  formatAnalyticsDuration,
  formatAnalyticsInteger,
  formatAnalyticsPercent,
  formatApproximateReaders,
} from '../author-analytics.format'
import { AnalyticsSummary } from '../author-analytics.types'

export default function AnalyticsReportSummary({
  summary,
  detail = false,
}: {
  summary: AnalyticsSummary
  detail?: boolean
}) {
  const readers = formatApproximateReaders(
    summary.estimatedUniqueReaders,
    summary.uniqueReadersApproximate,
  )
  const values = [
    `${formatAnalyticsInteger(summary.views)} views`,
    `${readers.value} ${readers.isApproximate ? 'estimated readers' : 'readers'}`,
    `${formatAnalyticsPercent(summary.completionRate)} session completion`,
    detail
      ? `${formatAnalyticsDuration(summary.avgActiveReadSeconds)} active read time`
      : `${formatAnalyticsInteger(summary.linkClicks + summary.heartsReceived + summary.shares)} action events`,
  ]
  return (
    <Flex as="ul" listStyleType="none" m={0} p={0} gap={2} wrap="wrap" aria-label="Range summary">
      {values.map((value, index) => (
        <Text as="li" key={value} recipe="body" color="text.secondary">
          {index > 0 && (
            <Text as="span" aria-hidden="true" mr={2}>
              ·
            </Text>
          )}
          {value}
        </Text>
      ))}
    </Flex>
  )
}
