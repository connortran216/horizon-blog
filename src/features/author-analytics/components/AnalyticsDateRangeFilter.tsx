import { Button, ButtonGroup, HStack, Input, Stack, Text } from '@chakra-ui/react'
import { AnalyticsDateRange } from '../author-analytics.types'
import { AnalyticsRangePreset, createAnalyticsRangePreset } from '../author-analytics.visualization'

interface AnalyticsDateRangeFilterProps {
  range: AnalyticsDateRange
  onRangeChange: (range: AnalyticsDateRange) => void
}

const presets: Array<{ label: string; value: AnalyticsRangePreset }> = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
]

const AnalyticsDateRangeFilter = ({ range, onRangeChange }: AnalyticsDateRangeFilterProps) => {
  return (
    <Stack
      direction={{ base: 'column', lg: 'row' }}
      spacing={4}
      align={{ base: 'stretch', lg: 'center' }}
      justify="space-between"
      border="1px solid"
      borderColor="border.subtle"
      bg="bg.secondary"
      borderRadius="2xl"
      p={4}
    >
      <ButtonGroup size="sm" variant="ghost" isAttached={false} flexWrap="wrap" gap={2}>
        {presets.map((preset) => (
          <Button
            key={preset.value}
            color="text.secondary"
            bg="bg.tertiary"
            _hover={{ bg: 'action.subtle', color: 'text.primary' }}
            onClick={() => onRangeChange(createAnalyticsRangePreset(preset.value))}
          >
            {preset.label}
          </Button>
        ))}
      </ButtonGroup>

      <HStack spacing={3} align="center">
        <Text fontSize="sm" color="text.tertiary">
          UTC
        </Text>
        <Input
          type="date"
          value={range.from}
          max={range.to}
          size="sm"
          borderRadius="lg"
          aria-label="Analytics start date"
          onChange={(event) =>
            onRangeChange({
              ...range,
              from: event.target.value,
            })
          }
        />
        <Input
          type="date"
          value={range.to}
          min={range.from}
          size="sm"
          borderRadius="lg"
          aria-label="Analytics end date"
          onChange={(event) =>
            onRangeChange({
              ...range,
              to: event.target.value,
            })
          }
        />
      </HStack>
    </Stack>
  )
}

export default AnalyticsDateRangeFilter
