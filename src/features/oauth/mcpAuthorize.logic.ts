/**
 * The MCP authorization bridge's consent guard and copy - the decisions,
 * without the DOM.
 *
 * `/oauth/authorize/complete` is the one irreversible step this screen can
 * take: it mints an authorization code for whichever client registered
 * `request_id` and hands the browser a redirect that carries it away. Nothing
 * about *when* that call is allowed to fire should live only inside a JSX
 * click handler, because a click handler cannot be exercised by a test in a
 * repository that renders nothing to a DOM - so the one rule that matters
 * ("only from a state the reader reached by pressing 'Allow access', and only
 * once") is a plain function here instead.
 *
 * The copy is pulled out for the same reason `authFailureCopy` is pulled out
 * of the sign-in screens: so the exact sentence is one importable value a
 * test can assert on, rather than a string that only exists inside rendered
 * markup.
 */

/**
 * Every state `McpAuthorizePage` can be in, in the order a reader normally
 * passes through them. `missing_request` and `login_required` both end the
 * flow before consent is ever shown - there is nothing to agree to yet.
 */
export type McpBridgeState =
  | 'checking'
  | 'login_required'
  | 'missing_request'
  | 'awaiting_consent'
  | 'connecting'
  | 'authorized'
  | 'declined'
  | 'failed'

/**
 * Whether pressing "Allow access" right now may start the authorization
 * call.
 *
 * True from `awaiting_consent` (the ordinary path) and from `failed` (the
 * reader is retrying after a failed attempt - nothing was granted the first
 * time, so a second press is a fresh request, not a duplicate one). False
 * everywhere else, in particular `connecting` - the call this state exists to
 * gate is already in flight - and `authorized` - a code already exists and
 * pressing the button again would ask the server to mint a second one for a
 * request it may already treat as spent.
 *
 * This is checked twice on purpose: the component disables the button while
 * `connecting`, which stops a slow second click, and it disables the button
 * while `authorized`, which stops a reader who backed onto this page after
 * being redirected away. This function is the single source both checks
 * defer to, and it is also what the click handler itself re-checks before
 * calling the API - the defence against the one case neither disabled state
 * catches: two `click` events far enough apart in the same tick that the
 * first has not yet re-rendered the button.
 */
export function canStartAuthorization(state: McpBridgeState): boolean {
  return state === 'awaiting_consent' || state === 'failed'
}

export interface McpConsentCopy {
  /** Names the request. Never a client name - the server does not send one. */
  readonly title: string
  /** What pressing "Allow access" does. */
  readonly detail: string
  /**
   * The one fact this screen adds that a login prompt would not: identity was
   * not checked. It is a warning, not decoration - the reader should be more
   * careful here, not less.
   */
  readonly unverifiedWarning: string
  readonly allowLabel: string
  readonly declineLabel: string
}

/**
 * The consent screen's copy.
 *
 * Every sentence here is true regardless of which client asked, because
 * `/oauth/authorize/complete` returns nothing that could make one sentence
 * true for one client and false for another - it returns a redirect URI and
 * nothing else. That is also why there is no `clientName` parameter on this
 * function: the day the endpoint starts returning one, this signature changes
 * to take it, and until then nothing here may be built to look as though it
 * already has it.
 */
export function mcpConsentCopy(): McpConsentCopy {
  return {
    title: 'A request wants access to your Horizon account',
    detail:
      'Choosing "Allow access" lets it act as you on Horizon. Only continue if you started this yourself, in an MCP client you trust.',
    unverifiedWarning:
      'Horizon has not verified which application is making this request. Be more cautious here than you would signing in normally - if you did not just start this from an MCP client, choose "Don\'t allow".',
    allowLabel: 'Allow access',
    declineLabel: "Don't allow",
  }
}

/**
 * The failed-attempt message.
 *
 * Deliberately as unspecific about *why* as the sign-in failure copy is: it
 * never says whether `request_id` was missing, expired or already used,
 * because those three look identical to an attacker probing which is which
 * and identical to a reader who just wants to know what to do next - "try
 * again" is the right instruction for all three.
 */
export function mcpAuthorizationFailureMessage(): string {
  return 'We could not complete this authorization. Nothing was granted. You can try again, or restart the connection from your MCP client.'
}

/** The missing-`request_id` message. A malformed link, not a failed attempt. */
export function mcpMissingRequestMessage(): string {
  return 'This link is missing information Horizon needs to continue. Restart the connection from your MCP client.'
}

/** What the decline confirmation says. Read after `bridgeState` becomes `'declined'`. */
export function mcpDeclineConfirmation(): string {
  return 'Nothing was shared. No access was granted to the request that brought you here.'
}
