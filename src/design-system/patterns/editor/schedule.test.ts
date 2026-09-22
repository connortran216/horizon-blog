import { describe, expect, it } from 'vitest'

import {
  SCHEDULE_GRACE_MS,
  publicationCopy,
  publicationChecks,
  publishGate,
  scheduleState,
  scheduleSummary,
  scheduleValidity,
  type PublicationState,
} from './schedule.logic'

const now = new Date('2026-03-10T09:00:00.000Z')
const at = (offsetMs: number) => new Date(now.getTime() + offsetMs).toISOString()

/**
 * `horizon-blog-dsv2.6.2` acceptance 1: a scheduled publication remains a draft
 * with a timestamp.
 *
 * These are the tests that hold the wording. They exist because the tempting
 * copy - "Published on Tuesday", "Goes live Tuesday" - is wrong about the
 * record and cannot be caught by a type.
 */
describe('publication copy', () => {
  it('calls a scheduled post a draft', () => {
    const copy = publicationCopy('scheduled')

    expect(copy.isDraft).toBe(true)
    expect(copy.badge).toBe('Draft · scheduled')
    expect(copy.headline).toContain('draft')
  })

  it('says no reader can open a scheduled post yet', () => {
    expect(publicationCopy('scheduled').detail).toContain('no reader can open it yet')
  })

  it('never describes a scheduled post as published', () => {
    const copy = publicationCopy('scheduled')

    expect(copy.badge.toLowerCase()).not.toContain('published')
    expect(copy.headline.toLowerCase()).not.toContain('is published')
  })

  it('keeps every unpublished state marked as a draft', () => {
    const drafts: PublicationState[] = ['draft', 'scheduled', 'publishing', 'needsAttention']

    for (const state of drafts) {
      const copy = publicationCopy(state)

      expect(copy.isDraft).toBe(true)
      expect(copy.badge.toLowerCase()).toContain('draft')
    }
  })

  it('is the only state that claims publication', () => {
    const copy = publicationCopy('published')

    expect(copy.isDraft).toBe(false)
    expect(copy.badge).toBe('Published')
  })

  it('tells the author that editing does not cancel a schedule', () => {
    expect(publicationCopy('scheduled').detail).toContain('does not cancel the schedule')
  })

  it('gives an overdue draft an action rather than only a diagnosis', () => {
    expect(publicationCopy('needsAttention').detail).toContain('Reschedule')
  })
})

describe('schedule validity', () => {
  it('accepts a moment in the future', () => {
    const result = scheduleValidity({ date: '2026-03-12', time: '09:00', now })

    expect(result.isValid).toBe(true)
    expect(result.message).toBeNull()
  })

  it('asks for both fields rather than complaining about the future', () => {
    const result = scheduleValidity({ date: '2026-03-12', now })

    expect(result.reason).toBe('missing')
    expect(result.message).toBe('Choose both a date and a time.')
  })

  it('separates an unreadable value from a past one', () => {
    const result = scheduleValidity({ date: 'not-a-date', time: '09:00', now })

    expect(result.reason).toBe('unparseable')
    expect(result.value).toBeNull()
  })

  it('refuses a moment that has already passed', () => {
    const result = scheduleValidity({ date: '2026-03-01', time: '09:00', now })

    expect(result.reason).toBe('past')
    expect(result.message).toContain('publish immediately')
  })

  it('refuses the present moment, which is not a schedule', () => {
    const localNow = new Date('2026-03-10T09:00:00')
    const result = scheduleValidity({ date: '2026-03-10', time: '09:00', now: localNow })

    expect(result.isValid).toBe(false)
    expect(result.reason).toBe('past')
  })

  it('keeps the parsed value for a past moment, so the field can show it back', () => {
    expect(scheduleValidity({ date: '2026-03-01', time: '09:00', now }).value).not.toBeNull()
  })
})

describe('schedule state', () => {
  it('is scheduled while the moment is still ahead', () => {
    expect(scheduleState({ scheduledAt: at(3600_000), now })).toBe('scheduled')
  })

  it('is publishing inside the worker grace window', () => {
    expect(scheduleState({ scheduledAt: at(-60_000), now })).toBe('publishing')
  })

  it('is still publishing exactly on the grace boundary', () => {
    expect(scheduleState({ scheduledAt: at(-SCHEDULE_GRACE_MS), now })).toBe('publishing')
  })

  it('needs attention once the grace window has passed', () => {
    expect(scheduleState({ scheduledAt: at(-SCHEDULE_GRACE_MS - 1), now })).toBe('needsAttention')
  })

  it('needs attention when the timestamp cannot be read', () => {
    expect(scheduleState({ scheduledAt: 'whenever', now })).toBe('needsAttention')
  })

  it('honours a grace window the caller supplies', () => {
    expect(scheduleState({ scheduledAt: at(-60_000), now, graceMs: 1000 })).toBe('needsAttention')
  })
})

