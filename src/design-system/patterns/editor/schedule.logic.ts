/**
 * Horizon Design System v2 - publication and scheduling decisions.
 *
 * `horizon-blog-dsv2.6.2` acceptance 1: a scheduled publication remains a draft
 * with a timestamp.
 *
 * That is not a copy preference. It is what the backend does: scheduling writes
 * a `scheduled_publish_at` onto a post that is still a draft, and a worker
 * publishes it later. Until that worker runs, the post is not public, its URL
 * does not resolve for a reader, and cancelling the schedule leaves an ordinary
 * draft behind - see `src/features/profile/schedule-display.utils.ts` and
 * `src/features/editor/pages/PublishBlogPage.tsx`.
 *
 * So every string this module produces about a scheduled post says "draft", and
 * `publicationCopy` is tested for exactly that. Copy that said "published on
 * Tuesday" would be describing something that has not happened, to an author
 * who would then stop checking.
 */

/**
 * How long after its timestamp a schedule is still expected to be publishing
 * rather than stuck. It matches `SCHEDULE_GRACE_PERIOD_MS` in
 * `src/features/profile/schedule-display.utils.ts`, which is the window the
 * production worker is given. It is a parameter as well as a default, so a
 * caller that knows better can say so instead of forking this module.
 */
export const SCHEDULE_GRACE_MS = 5 * 60 * 1000

/* -------------------------------------------------------------------------- */
/* Validity                                                                   */
/* -------------------------------------------------------------------------- */

export type ScheduleInvalidReason = 'missing' | 'unparseable' | 'past'

export interface ScheduleValidityInput {
  /** `YYYY-MM-DD`, from a native date input. */
  readonly date?: string
  /** `HH:MM`, from a native time input. */
  readonly time?: string
  readonly now?: Date
}

export interface ScheduleValidity {
  readonly isValid: boolean
  readonly reason: ScheduleInvalidReason | null
  /** The chosen moment, or `null`. Local time, as the inputs are. */
  readonly value: Date | null
  /** What to say under the fields. `null` while nothing is wrong. */
  readonly message: string | null
}

/**
 * Whether a date and a time make a publishable moment.
 *
 * Three ways it fails, and they need different words: the author has not
 * finished filling the fields in, the browser produced something that is not a
 * date at all, or the moment has already passed. "Choose a date and time in the
 * future" is unhelpful for the first of those and wrong for the second.
 *
 * The comparison is against `now` passed in rather than read from the clock,
 * so the boundary is testable and so a form validated at submit time uses the
 * same moment the request will carry.
 */
export function scheduleValidity({
  date,
  time,
  now = new Date(),
}: ScheduleValidityInput): ScheduleValidity {
  if (!date || !time) {
    return {
      isValid: false,
      reason: 'missing',
      value: null,
      message: 'Choose both a date and a time.',
    }
  }

  const value = new Date(`${date}T${time}`)

  if (!Number.isFinite(value.getTime())) {
    return {
      isValid: false,
      reason: 'unparseable',
      value: null,
      message: 'That is not a date and time we can use. Check both fields.',
    }
  }

  if (value.getTime() <= now.getTime()) {
    return {
      isValid: false,
      reason: 'past',
      value,
      message: 'Choose a moment in the future. A past time would publish immediately.',
    }
  }

  return { isValid: true, reason: null, value, message: null }
}

/* -------------------------------------------------------------------------- */
/* Schedule state                                                             */
/* -------------------------------------------------------------------------- */

export type ScheduleState =
  /** In the future. Waiting. */
  | 'scheduled'
  /** Its moment has arrived and the worker has not finished yet. */
  | 'publishing'
  /** Overdue past the grace window, or a timestamp that cannot be read. */
  | 'needsAttention'

export interface ScheduleStateInput {
  readonly scheduledAt: string
  readonly now?: Date
  readonly graceMs?: number
}

