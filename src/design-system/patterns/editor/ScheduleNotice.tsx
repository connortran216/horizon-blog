/**
 * Horizon Design System v2 - the schedule notice.
 *
 * The banner an author sees on a draft that already has a publication time, and
 * the row that same draft occupies in a list. It replaces the legacy
 * `ActiveScheduleNotice` and the schedule half of `ProfileScheduledRow`.
 *
 * `horizon-blog-dsv2.6.2` acceptance 1 lives here: a scheduled publication is
 * still a draft. The badge says "Draft · scheduled", the headline says "This
 * draft is scheduled to publish", and the detail says no reader can open it
 * yet. All three come from `publicationCopy`, which is tested for exactly that
 * wording, so a well-meaning edit to "Published on Tuesday" fails a test rather
 * than shipping.
 *
 * The three time registers - exact, timezone, relative - are all rendered. The
 * relative phrase is the useful one and the exact time is the checkable one;
 * neither is sufficient alone.
 */

import type { ReactNode } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { FiAlertTriangle, FiCalendar, FiUploadCloud } from 'react-icons/fi'
import type { IconType } from 'react-icons'

import { componentTokens, space } from '../../../theme/tokens'
import { Stack } from '../../components/layout'
import { StatusBadge } from '../../components/status'
import { Heading, Metadata, Text } from '../../components/typography'
import { feedbackToneTokens } from '../../components/feedback'
import {
  publicationCopy,
  scheduleState,
  scheduleSummary,
  type ScheduleState,
} from './schedule.logic'

const icons: Record<ScheduleState, IconType> = {
  scheduled: FiCalendar,
  publishing: FiUploadCloud,
  needsAttention: FiAlertTriangle,
}

const tones = {
  scheduled: 'empty',
  publishing: 'success',
  needsAttention: 'error',
} as const

export interface ScheduleNoticeProps {
  /** The stored `scheduled_publish_at`, as the API returned it. */
  scheduledAt: string
  /** Injected so the state is deterministic in the gallery and in tests. */
  now?: Date
  locale?: string
  timeZone?: string
  /** Reschedule, publish now, cancel - supplied by the caller. */
  actions?: ReactNode
  /** Drop the headline for a compact row inside a list. */
  compact?: boolean
}

export function ScheduleNotice({
  scheduledAt,
  now,
  locale,
  timeZone,
  actions,
  compact = false,
}: ScheduleNoticeProps) {
  const state = scheduleState({ scheduledAt, now })
  const copy = publicationCopy(state)
  const summary = scheduleSummary({ scheduledAt, now, locale, timeZone })
  const Icon = icons[state]
  const { bg, fg } = feedbackToneTokens(tones[state])

  return (
    <Flex
      // A schedule that slips into `needsAttention` while the author is looking
      // at the page is worth interrupting for: the post they believed was going
      // out has not gone out.
      role={state === 'needsAttention' ? 'alert' : 'status'}
      aria-live={state === 'needsAttention' ? 'assertive' : 'polite'}
      gap={space[3]}
      align="flex-start"
      bg={bg}
      borderRadius={componentTokens.feedback.radius}
      padding={space[4]}
    >
      <Box as={Icon} aria-hidden="true" color={fg} flexShrink={0} mt={space[1]} />

      <Stack gap={2} flex="1" minW="0">
        <Flex align="center" gap={space[2]} flexWrap="wrap">
          <StatusBadge tone={copy.tone}>{copy.badge}</StatusBadge>
          {compact ? null : (
            <Heading recipe="cardTitle" as="h3">
              {copy.headline}
            </Heading>
          )}
        </Flex>

        {summary.isReadable ? (
          <>
            <Text recipe="body" color="text.primary" fontWeight="semibold">
              {summary.exact}
            </Text>
            <Metadata as="p">
              <Box as="span">{summary.zone}</Box>
              <Box as="span" aria-hidden="true">
                ·
              </Box>
              <Box as="span">{summary.relative}</Box>
            </Metadata>
          </>
        ) : (
          <Text recipe="body">{summary.exact}</Text>
        )}

        <Text recipe="metadata">{copy.detail}</Text>

        {actions === undefined ? null : (
          <Flex gap={space[2]} flexWrap="wrap" marginBlockStart={space[1]}>
            {actions}
          </Flex>
        )}
      </Stack>
    </Flex>
  )
}
