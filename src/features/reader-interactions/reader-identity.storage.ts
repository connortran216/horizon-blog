export const READER_VISITOR_ID_STORAGE_KEY = 'horizon_blog_visitor_id'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export interface ReaderIdentityStorageOptions {
  storage?: Storage
  generateId?: () => string
}

export interface ReaderIdentityStorage {
  getOrCreateVisitorId: () => string
  clearVisitorId: () => void
}

export const isValidVisitorId = (value: string | null | undefined): value is string =>
  typeof value === 'string' && UUID_PATTERN.test(value)

const getDefaultStorage = () => {
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

const generateUuid = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (character) => {
    const randomValue = crypto.getRandomValues(new Uint8Array(1))[0]
    const value = Number(character) ^ (randomValue & (15 >> (Number(character) / 4)))
    return value.toString(16)
  })
}

export const createReaderIdentityStorage = (
  options: ReaderIdentityStorageOptions = {},
): ReaderIdentityStorage => {
  const storage = options.storage ?? getDefaultStorage()
  const generateId = options.generateId ?? generateUuid

  const readStoredVisitorId = () => {
    if (!storage) return null

    try {
      return storage.getItem(READER_VISITOR_ID_STORAGE_KEY)
    } catch {
      return null
    }
  }

  const writeVisitorId = (visitorId: string) => {
    if (!storage) return

    try {
      storage.setItem(READER_VISITOR_ID_STORAGE_KEY, visitorId)
    } catch {
      // Reading must continue even when storage is blocked.
    }
  }

  return {
    getOrCreateVisitorId: () => {
      const stored = readStoredVisitorId()
      if (isValidVisitorId(stored)) return stored

      const visitorId = generateId()
      if (!isValidVisitorId(visitorId)) {
        throw new Error('Generated visitor ID must be a UUID')
      }

      writeVisitorId(visitorId)
      return visitorId
    },
    clearVisitorId: () => {
      if (!storage) return

      try {
        storage.removeItem(READER_VISITOR_ID_STORAGE_KEY)
      } catch {
        // No-op when storage is unavailable.
      }
    },
  }
}
