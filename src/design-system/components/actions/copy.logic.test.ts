import { describe, expect, it } from 'vitest'

import {
  copyAnnouncement,
  copyLabel,
  copyLiveRegion,
  copyReducer,
  idleCopyState,
} from './copy.logic'

describe('shared copy action state', () => {
  it('moves through copy success and exposes visible and announced feedback', () => {
    const copying = copyReducer(idleCopyState, { type: 'copy' })
    const copied = copyReducer(copying, { type: 'succeeded' })

    expect(copying.status).toBe('copying')
    expect(copied.status).toBe('copied')
    expect(copyLabel(copied.status, 'email address')).toBe('Copied')
    expect(copyAnnouncement(copied.status, 'email address')).toBe(
      'The email address is on your clipboard',
    )
    expect(copyLiveRegion(copied.status)).toEqual({ role: 'status', 'aria-live': 'polite' })
  })

  it('moves through copy failure and gives the reader a recovery instruction', () => {
    const copying = copyReducer(idleCopyState, { type: 'copy' })
    const failed = copyReducer(copying, { type: 'failed' })

    expect(failed.status).toBe('failed')
    expect(copyLabel(failed.status, 'email address')).toBe('Copy failed')
    expect(copyAnnouncement(failed.status, 'email address')).toBe(
      'We could not copy the email address. Select it to copy it by hand.',
    )
    expect(copyLiveRegion(failed.status)).toEqual({ role: 'alert', 'aria-live': 'assertive' })
  })

  it('ignores stale results after the state has reset', () => {
    expect(copyReducer(idleCopyState, { type: 'succeeded' })).toBe(idleCopyState)
    expect(copyReducer(idleCopyState, { type: 'failed' })).toBe(idleCopyState)
  })
})
