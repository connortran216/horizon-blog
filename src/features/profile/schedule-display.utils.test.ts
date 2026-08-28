import { describe, expect, it } from 'vitest'
import {
  formatScheduleExact,
  formatScheduleRelative,
  formatScheduleTimezone,
  getScheduleDisplayState,
} from './schedule-display.utils'

const now = new Date('2026-08-27T02:00:00Z')

describe('scheduled publication display', () => {
  it('derives scheduled, publishing, and needs-attention states without persistence', () => {
    expect(getScheduleDisplayState('2026-08-27T03:00:00Z', now)).toBe('scheduled')
    expect(getScheduleDisplayState('2026-08-27T01:57:00Z', now)).toBe('publishing')
    expect(getScheduleDisplayState('2026-08-27T01:54:59Z', now)).toBe('needs_attention')
    expect(getScheduleDisplayState('not-a-date', now)).toBe('needs_attention')
  })

  it('never renders a negative relative time for a due publication', () => {
    expect(formatScheduleRelative('2026-08-27T01:57:00Z', now)).toBe('Publishing now')
    expect(formatScheduleRelative('2026-08-27T01:54:59Z', now)).toBe('Publication overdue')
  })

  it('formats exact local time and offset with an explicit timezone', () => {
    expect(formatScheduleExact('2026-08-28T02:00:00Z', 'en-US', 'Asia/Ho_Chi_Minh')).toContain(
      '09:00',
    )
    expect(formatScheduleTimezone('2026-08-28T02:00:00Z', 'Asia/Ho_Chi_Minh')).toBe(
      'GMT+7 · Asia/Ho_Chi_Minh',
    )
  })
})
