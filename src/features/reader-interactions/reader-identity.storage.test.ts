import { describe, expect, it } from 'vitest'

import {
  createReaderIdentityStorage,
  isValidVisitorId,
  READER_VISITOR_ID_STORAGE_KEY,
} from './reader-identity.storage'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

const firstVisitorId = '11111111-1111-4111-8111-111111111111'
const secondVisitorId = '22222222-2222-4222-8222-222222222222'

describe('reader identity storage', () => {
  it('reuses a valid visitor ID from storage', () => {
    const storage = new MemoryStorage()
    storage.setItem(READER_VISITOR_ID_STORAGE_KEY, firstVisitorId)

    const identity = createReaderIdentityStorage({
      storage,
      generateId: () => secondVisitorId,
    })

    expect(identity.getOrCreateVisitorId()).toBe(firstVisitorId)
    expect(storage.getItem(READER_VISITOR_ID_STORAGE_KEY)).toBe(firstVisitorId)
  })

  it('replaces an invalid stored visitor ID with a generated UUID', () => {
    const storage = new MemoryStorage()
    storage.setItem(READER_VISITOR_ID_STORAGE_KEY, 'visitor-abc')

    const identity = createReaderIdentityStorage({
      storage,
      generateId: () => firstVisitorId,
    })

    expect(identity.getOrCreateVisitorId()).toBe(firstVisitorId)
    expect(storage.getItem(READER_VISITOR_ID_STORAGE_KEY)).toBe(firstVisitorId)
  })

  it('returns a valid generated ID when storage is unavailable', () => {
    const storage = {
      getItem: () => {
        throw new Error('storage disabled')
      },
      setItem: () => {
        throw new Error('storage disabled')
      },
    } as unknown as Storage

    const identity = createReaderIdentityStorage({
      storage,
      generateId: () => firstVisitorId,
    })

    expect(identity.getOrCreateVisitorId()).toBe(firstVisitorId)
  })

  it('validates only UUID-shaped visitor IDs', () => {
    expect(isValidVisitorId(firstVisitorId)).toBe(true)
    expect(isValidVisitorId('visitor-abc')).toBe(false)
    expect(isValidVisitorId('')).toBe(false)
  })
})