/**
 * Where a schedule is relative to now.
 *
 * `needsAttention` covers both an overdue schedule and an unreadable timestamp,
 * because from the author's side they demand the same thing: look at this post,
 * something is not right. Guessing which of the two it is - and telling the
 * author the backend has failed when the string might simply be malformed -
 * would be an invention.
 */
export function scheduleState({
  scheduledAt,
  now = new Date(),
  graceMs = SCHEDULE_GRACE_MS,
}: ScheduleStateInput): ScheduleState {
  const moment = new Date(scheduledAt)

  if (!Number.isFinite(moment.getTime())) {
    return 'needsAttention'
  }

  const elapsed = now.getTime() - moment.getTime()

  if (elapsed < 0) {
    return 'scheduled'
  }

  return elapsed <= graceMs ? 'publishing' : 'needsAttention'
}

/* -------------------------------------------------------------------------- */
/* Publication copy                                                           */
/* -------------------------------------------------------------------------- */

export type PublicationState = 'draft' | 'scheduled' | 'publishing' | 'needsAttention' | 'published'

export interface PublicationCopy {
  /** The badge text. Short, and truthful about draft-ness. */
  readonly badge: string
  readonly tone: 'neutral' | 'success' | 'warning' | 'danger'
  /** The sentence a panel leads with. */
  readonly headline: string
  /** One sentence of consequence. */
  readonly detail: string
  /** True while the post is not yet readable by the public. */
  readonly isDraft: boolean
}

/**
 * What each publication state is called, and what it means.
 *
 * The scheduled entry is the one that matters. Its badge is "Draft · scheduled"
 * and its detail says the post is not public yet, because that is the state of
 * the record. The legacy notice says "This blog is scheduled. It will go live
 * ..." which is true but leads with the wrong noun; an author skimming a list
 * of posts reads the badge, not the sentence.
 */
