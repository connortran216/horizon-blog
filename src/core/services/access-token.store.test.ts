import { describe, expect, it, vi } from 'vitest'

import { AccessTokenStore } from './access-token.store'

describe('AccessTokenStore', () => {
  it('keeps access credentials only in memory', () => {
    const persistentWrite = vi.fn()
    const originalLocalStorage = globalThis.localStorage
    const originalSessionStorage = globalThis.sessionStorage

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { setItem: persistentWrite },
    })
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: { setItem: persistentWrite },
    })

    try {
      const store = new AccessTokenStore(() => 1_000)
      store.install('access-token', 900)

      expect(store.getSnapshot()).toEqual({
        token: 'access-token',
        expiresAt: 901_000,
        version: 1,
      })
      expect(persistentWrite).not.toHaveBeenCalled()
    } finally {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: originalLocalStorage,
      })
      Object.defineProperty(globalThis, 'sessionStorage', {
        configurable: true,
        value: originalSessionStorage,
      })
    }
  })

  it('increments its version when credentials change or clear', () => {
    const store = new AccessTokenStore()

    store.install('first', 10)
    store.installAbsolute('second', 20_000)
    store.clear()

    expect(store.getSnapshot()).toEqual({ token: null, expiresAt: null, version: 3 })
  })
})
