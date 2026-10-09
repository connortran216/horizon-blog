import { Box, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { Text } from '../../../design-system'
import { formatAnalyticsInteger, formatAnalyticsPercent } from '../author-analytics.format'
import { AnalyticsFunnelStage } from '../author-analytics.types'
import { normalizeFunnelStages } from '../author-analytics.visualization'

export default function ReadingRetentionChart({ stages }: { stages: AnalyticsFunnelStage[] }) {
  const data = normalizeFunnelStages(stages)
  if (data.length === 0)
    return <Text recipe="body">No reading-progress measurements in this range.</Text>
  const width = 680,
    height = 250,
    left = 48,
    right = 58,
    top = 32,
    bottom = 44
  const max = Math.max(4, Math.ceil(Math.max(...data.map((point) => point.sessions)) / 4) * 4)
  const points = data.map((point, index) => ({
    ...point,
    x:
      left +
      (data.length === 1
        ? (width - left - right) / 2
        : (index / (data.length - 1)) * (width - left - right)),
    y: top + (1 - Math.max(0, point.sessions) / max) * (height - top - bottom),
  }))
  const coords = points.map((point) => `${point.x},${point.y}`).join(' ')
  return (
    <Box minW={0}>
      <Box
        overflowX="auto"
        tabIndex={0}
        role="region"
        aria-label="Reading progression chart; scroll horizontally on small screens"
      >
        <Box
          as="svg"
          viewBox={`0 0 ${width} ${height}`}
          w="full"
          minW="480px"
          role="img"
          aria-label={data.map((point) => `${point.label}: ${point.sessions} sessions`).join('; ')}
        >
          {Array.from({ length: 5 }, (_, index) => (max / 4) * index).map((tick) => {
            const y = top + (1 - tick / max) * (height - top - bottom)
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
          <polygon
            points={`${coords} ${points[points.length - 1].x},${height - bottom} ${points[0].x},${height - bottom}`}
            fill="var(--chakra-colors-action-primary)"
            opacity="0.08"
          />
          <polyline
            points={coords}
            fill="none"
            stroke="var(--chakra-colors-action-primary)"
            strokeWidth="3"
          />
          {points.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="var(--chakra-colors-bg-page)"
                stroke="var(--chakra-colors-action-primary)"
                strokeWidth="3"
              />
              <text
                x={point.x}
                y={point.y - 14}
                textAnchor="middle"
                fill="var(--chakra-colors-text-primary)"
                fontSize="14"
              >
                {formatAnalyticsInteger(point.sessions)}
              </text>
              <text
                x={point.x}
                y={height - 12}
                textAnchor="middle"
                fill="var(--chakra-colors-text-muted)"
                fontSize="13"
              >
                {point.label}
              </text>
            </g>
          ))}
        </Box>
      </Box>
      <Box as="details" mt={2}>
        <Box as="summary" cursor="pointer" color="text.secondary" fontSize="sm" py={2}>
          Reading-progress values
        </Box>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Progress</Th>
              <Th isNumeric>Sessions</Th>
              <Th isNumeric>Share</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((point) => (
              <Tr key={point.label}>
                <Td>{point.label}</Td>
                <Td isNumeric>{formatAnalyticsInteger(point.sessions)}</Td>
                <Td isNumeric>{formatAnalyticsPercent(point.rate)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}