export function publicationCopy(state: PublicationState): PublicationCopy {
  switch (state) {
    case 'published':
      return {
        badge: 'Published',
        tone: 'success',
        headline: 'This post is published',
        detail: 'Readers can open it now. Editing it changes what they see.',
        isDraft: false,
      }

    case 'scheduled':
      return {
        badge: 'Draft · scheduled',
        tone: 'neutral',
        headline: 'This draft is scheduled to publish',
        detail:
          'It is still a draft and no reader can open it yet. Editing the content does not cancel the schedule.',
        isDraft: true,
      }

    case 'publishing':
      return {
        badge: 'Draft · publishing',
        tone: 'warning',
        headline: 'This draft is being published now',
        detail: 'Its scheduled moment has arrived. Give it a minute, then reload.',
        isDraft: true,
      }

    case 'needsAttention':
      return {
        badge: 'Draft · needs attention',
        tone: 'danger',
        headline: 'This draft did not publish at its scheduled time',
        detail: 'It is still a draft. Reschedule it, or publish it now.',
        isDraft: true,
      }

    case 'draft':
    default:
      return {
        badge: 'Draft',
        tone: 'neutral',
        headline: 'This post is a draft',
        detail: 'Only you can see it. Publish it, or choose a time for it to go live.',
        isDraft: true,
      }
  }
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export interface ScheduleSummaryInput {
  readonly scheduledAt: string
  readonly now?: Date
  readonly locale?: string
  readonly timeZone?: string
}

export interface ScheduleSummary {
  /** "Tue, 3 Mar, 09:00". The moment, spelled out. */
  readonly exact: string
  /** "GMT+7 · Asia/Ho_Chi_Minh". Which clock the moment is on. */
  readonly zone: string
  /** "in 3 days". Approximate, and never the only thing shown. */
  readonly relative: string
  readonly isReadable: boolean
}

/**
 * A schedule in three registers.
 *
 * All three are rendered together on purpose. The exact time is the fact; the
 * timezone is what stops an author in Ho Chi Minh City reading a UTC timestamp
 * as local; and the relative phrase is the one they can act on without doing
 * arithmetic. Showing only the relative phrase would leave "in 2 days" with no
 * way to check which day that is.
 */
export function scheduleSummary({
  scheduledAt,
  now = new Date(),
  locale,
  timeZone,
}: ScheduleSummaryInput): ScheduleSummary {
  const moment = new Date(scheduledAt)

  if (!Number.isFinite(moment.getTime())) {
    return {
      exact: 'Scheduled time unavailable',
      zone: 'Timezone unavailable',
      relative: 'Check this schedule',
      isReadable: false,
    }
  }

  const exact = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(moment)

  const resolvedZone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const offset = new Intl.DateTimeFormat('en', {
    timeZone: resolvedZone,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(moment)
    .find((part) => part.type === 'timeZoneName')?.value

  return {
    exact,
    zone: offset ? `${offset} · ${resolvedZone}` : resolvedZone,
    relative: relativeMoment(moment, now),
    isReadable: true,
  }
}

/**
 * "in 3 days", "in 20 minutes", "2 hours ago".
 *
 * The unit steps up as the distance grows, because "in 4320 minutes" is
 * technically an answer and practically not one. Minutes round up so a schedule
 * 30 seconds away reads as "in 1 minute" rather than "in 0 minutes".
 */
function relativeMoment(moment: Date, now: Date): string {
  const deltaMs = moment.getTime() - now.getTime()
  const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const magnitude = Math.abs(deltaMs)
  const sign = deltaMs < 0 ? -1 : 1

  if (magnitude < 3_600_000) {
    return relative.format(sign * Math.max(1, Math.ceil(magnitude / 60_000)), 'minute')
  }

  if (magnitude < 86_400_000) {
    return relative.format(sign * Math.round(magnitude / 3_600_000), 'hour')
  }

  return relative.format(sign * Math.round(magnitude / 86_400_000), 'day')
}

/* -------------------------------------------------------------------------- */
/* Publish gating                                                             */
/* -------------------------------------------------------------------------- */

export type PublishMode = 'now' | 'schedule'

export interface PublishGateInput {
  readonly mode: PublishMode
  readonly hasTitle?: boolean
  readonly hasContent?: boolean
  readonly schedule?: ScheduleValidity
  readonly isSubmitting?: boolean
  /** A verb phrase: "publish this post". Its presence means denied. */
  readonly deniedAction?: string
}

export interface PublishGateOutput {
  readonly canSubmit: boolean
  /** The submit label. Names the outcome, not the button. */
  readonly submitLabel: string
  /** Announced while the request is in flight. */
  readonly submittingLabel: string
  /** Why the button will not act, or `null`. */
  readonly blockedReason: string | null
}

/**
 * Whether the publish action may fire.
 *
 * The blocking reasons are ordered by what the author should fix first:
 * permission, then the missing content, then the schedule. A form that reported
 * the schedule problem to somebody who is not allowed to publish at all would
 * send them off to fix the wrong thing.
 */
export function publishGate({
  mode,
  hasTitle = false,
  hasContent = false,
  schedule,
  isSubmitting = false,
  deniedAction,
}: PublishGateInput): PublishGateOutput {
  const labels =
    mode === 'now'
      ? { submitLabel: 'Publish now', submittingLabel: 'Publishing' }
      : { submitLabel: 'Schedule this draft', submittingLabel: 'Saving the schedule' }

  const blockedReason =
    deniedAction !== undefined
      ? `You do not have permission to ${deniedAction}.`
      : !hasTitle
        ? 'Add a title before publishing.'
        : !hasContent
          ? 'Add some writing before publishing.'
          : mode === 'schedule' && schedule !== undefined && !schedule.isValid
            ? schedule.message
            : null

  return {
    ...labels,
    canSubmit: blockedReason === null && !isSubmitting,
    blockedReason,
  }
}
