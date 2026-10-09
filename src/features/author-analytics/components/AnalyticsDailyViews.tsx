import { Box, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { assessCoverage, Text } from '../../../design-system'
import { formatAnalyticsInteger } from '../author-analytics.format'
import { AnalyticsTrendPoint } from '../author-analytics.types'

const dayLabel = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

export default function AnalyticsDailyViews({
  points,
  freshThrough,
  rangeEnd,
}: {
  points: AnalyticsTrendPoint[]
  freshThrough: string
  rangeEnd: string
}) {
  const data = [...points].sort((a, b) => a.date.localeCompare(b.date))
  const notice = assessCoverage({ freshThrough, rangeEnd }).notice
  const width = 960,
    height = 230,
    left = 48,
    right = 20,
    top = 16,
    bottom = 40
  const plotWidth = width - left - right,
    plotHeight = height - top - bottom
  const max = Math.max(4, Math.ceil(Math.max(0, ...data.map((point) => point.views)) / 4) * 4)
  const firstDay = data.length ? Date.parse(`${data[0].date}T00:00:00Z`) : 0
  const dayCount = data.length
    ? Math.max(
        1,
        Math.round((Date.parse(`${data[data.length - 1].date}T00:00:00Z`) - firstDay) / 86400000) +
          1,
      )
    : 1
  const slot = plotWidth / dayCount
  const ticks = Array.from({ length: 5 }, (_, i) => (max / 4) * i)
  return (
    <Box minW={0}>
      {notice && (
        <Text recipe="metadata" role="status" mb={3}>
          {notice}
        </Text>
      )}
      {data.length === 0 ? (
        <Text recipe="body">No daily view measurements for this range.</Text>
      ) : (
        <>
          <Box
            overflowX="auto"
            tabIndex={0}
            role="region"
            aria-label="Daily views chart; scroll horizontally on small screens"
          >
            <Box
              as="svg"
              viewBox={`0 0 ${width} ${height}`}
              w="full"
              minW="600px"
              role="img"
              aria-label={`Daily views in UTC, ${data.length} reported days. Exact values are in the data table below.`}
            >
              {ticks.map((tick) => {
                const y = top + plotHeight - (tick / max) * plotHeight
                return (
                  <g key={tick}>
                    <line
                      x1={left}
                      x2={width - right}
                      y1={y}
                      y2={y}
                      stroke="var(--chakra-colors-border-subtle)"
                      strokeDasharray="3 4"
                    />
                    <text
                      x={left - 12}
                      y={y + 5}
                      textAnchor="end"
                      fill="var(--chakra-colors-text-muted)"
                      fontSize="13"
                    >
                      {formatAnalyticsInteger(tick)}
                    </text>
                  </g>
                )
              })}
              {data.map((point, index) => {
                const day = Math.round(
                  (Date.parse(`${point.date}T00:00:00Z`) - firstDay) / 86400000,
                )
                const x = left + day * slot,
                  barHeight = (Math.max(0, point.views) / max) * plotHeight
                const label =
                  index === 0 ||
                  index === data.length - 1 ||
                  (index % Math.max(1, Math.ceil(data.length / 8)) === 0 && index < data.length - 2)
                return (
                  <g key={point.date}>
                    <title>
                      {point.date}: {formatAnalyticsInteger(point.views)} views
                    </title>
                    <rect
                      x={x + slot * 0.22}
                      y={top + plotHeight - barHeight}
                      width={Math.max(1, slot * 0.56)}
                      height={barHeight}
                      fill="var(--chakra-colors-action-primary)"
                    />
                    {label && (
                      <text
                        x={x + slot / 2}
                        y={height - 12}
                        textAnchor={
                          index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'
                        }
                        fill="var(--chakra-colors-text-muted)"
                        fontSize="13"
                      >
                        {dayLabel(point.date)}
                      </text>
                    )}
                  </g>
                )
              })}
            </Box>
          </Box>
          <Box as="details" mt={3}>
            <Box as="summary" cursor="pointer" color="text.secondary" fontSize="sm" py={2}>
              Daily values
            </Box>
            <Box maxH="240px" overflowY="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Date (UTC)</Th>
                    <Th isNumeric>Views</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.map((point) => (
                    <Tr key={point.date}>
                      <Td>{point.date}</Td>
                      <Td isNumeric>{formatAnalyticsInteger(point.views)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}