describe('schedule summary', () => {
  it('gives the exact moment, the zone and the relative phrase together', () => {
    const summary = scheduleSummary({
      scheduledAt: at(3 * 86_400_000),
      now,
      locale: 'en-GB',
      timeZone: 'UTC',
    })

    expect(summary.isReadable).toBe(true)
    expect(summary.exact).toContain('Mar')
    expect(summary.zone).toContain('UTC')
    expect(summary.relative).toContain('day')
  })

  it('rounds a sub-minute wait up, so nothing reads as "in 0 minutes"', () => {
    const summary = scheduleSummary({ scheduledAt: at(30_000), now, timeZone: 'UTC' })

    expect(summary.relative).not.toContain('0 minute')
  })

  it('steps up to hours and then to days', () => {
    expect(
      scheduleSummary({ scheduledAt: at(2 * 3600_000), now, timeZone: 'UTC' }).relative,
    ).toContain('hour')
    expect(
      scheduleSummary({ scheduledAt: at(4 * 86_400_000), now, timeZone: 'UTC' }).relative,
    ).toContain('day')
  })

  it('degrades honestly when the timestamp cannot be read', () => {
    const summary = scheduleSummary({ scheduledAt: 'whenever', now })

    expect(summary.isReadable).toBe(false)
    expect(summary.exact).toBe('Scheduled time unavailable')
    expect(summary.relative).toBe('Check this schedule')
  })

  it('describes a past moment in the past tense', () => {
    expect(
      scheduleSummary({ scheduledAt: at(-2 * 86_400_000), now, timeZone: 'UTC' }).relative,
    ).toContain('ago')
  })
})

describe('publish gate', () => {
  const valid = scheduleValidity({ date: '2026-03-12', time: '09:00', now })

  it('allows an immediate publication with a title and content', () => {
    const gate = publishGate({ mode: 'now', hasTitle: true, hasContent: true })

    expect(gate.canSubmit).toBe(true)
    expect(gate.blockedReason).toBeNull()
    expect(gate.submitLabel).toBe('Publish now')
  })

  it('calls the scheduled action what it is: saving a draft schedule', () => {
    const gate = publishGate({
      mode: 'schedule',
      hasTitle: true,
      hasContent: true,
      schedule: valid,
    })

    expect(gate.submitLabel).toBe('Schedule this draft')
    expect(gate.submitLabel.toLowerCase()).not.toContain('publish')
  })

  it('reports permission before anything the author could fix by typing', () => {
    const gate = publishGate({
      mode: 'schedule',
      hasTitle: false,
      hasContent: false,
      deniedAction: 'publish this post',
    })

    expect(gate.blockedReason).toContain('permission')
    expect(gate.canSubmit).toBe(false)
  })

  it('asks for a title before it asks for content', () => {
    expect(publishGate({ mode: 'now' }).blockedReason).toBe('Add a title before publishing.')
  })

  it('surfaces the schedule problem once the post itself is ready', () => {
    const gate = publishGate({
      mode: 'schedule',
      hasTitle: true,
      hasContent: true,
      schedule: scheduleValidity({ date: '2026-03-01', time: '09:00', now }),
    })

    expect(gate.canSubmit).toBe(false)
    expect(gate.blockedReason).toContain('future')
  })

  it('ignores the schedule entirely when publishing now', () => {
    const gate = publishGate({
      mode: 'now',
      hasTitle: true,
      hasContent: true,
      schedule: scheduleValidity({ date: '', time: '', now }),
    })

    expect(gate.canSubmit).toBe(true)
  })

  it('refuses a second submission while one is in flight', () => {
    const gate = publishGate({ mode: 'now', hasTitle: true, hasContent: true, isSubmitting: true })

    expect(gate.canSubmit).toBe(false)
    expect(gate.blockedReason).toBeNull()
  })
})

describe('publication checks', () => {
  it('derives readiness from the same content, timing and Series facts as the page', () => {
    const checks = publicationChecks({
      mode: 'schedule',
      hasTitle: true,
      hasContent: false,
      schedule: scheduleValidity({ date: '2026-03-12', time: '09:00', now }),
      isSeriesReady: false,
    })

    expect(checks).toEqual([
      { id: 'title', label: 'Title', ready: true },
      { id: 'content', label: 'Writing', ready: false },
      { id: 'timing', label: 'Publication time', ready: true },
      { id: 'series', label: 'Series options', ready: false },
    ])
  })

  it('does not require schedule fields for publishing now', () => {
    expect(publicationChecks({ mode: 'now' }).find((check) => check.id === 'timing')).toEqual({
      id: 'timing',
      label: 'Publish now',
      ready: true,
    })
  })
})
