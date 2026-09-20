import { describe, expect, it, vi } from 'vitest'

import {
  SESSION_HINT_STORAGE_KEY,
  SessionHintStorage,
  clearSessionHint,
  createSessionHint,
  hasSessionHint,
  isOAuthCallbackPath,
  markSessionPresent,
  readSessionHint,
} from './session-hint'

const createMemoryStorage = (): SessionHintStorage => {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

const createThrowingStorage = (): SessionHintStorage => ({
  getItem: () => {
    throw new Error('storage is blocked')
  },
  setItem: () => {
    throw new Error('storage is blocked')
  },
  removeItem: () => {
    throw new Error('storage is blocked')
  },
})

describe('session hint', () => {
  it('reports an empty readable storage as a visitor who never signed in', () => {
    const storage = createMemoryStorage()

    expect(readSessionHint(storage)).toBe('absent')
    expect(hasSessionHint(storage)).toBe(false)
  })

  it('marks and clears the hint under one namespaced key', () => {
    const storage = createMemoryStorage()

    markSessionPresent(storage)
    expect(storage.getItem(SESSION_HINT_STORAGE_KEY)).toBe('1')
    expect(readSessionHint(storage)).toBe('present')
    expect(hasSessionHint(storage)).toBe(true)

    clearSessionHint(storage)
    expect(storage.getItem(SESSION_HINT_STORAGE_KEY)).toBeNull()
    expect(hasSessionHint(storage)).toBe(false)
  })

  it('treats a foreign value under the key as no hint', () => {
    const storage = createMemoryStorage()
    storage.setItem(SESSION_HINT_STORAGE_KEY, 'something-else')

    expect(readSessionHint(storage)).toBe('absent')
  })

  it('reads a throwing storage as unknown rather than crashing', () => {
    const storage = createThrowingStorage()

    expect(readSessionHint(storage)).toBe('unknown')
    expect(hasSessionHint(storage)).toBe(true)
    expect(() => markSessionPresent(storage)).not.toThrow()
    expect(() => clearSessionHint(storage)).not.toThrow()
  })

  it('reads a missing storage as unknown', () => {
    expect(readSessionHint(undefined)).toBe('unknown')
    expect(hasSessionHint(undefined)).toBe(true)
    expect(() => markSessionPresent(undefined)).not.toThrow()
    expect(() => clearSessionHint(undefined)).not.toThrow()
  })

  it('binds the three operations to one storage', () => {
    const storage = createMemoryStorage()
    const hint = createSessionHint(storage)

    expect(hint.hasSessionHint()).toBe(false)
    hint.markSessionPresent()
    expect(hint.hasSessionHint()).toBe(true)
    hint.clearSessionHint()
    expect(hint.hasSessionHint()).toBe(false)
  })

  it('resolves storage on every call when none is injected', () => {
    const getItem = vi.fn(() => '1')
    const originalWindow = (globalThis as { window?: unknown }).window

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: { getItem, setItem: vi.fn(), removeItem: vi.fn() } },
    })

    try {
      expect(createSessionHint().hasSessionHint()).toBe(true)
      expect(getItem).toHaveBeenCalledWith(SESSION_HINT_STORAGE_KEY)
    } finally {
      if (originalWindow === undefined) {
        Reflect.deleteProperty(globalThis, 'window')
      } else {
        Object.defineProperty(globalThis, 'window', {
          configurable: true,
          value: originalWindow,
        })
      }
    }
  })
})

describe('isOAuthCallbackPath', () => {
  it('recognises the Google callback route, with or without a trailing slash', () => {
    expect(isOAuthCallbackPath('/login/callback')).toBe(true)
    expect(isOAuthCallbackPath('/login/callback/')).toBe(true)
  })

  it('does not match the login page, the home page or a prefix', () => {
    expect(isOAuthCallbackPath('/login')).toBe(false)
    expect(isOAuthCallbackPath('/')).toBe(false)
    expect(isOAuthCallbackPath('/login/callback/extra')).toBe(false)
  })
})
