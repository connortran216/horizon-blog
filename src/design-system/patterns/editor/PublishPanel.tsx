/**
 * Horizon Design System v2 - the publish panel.
 *
 * Choose now or later, pick the moment, and commit. It replaces the settings
 * column of the legacy `PublishBlogPage`.
 *
 * The mode choice is a real `radiogroup` of real radios inside labels, not two
 * clickable divs with a decorative radio inside them - which is what the legacy
 * page renders, and why its cards respond to a click but not to an arrow key.
 *
 * Scheduling copy says draft throughout, per `horizon-blog-dsv2.6.2` acceptance
 * 1: the submit button reads "Schedule this draft", and the confirmation under
 * it says the post stays a draft until its moment arrives.
 */

import { Box, Flex, VisuallyHidden } from '@chakra-ui/react'
import { FiCalendar, FiSend } from 'react-icons/fi'
import type { IconType } from 'react-icons'

import { componentTokens, radii, space, transitionFor } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { Field, Input } from '../../components/forms'
import { Grid, Stack } from '../../components/layout'
import { Heading, Text } from '../../components/typography'
import { publishGate, scheduleSummary, scheduleValidity, type PublishMode } from './schedule.logic'

const modes: ReadonlyArray<{
  value: PublishMode
  title: string
  detail: string
  icon: IconType
}> = [
  {
    value: 'now',
    title: 'Publish now',
    detail: 'Readers can open it as soon as you confirm.',
    icon: FiSend,
  },
  {
    value: 'schedule',
    title: 'Schedule for later',
    // Says what scheduling actually does to the record.
    detail: 'It stays a draft until the moment you pick, then publishes itself.',
    icon: FiCalendar,
  },
]

export interface PublishPanelProps {
  mode: PublishMode
  onModeChange: (mode: PublishMode) => void
  /** `YYYY-MM-DD`. */
  date: string
  onDateChange: (date: string) => void
  /** `HH:MM`. */
  time: string
  onTimeChange: (time: string) => void
  onSubmit: () => void
  hasTitle?: boolean
  hasContent?: boolean
  isSubmitting?: boolean
  /** A verb phrase: "publish this post". Its presence blocks the action. */
  deniedAction?: string
  /** A failure the request came back with. */
  submitError?: string
  /** Injected so the panel is deterministic in the gallery and in tests. */
  now?: Date
  locale?: string
  timeZone?: string
  /** The existing schedule, when this draft already has one. */
  existingScheduledAt?: string
  /** Series selection and anything else the feature adds to this column. */
  children?: React.ReactNode
}

export function PublishPanel({
  mode,
  onModeChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  onSubmit,
  hasTitle = false,
  hasContent = false,
  isSubmitting = false,
  deniedAction,
  submitError,
  now,
  locale,
  timeZone,
  existingScheduledAt,
  children,
}: PublishPanelProps) {
  const schedule = scheduleValidity({ date, time, now })
  const gate = publishGate({
    mode,
    hasTitle,
    hasContent,
    schedule,
    isSubmitting,
    deniedAction,
  })
  const chosen =
    mode === 'schedule' && schedule.value
      ? scheduleSummary({ scheduledAt: schedule.value.toISOString(), now, locale, timeZone })
      : null

  return (
    <Stack as="section" gap={6}>
      <Heading recipe="sectionTitle" as="h2">
        When should this go live?
      </Heading>

      {existingScheduledAt === undefined ? null : (
        <Text recipe="metadata" role="status" aria-live="polite">
          This draft is already scheduled.
          {mode === 'now' ? ' Publishing now replaces that schedule.' : ' Pick a new moment below.'}
        </Text>
      )}

      {children}

      <Stack as="fieldset" gap={3} role="radiogroup" aria-label="Publication timing">
        <VisuallyHidden as="legend">Publication timing</VisuallyHidden>

        {modes.map((option) => {
          const isChosen = option.value === mode

          return (
            <Flex
              key={option.value}
              as="label"
              gap={space[3]}
              align="flex-start"
              padding={space[4]}
              borderWidth="1px"
              borderStyle="solid"
              borderColor={isChosen ? componentTokens.control.solidBg : componentTokens.card.border}
              borderRadius={radii.control}
              bg={isChosen ? componentTokens.control.quietHoverBg : componentTokens.card.bg}
              transition={`${transitionFor('border-color', 'fast')}, ${transitionFor('background-color', 'fast')}`}
              cursor="pointer"
            >
              {/*
               * A real radio. It is what makes the group arrow-navigable, what
               * gives it a selected state a screen reader announces, and what
               * lets the surrounding `label` do its job.
               */}
              <Box
                as="input"
                type="radio"
                name="publication-timing"
                value={option.value}
                checked={isChosen}
                onChange={() => onModeChange(option.value)}
                marginBlockStart={space[1]}
                flexShrink={0}
              />
              <Box flex="1" minW="0">
                <Text recipe="body" as="span" color="text.primary" fontWeight="semibold">
                  {option.title}
                </Text>
                <Text recipe="metadata">{option.detail}</Text>
              </Box>
              <Box as={option.icon} aria-hidden="true" color="text.muted" flexShrink={0} />
            </Flex>
          )
        })}
      </Stack>

      {mode === 'schedule' ? (
        <Stack gap={3}>
          <Grid columns={2} gap={4} collapseAt="sm">
            <Field
              label="Publication date"
              isRequired
              error={schedule.reason === 'past' ? undefined : (schedule.message ?? undefined)}
            >
              <Input
                type="date"
                value={date}
                onChange={(event) => onDateChange(event.target.value)}
              />
            </Field>
            <Field
              label="Publication time"
              isRequired
              // The "in the past" message belongs to the pair, not to one
              // field, so it is reported once under the time rather than twice.
              error={schedule.reason === 'past' ? (schedule.message ?? undefined) : undefined}
            >
              <Input
                type="time"
                value={time}
                onChange={(event) => onTimeChange(event.target.value)}
              />
            </Field>
          </Grid>

          {chosen === null ? null : (
            <Text recipe="metadata" role="status" aria-live="polite">
              {chosen.exact} · {chosen.zone} · {chosen.relative}. It stays a draft until then.
            </Text>
          )}
        </Stack>
      ) : null}

      {gate.blockedReason === null ? null : (
        <Text recipe="metadata" color={componentTokens.field.invalidText}>
          {gate.blockedReason}
        </Text>
      )}

      {submitError === undefined ? null : (
        <Text
          recipe="metadata"
          role="alert"
          aria-live="assertive"
          color={componentTokens.field.invalidText}
        >
          {submitError}
        </Text>
      )}

      <Button
        tone="primary"
        size="lg"
        isDisabled={!gate.canSubmit && !isSubmitting}
        isLoading={isSubmitting}
        loadingLabel={gate.submittingLabel}
        onClick={onSubmit}
      >
        {gate.submitLabel}
      </Button>
    </Stack>
  )
}
