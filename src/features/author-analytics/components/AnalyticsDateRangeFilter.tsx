/**
 * The analytics date-range control - three presets plus a custom pair, composed
 * from the design system's `DateRange` pattern.
 */

import { useState } from 'react'

import { DateRange, type DateRangeValue } from '../../../design-system'
import { AnalyticsDateRange } from '../author-analytics.types'
import { AnalyticsRangePreset, createAnalyticsRangePreset } from '../author-analytics.visualization'

interface AnalyticsDateRangeFilterProps {
  range: AnalyticsDateRange
  onRangeChange: (range: AnalyticsDateRange) => void
  isDisabled?: boolean
}

const presets: Array<{ key: AnalyticsRangePreset | 'custom'; label: string }> = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: 'custom', label: 'Custom' },
]

const derivePreset = (range: AnalyticsDateRange): AnalyticsRangePreset | 'custom' => {
  const matches = (preset: AnalyticsRangePreset) => {
    const candidate = createAnalyticsRangePreset(preset)
    return candidate.from === range.from && candidate.to === range.to
  }

  if (matches('7d')) return '7d'
  if (matches('30d')) return '30d'
  if (matches('90d')) return '90d'
  return 'custom'
}

const AnalyticsDateRangeFilter = ({
  range,
  onRangeChange,
  isDisabled = false,
}: AnalyticsDateRangeFilterProps) => {
  const [customChosen, setCustomChosen] = useState(false)
  const activePreset = customChosen ? 'custom' : derivePreset(range)

  const handlePresetChange = (key: string) => {
    if (key === 'custom') {
      setCustomChosen(true)
      return
    }

    setCustomChosen(false)
    onRangeChange(createAnalyticsRangePreset(key as AnalyticsRangePreset))
  }

  const handleValueChange = (value: DateRangeValue) => {
    setCustomChosen(true)
    onRangeChange({ from: value.from, to: value.to, timezone: 'UTC' })
  }

  return (
    <DateRange
      presets={presets}
      activePreset={activePreset}
      onPresetChange={handlePresetChange}
      value={{ from: range.from, to: range.to }}
      onValueChange={handleValueChange}
      timeZoneLabel="UTC"
      isDisabled={isDisabled}
    />
  )
}

export default AnalyticsDateRangeFilter
