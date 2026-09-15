import { describe, expect, it } from 'vitest'
import {
  backupBelongsToPost,
  draftBackupSavedAt,
  parseDraftBackup,
  resolveDraftRecovery,
  type DraftBackupPayload,
} from './draft-backup.logic'

const validBackup: DraftBackupPayload = {
  postId: 42,
  title: 'Draft title',
  contentMarkdown: '# Hello',
  contentJSON: '{}',
  tags: ['react', 'ts'],
  timestamp: '2026-08-20T02:00:00.000Z',
}

describe('parseDraftBackup', () => {
  it('parses a well-formed backup', () => {
    expect(parseDraftBackup(JSON.stringify(validBackup))).toEqual(validBackup)
  })

  it('treats a missing key as no backup', () => {
    expect(parseDraftBackup(null)).toBeNull()
  })

  it('treats an empty string as no backup', () => {
    expect(parseDraftBackup('')).toBeNull()
  })

  it('never throws on truncated JSON - a tab that closed mid-write', () => {
    const truncated = JSON.stringify(validBackup).slice(0, 20)
    expect(() => parseDraftBackup(truncated)).not.toThrow()
    expect(parseDraftBackup(truncated)).toBeNull()
  })

  it('rejects JSON that is not an object', () => {
    expect(parseDraftBackup('"just a string"')).toBeNull()
    expect(parseDraftBackup('42')).toBeNull()
    expect(parseDraftBackup('null')).toBeNull()
  })

  it('rejects a pre-recovery payload that has no postId field at all', () => {
    const { postId: _postId, ...legacyShape } = validBackup
    expect(parseDraftBackup(JSON.stringify(legacyShape))).toBeNull()
  })

  it('rejects a payload with the wrong field types', () => {
    expect(parseDraftBackup(JSON.stringify({ ...validBackup, tags: 'react,ts' }))).toBeNull()
    expect(parseDraftBackup(JSON.stringify({ ...validBackup, title: 12 }))).toBeNull()
    expect(parseDraftBackup(JSON.stringify({ ...validBackup, tags: ['react', 7] }))).toBeNull()
  })

  it('accepts postId: null - a draft that had never reached the server', () => {
    const neverSaved = { ...validBackup, postId: null }
    expect(parseDraftBackup(JSON.stringify(neverSaved))).toEqual(neverSaved)
  })
})

describe('draftBackupSavedAt', () => {
  it('reads the timestamp as epoch milliseconds', () => {
    expect(draftBackupSavedAt(validBackup)).toBe(Date.parse('2026-08-20T02:00:00.000Z'))
  })

  it('returns undefined for an unparsable timestamp rather than NaN', () => {
    expect(draftBackupSavedAt({ ...validBackup, timestamp: 'not-a-date' })).toBeUndefined()
  })
})

describe('backupBelongsToPost', () => {
  it('matches the same numeric post id', () => {
    expect(backupBelongsToPost(validBackup, 42)).toBe(true)
  })

  it('rejects a different post - this is the data-loss-prevention check', () => {
    expect(backupBelongsToPost(validBackup, 43)).toBe(false)
    expect(backupBelongsToPost(validBackup, null)).toBe(false)
  })

  it('treats postId: null as its own shared bucket for never-saved drafts', () => {
    const neverSaved = { ...validBackup, postId: null }
    expect(backupBelongsToPost(neverSaved, null)).toBe(true)
    expect(backupBelongsToPost(neverSaved, 42)).toBe(false)
  })
})

describe('resolveDraftRecovery', () => {
  const local = (overrides: Partial<DraftBackupPayload> = {}) =>
    JSON.stringify({ ...validBackup, ...overrides })

  it('offers a local backup that is newer than the server copy of the same post', () => {
    const result = resolveDraftRecovery(
      local({ timestamp: '2026-08-20T02:00:10.000Z' }),
      42,
      '2026-08-20T02:00:00.000Z',
    )

    expect(result.offersRecovery).toBe(true)
    expect(result.backup).toEqual({ ...validBackup, timestamp: '2026-08-20T02:00:10.000Z' })
    expect(result.headline).toBe('We found a newer draft kept in this browser')
  })

  it('does not offer a local backup that is older than the server copy', () => {
    const result = resolveDraftRecovery(
      local({ timestamp: '2026-08-20T01:00:00.000Z' }),
      42,
      '2026-08-20T02:00:00.000Z',
    )

    expect(result.offersRecovery).toBe(false)
    expect(result.backup).toBeNull()
  })

  it('offers a never-saved draft its own backup regardless of age', () => {
    const result = resolveDraftRecovery(local({ postId: null }), null, undefined)

    expect(result.offersRecovery).toBe(true)
    expect(result.detail).toContain('It was never saved to your account.')
  })

  it('never offers a different post - even one whose backup is newer - the wrong content', () => {
    const result = resolveDraftRecovery(
      local({ timestamp: '2026-08-20T02:00:10.000Z', postId: 42 }),
      99,
      '2026-08-20T02:00:00.000Z',
    )

    expect(result.offersRecovery).toBe(false)
    expect(result.backup).toBeNull()
  })

  it('never offers an existing post the never-saved bucket', () => {
    const result = resolveDraftRecovery(local({ postId: null }), 42, '2026-08-20T02:00:00.000Z')

    expect(result.offersRecovery).toBe(false)
    expect(result.backup).toBeNull()
  })

  it('treats corrupt JSON as no backup, not a crash', () => {
    const result = resolveDraftRecovery('{not json', 42, '2026-08-20T02:00:00.000Z')

    expect(result.offersRecovery).toBe(false)
    expect(result.backup).toBeNull()
    expect(result.headline).toBeNull()
  })

  it('treats a missing key as no backup', () => {
    const result = resolveDraftRecovery(null, 42, '2026-08-20T02:00:00.000Z')

    expect(result.offersRecovery).toBe(false)
    expect(result.backup).toBeNull()
  })

  it('treats an unparsable server timestamp as no known server save, not a crash', () => {
    const result = resolveDraftRecovery(
      local({ timestamp: '2026-08-20T02:00:10.000Z' }),
      42,
      'not-a-timestamp',
    )

    expect(result.offersRecovery).toBe(true)
  })
})
