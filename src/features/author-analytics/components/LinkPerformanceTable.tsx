/**
 * Links a blog's readers clicked, composed from the design system's
 * `DataTable` pattern. Four columns fit a 375px screen without stacking - see
 * `tableAdaptation`'s three-column threshold - so this stays a scrolling table
 * on every width rather than becoming cards.
 */

import { Box } from '@chakra-ui/react'

import { DataTable, Text, type DataPanelStateInput } from '../../../design-system'
import { AnalyticsLinkMetric } from '../author-analytics.types'
import { formatAnalyticsInteger, formatAnalyticsPercent } from '../author-analytics.format'

interface LinkPerformanceTableProps extends DataPanelStateInput {
  links: AnalyticsLinkMetric[]
  deniedDetail?: string
}

const LinkPerformanceTable = ({
  links,
  deniedDetail,
  isLoading,
  deniedAction,
  failedAction,
}: LinkPerformanceTableProps) => (
  <DataTable<AnalyticsLinkMetric>
    framed={false}
    caption="Link performance"
    title="Link performance"
    detail="Links readers clicked from this blog."
    rows={links}
    rowKey={(link) => link.linkKey}
    isLoading={isLoading}
    deniedAction={deniedAction}
    deniedDetail={deniedDetail}
    failedAction={failedAction}
    emptySubject="link clicks in this range"
    emptyNextAction="Add a link to the post, or come back once readers have clicked one."
    columns={[
      {
        key: 'link',
        label: 'Link',
        render: (link) => (
          <Box minW="0">
            <Text recipe="body" as="span" lineClamp={1} fontWeight="medium" color="text.primary">
              {link.label || link.url}
            </Text>
            <Text recipe="metadata" as="span" lineClamp={1} color="text.muted">
              {link.url}
            </Text>
          </Box>
        ),
      },
      { key: 'kind', label: 'Kind', render: (link) => link.kind },
      {
        key: 'clicks',
        label: 'Clicks',
        isNumeric: true,
        render: (link) => formatAnalyticsInteger(link.clicks),
      },
      {
        key: 'ctr',
        label: 'CTR',
        isNumeric: true,
        render: (link) => formatAnalyticsPercent(link.ctr),
      },
    ]}
  />
)

export default LinkPerformanceTable
