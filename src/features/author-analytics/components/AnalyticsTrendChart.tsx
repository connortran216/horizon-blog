import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { AnalyticsTrendPoint } from '../author-analytics.types'
import { buildTrendPolyline } from '../author-analytics.visualization'

interface AnalyticsTrendChartProps {
  title: string
  points: AnalyticsTrendPoint[]
  metric?: keyof Pick<AnalyticsTrendPoint, 'views' | 'heartsReceived' | 'shares' | 'completed'>
}

const width = 320
const height = 120

const AnalyticsTrendChart = ({ title, points, metric = 'views' }: AnalyticsTrendChartProps) => {
  const chartPoints = points.map((point) => ({ date: point.date, value: point[metric] }))
  const polyline = buildTrendPolyline(chartPoints, { width, height })
  const latest = chartPoints.length > 0 ? chartPoints[chartPoints.length - 1] : undefined

  return (
    <Box border="1px solid" borderColor="border.subtle" bg="bg.secondary" borderRadius="2xl" p={5}>
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="baseline">
          <Text fontWeight="semibold" color="text.primary">
            {title}
          </Text>
          <Text fontSize="sm" color="text.tertiary">
            {latest ? `Latest: ${latest.value}` : 'No trend yet'}
          </Text>
        </HStack>

        <Box as="figure" aria-label={`${title} trend`} role="img">
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="140">
            <line
              x1="0"
              y1={height}
              x2={width}
              y2={height}
              stroke="var(--chakra-colors-border-subtle)"
            />
            {polyline ? (
              <polyline
                points={polyline}
                fill="none"
                stroke="var(--chakra-colors-action-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </svg>
        </Box>
      </VStack>
    </Box>
  )
}

export default AnalyticsTrendChart
