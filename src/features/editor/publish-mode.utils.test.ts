import { describe, expect, it } from 'vitest'
import { resolvePublishMode } from './publish-mode.utils'

describe('publish page mode', () => {
  it('lets an explicit publish-now action override an active schedule', () => {
    expect(resolvePublishMode('now', true)).toBe('now')
  })

  it('prefills schedule management for reschedule and existing schedules', () => {
    expect(resolvePublishMode('schedule', true)).toBe('schedule')
    expect(resolvePublishMode(null, true)).toBe('schedule')
  })

  it('defaults an unscheduled draft to publish now', () => {
    expect(resolvePublishMode(null, false)).toBe('now')
  })
})
