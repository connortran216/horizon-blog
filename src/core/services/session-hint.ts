/**
 * Session hint.
 *
 * A single persisted flag that answers one question before any network call is
 * made: has this browser ever held a session for this site? The access token
 * itself stays in memory and the refresh token stays in an httpOnly cookie -
 * neither is readable here - so the hint is the only client-side evidence that
 * asking the server for a refresh is worth a round-trip.
 *
 * It is deliberately three-valued. Storage can be missing (server render) or
 * throw (private mode, blocked site data), and neither of those is evidence
 * that the visitor is signed out. Only a readable storage with no hint in it
 * is.
 */

export const SESSION_HINT_STORAGE_KEY = 'horizon_blog_session_hint'

const SESSION_HINT_VALUE = '1'

/** The slice of `Storage` this module needs, so tests can pass a plain object. */
export interface SessionHintStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type SessionHintState = 'present' | 'absent' | 'unknown'

/** The three operations bound to one storage, for injection into a service. */
export interface SessionHint {
  markSessionPresent(): void
  clearSessionHint(): void
  hasSessionHint(): boolean
}

const getDefaultStorage = (): SessionHintStorage | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    return window.localStorage
  } catch {
    // Accessing the property itself throws when site data is blocked.
    return undefined
  }
}

export const readSessionHint = (
  storage: SessionHintStorage | undefined = getDefaultStorage(),
): SessionHintState => {
  if (!storage) {
    return 'unknown'
  }

  try {
    return storage.getItem(SESSION_HINT_STORAGE_KEY) === SESSION_HINT_VALUE ? 'present' : 'absent'
  } catch {
    return 'unknown'
  }
}

/**
 * True unless the hint is known to be absent. `unknown` reads as true so that
 * an unreadable storage costs a refresh attempt rather than a signed-out user.
 */
export const hasSessionHint = (
  storage: SessionHintStorage | undefined = getDefaultStorage(),
): boolean => readSessionHint(storage) !== 'absent'

export const markSessionPresent = (
  storage: SessionHintStorage | undefined = getDefaultStorage(),
): void => {
  if (!storage) {
    return
  }

  try {
    storage.setItem(SESSION_HINT_STORAGE_KEY, SESSION_HINT_VALUE)
  } catch {
    // A hint that cannot be written reads back as `unknown`, which is the
    // same behaviour as having no hint module at all.
  }
}

export const clearSessionHint = (
  storage: SessionHintStorage | undefined = getDefaultStorage(),
): void => {
  if (!storage) {
    return
  }

  try {
    storage.removeItem(SESSION_HINT_STORAGE_KEY)
  } catch {
    // Signing out must finish even when storage refuses the write.
  }
}

/**
 * Binds the three operations to one storage. Passing nothing resolves the
 * browser storage lazily on every call, so a module-level instance is safe to
 * create before `window` exists.
 */
export const createSessionHint = (storage?: SessionHintStorage): SessionHint => ({
  markSessionPresent: () => markSessionPresent(storage ?? getDefaultStorage()),
  clearSessionHint: () => clearSessionHint(storage ?? getDefaultStorage()),
  hasSessionHint: () => hasSessionHint(storage ?? getDefaultStorage()),
})

export const sessionHint = createSessionHint()
