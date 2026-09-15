/**
 * `canStartAuthorization` is the one rule standing between a signed-in reader
 * opening `/oauth/authorize?request_id=...` and a code being minted for
 * whoever registered that id. These tests exist because that rule used to
 * live only inside a `useEffect` that fired on page load - see
 * `McpAuthorizePage.tsx`'s doc comment - and a rule that only a rendered
 * component can exercise is a rule a reviewer has to trust rather than run.
 */

import { describe, expect, it } from 'vitest'

import {
  canStartAuthorization,
  mcpAuthorizationFailureMessage,
  mcpConsentCopy,
  mcpDeclineConfirmation,
  mcpMissingRequestMessage,
  type McpBridgeState,
} from './mcpAuthorize.logic'

describe('canStartAuthorization', () => {
  it('allows the call from the state the reader reaches by choosing to continue', () => {
    expect(canStartAuthorization('awaiting_consent')).toBe(true)
  })

  it('allows a retry after a failed attempt - nothing was granted the first time', () => {
    expect(canStartAuthorization('failed')).toBe(true)
  })

  const blocked: McpBridgeState[] = [
    'checking',
    'login_required',
    'missing_request',
    'connecting',
    'authorized',
    'declined',
  ]

  it.each(blocked)('refuses to start from %s', (state) => {
    expect(canStartAuthorization(state)).toBe(false)
  })

  it('refuses a second call while the first is still in flight', () => {
    // The state the component sets synchronously before the API call and
    // holds until the promise settles.
    expect(canStartAuthorization('connecting')).toBe(false)
  })

  it('refuses to mint a second code once one has already been issued', () => {
    // Covers a reader who backs onto this page after already being
    // redirected away with a code.
    expect(canStartAuthorization('authorized')).toBe(false)
  })
})

describe('mcpConsentCopy', () => {
  const copy = mcpConsentCopy()
  // "MCP client" is the generic term this whole feature already uses for the
  // kind of thing that can hold a code (see `McpAuthorizationSuccess`'s
  // "Return to MCP client") - it names no particular application. What must
  // never appear is a specific identity: a name, a scope list or a logo,
  // none of which `/oauth/authorize/complete` sends back.
  const invented = ['scope', 'Scope', 'logo', 'permission list']

  it('names no scope, logo or permission list the server never sent', () => {
    const combined = `${copy.title} ${copy.detail} ${copy.unverifiedWarning}`

    for (const word of invented) {
      expect(combined).not.toContain(word)
    }
  })

  it('states plainly that the requesting application has not been verified', () => {
    expect(copy.unverifiedWarning.toLowerCase()).toContain('not verified')
  })

  it('tells the reader access is granted to their Horizon account if they continue', () => {
    expect(copy.detail.toLowerCase()).toContain('horizon')
  })

  it('offers an explicit refusal, not just an affirmative action', () => {
    expect(copy.declineLabel.toLowerCase()).toMatch(/don't allow|deny|decline|cancel/)
  })
})

describe('failure and decline copy', () => {
  it('does not say whether the request was missing, expired or already used', () => {
    const message = mcpAuthorizationFailureMessage()

    for (const detail of ['expired', 'already used', 'missing', '404', '410', '409']) {
      expect(message.toLowerCase()).not.toContain(detail)
    }
    expect(message).toContain('Nothing was granted')
  })

  it('the missing-request message is distinct from the failed-attempt message', () => {
    expect(mcpMissingRequestMessage()).not.toEqual(mcpAuthorizationFailureMessage())
  })

  it('the decline confirmation states plainly that nothing was granted', () => {
    expect(mcpDeclineConfirmation().toLowerCase()).toContain('nothing was shared')
  })
})
