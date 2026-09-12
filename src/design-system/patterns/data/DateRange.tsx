/**
 * Horizon Design System v2 - the analytics date range.
 *
 * Preset spans plus a custom pair. It replaces the legacy
 * `AnalyticsDateRangeFilter`.
 *
 * The timezone is stated, not implied. The analytics API works in UTC and the
 * author does not, so a range that silently means "UTC days" will be read as
 * local days and the numbers will look wrong at the edges. The label is beside
 * the fields, and the presets say which zone they were computed in.
 *
 * The presets are `radio`s in a `radiogroup` rather than a row of buttons: they
 * are mutually exclusive choices with a current value, arrow keys should move
 * between them, and the chosen one needs a state a screen reader announces.
 */

import { Box, Flex } from '@chakra-ui/react'

import { componentTokens, radii, space, transitionFor } from '../../../theme/tokens'
import { Field, Input } from '../../components/forms'
import { Stack } from '../../components/layout'
import { Text } from '../../components/typography'

export interface DateRangePreset {
  /** Stable key: `7d`, `30d`, `90d`, `custom`. */
  readonly key: string
  readonly label: string
}

export interface DateRangeValue {
  /** `YYYY-MM-DD`. */
  readonly from: string
  /** `YYYY-MM-DD`. */
  readonly to: string
}

export interface DateRangeProps {
  presets: readonly DateRangePreset[]
  activePreset: string
  onPresetChange: (key: string) => void
  value: DateRangeValue
  onValueChange: (value: DateRangeValue) => void
  /** Which preset key opens the two date fields. */
  customPresetKey?: string
  /** The zone the range is measured in. Stated, never assumed. */
  timeZoneLabel?: string
  /** The most recent day the data covers. Caps the "to" field. */
  maxDate?: string
  isDisabled?: boolean
}

export function DateRange({
  presets,
  activePreset,
  onPresetChange,
  value,
  onValueChange,
  customPresetKey = 'custom',
  timeZoneLabel = 'UTC',
  maxDate,
  isDisabled = false,
}: DateRangeProps) {
  const showsCustom = activePreset === customPresetKey
  // A range whose end is before its start returns nothing and reads as a data
  // outage. Reporting it here is cheaper than explaining an empty dashboard.
  const isInverted = value.from !== '' && value.to !== '' && value.from > value.to

  return (
    <Stack
      as="section"
      gap={4}
      padding={space[4]}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={componentTokens.card.border}
      borderRadius={radii.card}
      bg={componentTokens.card.bg}
    >
      <Flex role="radiogroup" aria-label="Date range" gap={space[2]} flexWrap="wrap" align="center">
        {presets.map((preset) => {
          const isActive = preset.key === activePreset

          return (
            <Flex
              key={preset.key}
              as="label"
              align="center"
              gap={space[2]}
              minH={componentTokens.control.minTouchTarget}
              paddingInline={space[3]}
              borderRadius={radii.tag}
              borderWidth="1px"
              borderStyle="solid"
              borderColor={isActive ? componentTokens.control.solidBg : componentTokens.card.border}
              bg={isActive ? componentTokens.control.quietHoverBg : 'transparent'}
              color={isActive ? 'text.primary' : componentTokens.control.quietFg}
              transition={`${transitionFor('background-color', 'fast')}, ${transitionFor('border-color', 'fast')}`}
              cursor={isDisabled ? 'not-allowed' : 'pointer'}
            >
              <Box
                as="input"
                type="radio"
                name="analytics-date-range"
                value={preset.key}
                checked={isActive}
                disabled={isDisabled}
                onChange={() => onPresetChange(preset.key)}
              />
              <Text recipe="metadata" as="span" color="inherit" fontWeight="medium">
                {preset.label}
              </Text>
            </Flex>
          )
        })}

        <Text recipe="metadata" as="span" marginInlineStart="auto">
          Measured in {timeZoneLabel}
        </Text>
      </Flex>

      {showsCustom ? (
        <Flex gap={space[4]} flexWrap="wrap">
          <Box flex="1" minW={space[24]}>
            <Field label={`From (${timeZoneLabel})`} isDisabled={isDisabled}>
              <Input
                type="date"
                value={value.from}
                max={value.to || maxDate}
                onChange={(event) => onValueChange({ ...value, from: event.target.value })}
              />
            </Field>
          </Box>
          <Box flex="1" minW={space[24]}>
            <Field
              label={`To (${timeZoneLabel})`}
              isDisabled={isDisabled}
              error={isInverted ? 'The end date is before the start date.' : undefined}
            >
              <Input
                type="date"
                value={value.to}
                min={value.from}
                max={maxDate}
                onChange={(event) => onValueChange({ ...value, to: event.target.value })}
              />
            </Field>
          </Box>
        </Flex>
      ) : null}
    </Stack>
  )
}
