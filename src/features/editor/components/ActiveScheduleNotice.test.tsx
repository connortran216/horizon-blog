/**
 * Rewritten for release M6.
 *
 * The previous assertions described the legacy Chakra `Alert` - "This blog is
 * scheduled.", "Content changes do not remove the schedule." - and that markup
 * no longer exists. The composition it is replaced by makes a stronger claim
 * than the old copy did, so the test asserts that claim instead of deleting
 * itself: a scheduled post is a draft, and the banner has to say so.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { horizonTheme } from '../../../theme/horizon'
import ActiveScheduleNotice from './ActiveScheduleNotice'

const render = (scheduledAt: string, now: Date) =>
  renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <ActiveScheduleNotice scheduledAt={scheduledAt} onManage={vi.fn()} now={now} />
    </ChakraProvider>,
  )

describe('ActiveScheduleNotice', () => {
  it('calls a scheduled post a draft, and says no reader can open it yet', () => {
    const markup = render('2026-08-28T02:00:00Z', new Date('2026-08-20T02:00:00Z'))

    expect(markup).toContain('Draft · scheduled')
    expect(markup).toContain('This draft is scheduled to publish')
    expect(markup).toContain('no reader can open it yet')
    expect(markup).toContain('Editing the content does not cancel the schedule')
  })

  it('never claims a scheduled post is live or published', () => {
    const markup = render('2026-08-28T02:00:00Z', new Date('2026-08-20T02:00:00Z'))

    expect(markup).not.toMatch(/go live/i)
    expect(markup).not.toMatch(/is published/i)
  })

  it('keeps the manage action reachable while the schedule stands', () => {
    const markup = render('2026-08-28T02:00:00Z', new Date('2026-08-20T02:00:00Z'))

    expect(markup).toContain('Manage schedule')
  })

  it('interrupts when the moment has passed and the post is still a draft', () => {
    const markup = render('2026-08-28T02:00:00Z', new Date('2026-08-28T03:00:00Z'))

    expect(markup).toContain('Draft · needs attention')
    expect(markup).toContain('role="alert"')
    expect(markup).toContain('Manage schedule')
  })

  it('treats the worker as running for five minutes past the moment, and no longer', () => {
    /*
     * The grace window is `SCHEDULE_GRACE_MS` in the design system's
     * `schedule.logic`, and the editor half holds no copy of it - this is what
     * that consumption looks like from the outside. `src/features/profile`
     * still defines its own `SCHEDULE_GRACE_PERIOD_MS` with the same literal;
     * until that one re-exports the design system's, these assertions are the
     * thing that would catch the two drifting apart.
     */
    const scheduledAt = '2026-08-28T02:00:00Z'
    const fiveMinutesLater = new Date('2026-08-28T02:05:00Z')
    const aSecondAfterThat = new Date('2026-08-28T02:05:01Z')

    expect(render(scheduledAt, fiveMinutesLater)).toContain('Draft · publishing')
    expect(render(scheduledAt, aSecondAfterThat)).toContain('Draft · needs attention')
  })

  it('shows an unreadable timestamp rather than rendering nothing', () => {
    // The legacy notice returned null here, which left the author with a
    // schedule they could not see and could not cancel.
    const markup = render('not-a-timestamp', new Date('2026-08-20T02:00:00Z'))

    expect(markup).toContain('Scheduled time unavailable')
    expect(markup).toContain('Manage schedule')
  })
})
