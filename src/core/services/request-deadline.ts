/**
 * Shared request-deadline primitive for the HTTP layer.
 *
 * The bug this exists to fix: a backend that drops packets instead of
 * refusing a connection leaves a `fetch` pending forever - no response, no
 * rejection, nothing for a `.catch()` to ever see. Every existing error and
 * retry state (see `usePublicSeriesList`, `HomePage`'s `ErrorState`) is
 * correct, but unreachable, because nothing bounds how long a request is
 * allowed to take.
 *
 * `createRequestDeadline` gives every request built on top of it an
 * `AbortSignal` that fires on its own after `timeoutMs`, so a stuck request
 * rejects like any other failure and those states get to do their job.
 *
 * This lives in one place and is shared by both HTTP clients in this layer
 * (`ApiService` and `AuthTransport`) rather than being reimplemented per
 * caller, and rather than being pushed down into individual hooks.
 */

export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000

/**
 * Budget for requests that carry a file body. The default 10s is sized for
 * lightweight JSON reads; a 2MB thumbnail on a slow mobile connection needs
 * far longer, so capping an upload at the JSON budget would turn a fix for
 * hung reads into a broken upload. Callers can still override per request.
 */
export const UPLOAD_REQUEST_TIMEOUT_MS = 60_000

export interface RequestDeadlineOptions {
  /**
   * Override the default budget. Pass a larger value for requests that are
   * legitimately expected to take longer than a normal JSON read/write -
   * for example a media upload - since a fixed one-size budget would abort
   * those prematurely. A value of `0` (or less) disables the deadline
   * entirely for that request.
   */
  timeoutMs?: number
  /**
   * An external, caller-owned signal - e.g. a component unmounting or a
   * route change cancelling in-flight work. Combined with the internal
   * deadline so either can end the request, without the two being
   * confused for one another (see `isDeadlineTimeout` / `isCallerAbort`).
   */
  signal?: AbortSignal
}

export interface RequestDeadline {
  /** Pass this straight through as `fetch`'s `signal` option. */
  signal: AbortSignal | undefined
  /** The budget that was actually applied (for building a timeout message). */
  timeoutMs: number
  /** Clears the underlying timer. Always call this once the request settles. */
  release: () => void
}

export const createRequestDeadline = (options: RequestDeadlineOptions = {}): RequestDeadline => {
  const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS

  if (!(timeoutMs > 0)) {
    return { signal: options.signal, timeoutMs, release: () => {} }
  }

  const deadline = new AbortController()
  const timer = setTimeout(() => {
    deadline.abort(new DOMException(`Request timed out after ${timeoutMs}ms`, 'TimeoutError'))
  }, timeoutMs)

  const signal = options.signal
    ? AbortSignal.any([deadline.signal, options.signal])
    : deadline.signal

  return {
    signal,
    timeoutMs,
    release: () => clearTimeout(timer),
  }
}

/**
 * True when `error` is this module's own deadline firing - the request
 * simply never answered in time. Distinct from `isCallerAbort`: a deadline
 * expiry is a real failure the UI should surface (with retry), whereas a
 * caller abort is a deliberate cancellation that should usually be ignored.
 */
export const isDeadlineTimeout = (error: unknown): error is DOMException =>
  error instanceof DOMException && error.name === 'TimeoutError'

/**
 * True when `error` is an `AbortError` raised by the caller's own signal
 * (component unmount, navigation away, etc.) rather than by the deadline.
 * Mirrors the convention already used in `ClientSeoSync.tsx` for its own
 * `AbortController`, so callers that compose a `signal` into a request can
 * keep swallowing their own cancellations instead of showing an error state
 * for what is normal navigation.
 */
export const isCallerAbort = (error: unknown): error is DOMException =>
  error instanceof DOMException && error.name === 'AbortError'
