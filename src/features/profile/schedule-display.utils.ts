import { SCHEDULE_GRACE_MS } from '../../design-system'
import { ScheduleDisplayState } from './profile.types'

/**
 * One source of truth, and it is the design system's.
 *
 * This value was written out twice - here and in
 * `src/design-system/patterns/editor/schedule.logic.ts` - because the design
 * system may not import from `features`, so it could not consume a constant
 * defined here. The dependency only runs one way, which settles which copy
 * survives: `features` imports the design system, and this is now an alias.
 *
 * Both halves of release M6 reached the same conclusion independently, from
 * opposite sides of the duplicate.
 */
export const SCHEDULE_GRACE_PERIOD_MS = SCHEDULE_GRACE_MS

const toDate = (value: string): Date | null => {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

export const getScheduleDisplayState = (
  scheduledAt: string,
  now: Date = new Date(),
): ScheduleDisplayState => {
  const schedule = toDate(scheduledAt)
  if (!schedule) return 'needs_attention'

  const elapsed = now.getTime() - schedule.getTime()
  if (elapsed < 0) return 'scheduled'
  if (elapsed <= SCHEDULE_GRACE_PERIOD_MS) return 'publishing'
  return 'needs_attention'
}

export const formatScheduleExact = (
  scheduledAt: string,
  locale?: string,
  timeZone?: string,
): string => {
  const schedule = toDate(scheduledAt)
  if (!schedule) return 'Schedule unavailable'

  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(schedule)
}

export const formatScheduleTimezone = (scheduledAt: string, timeZone?: string): string => {
  const schedule = toDate(scheduledAt)
  if (!schedule) return 'Local timezone'

  const resolvedTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const offset = new Intl.DateTimeFormat('en', {
    timeZone: resolvedTimeZone,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(schedule)
    .find((part) => part.type === 'timeZoneName')?.value

  return offset ? `${offset} · ${resolvedTimeZone}` : resolvedTimeZone
}

export const formatScheduleRelative = (scheduledAt: string, now: Date = new Date()): string => {
  const schedule = toDate(scheduledAt)
  if (!schedule) return 'Check schedule'

  const deltaMs = schedule.getTime() - now.getTime()
  if (deltaMs <= 0)
    return getScheduleDisplayState(scheduledAt, now) === 'publishing'
      ? 'Publishing now'
      : 'Publication overdue'

  const minutes = Math.ceil(deltaMs / 60_000)
  const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  if (minutes < 60) return relative.format(minutes, 'minute')

  const hours = Math.round(deltaMs / 3_600_000)
  if (hours < 24) return relative.format(hours, 'hour')

  const days = Math.round(deltaMs / 86_400_000)
  return relative.format(days, 'day')
}

export const formatLastUpdated = (updatedAt: string, locale?: string): string => {
  const updated = toDate(updatedAt)
  if (!updated) return 'Updated time unavailable'

  return `Updated ${new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(updated)}`
}
