# Feature Specification: Authentication Session Lifecycle

## Overview

Horizon Blog's web application must participate in the standard authentication lifecycle defined by the backend: hold the short-lived access token only while the application is running, restore the session through the protected refresh cookie, coordinate refresh safely, and keep authentication failure distinct from authorization denial.

The browser never reads or persists the refresh credential. The backend remains the source of truth for session validity and RBAC remains a separate feature.

## User Scenarios & Testing

### Sign in and stay signed in (P1)

As a Horizon user, I can sign in with password, registration, or Google and continue using the application across normal reloads while my refresh session is active.

**Acceptance scenarios**:

1. Password login or registration stores the returned access credential only in application memory and shows the authenticated user.
2. Google sign-in returns to Horizon without a token in the callback URL and joins the same session restoration flow.
3. Reload starts in a loading state, obtains a new access credential through the protected cookie, and then loads the current user.
4. Public pages remain available when restoration finds no valid session.

### Refresh once and retry safely (P1)

As a signed-in user, an expired access credential is renewed without duplicate refresh operations or repeated API mutations.

**Acceptance scenarios**:

1. Several requests receiving authentication failure at the same time share one refresh operation in the current application context.
2. A successfully refreshed request is retried at most once with the new access credential, including mutation and upload requests.
3. If another request already installed a newer token, an older failed request retries with the newer token instead of rotating again.
4. Refresh transport cannot recursively trigger itself.

### Use multiple tabs without false replay (P1)

As a user with more than one Horizon tab, concurrent restoration or access expiry does not cause both tabs to rotate the shared refresh cookie independently.

**Acceptance scenarios**:

1. Same-origin tabs coordinate ownership of refresh before one tab uses the cookie.
2. The successful tab shares only ephemeral access/logout state; the refresh credential is never broadcast or persisted.
3. A waiting tab consumes the coordinated result and does not submit the stale cookie.
4. If coordination or the server session fails, all affected tabs settle into an explicit signed-out state rather than retrying indefinitely.

### Log out clearly (P1)

As a signed-in user, I can log out and the application requests server revocation before clearing local authentication state.

**Acceptance scenarios**:

1. Logout calls the backend cookie endpoint and clears memory/state even when the network response fails.
2. Other same-origin tabs receive the logout state without receiving any refresh credential.
3. The UI does not claim server logout succeeded when the request failed; it explains that local sign-out completed.

### Preserve Authorization semantics (P1)

As an authenticated user, losing permission does not look like an expired session.

**Acceptance scenarios**:

1. `401` may trigger the single refresh attempt and ultimately sign the user out if restoration fails.
2. `403` never triggers refresh, never clears the access credential, and renders the approved access-denied behavior.
3. Public optional-auth requests may fall back to guest behavior only when the caller explicitly marks that mode.

## Functional Requirements

- **FR-001**: The browser must keep access credentials only in memory and must not write them to localStorage, sessionStorage, IndexedDB, URL state, or other persistent JavaScript-readable storage.
- **FR-002**: The browser must never read, copy, log, broadcast, or manually delete the refresh credential; it must use credentialed requests to the backend cookie endpoints.
- **FR-003**: Session bootstrap must begin in a loading state, attempt refresh, and load `/users/me` only after access restoration succeeds.
- **FR-004**: Authentication requests that rely on the refresh cookie must include browser credentials and follow exact backend Origin/CORS rules.
- **FR-005**: The application must coordinate concurrent `401` responses into one refresh promise per JavaScript context.
- **FR-006**: Same-origin tabs must coordinate refresh so a shared rotating cookie is submitted by only one tab at a time.
- **FR-007**: Each original request may be retried at most once, with a newly constructed request body suitable for JSON, FormData, and existing supported methods.
- **FR-008**: Login, registration, refresh, logout, password-reset, and other authentication transports must opt out of the generic refresh retry to prevent recursion.
- **FR-009**: If the access credential has changed since an original request was sent, the request must use the current credential before starting another refresh.
- **FR-010**: A failed refresh must clear authentication state and emit one session-expired transition, not one transition per failed request.
- **FR-011**: A `403` response must never refresh or clear the session.
- **FR-012**: Public guest fallback must be an explicit per-request mode and must not apply automatically to all GET requests.
- **FR-013**: Logout must call the backend asynchronously, clear in-memory state in a guaranteed cleanup path, and notify other tabs without persisting a credential.
- **FR-014**: Google callback handling must not parse or accept a Horizon access token from the URL and must reject unsafe post-login destinations.
- **FR-015**: The browser must remove the legacy localStorage token during migration and must not exchange it directly for a refresh session.
- **FR-016**: Existing localStorage-only sessions may require one new login; the UI must handle that transition without a crash or refresh loop.
- **FR-017**: The frontend must never include raw access/refresh credentials, cookies, authorization headers, passwords, or reset credentials in logs, analytics, error telemetry, or user-visible diagnostics.
- **FR-018**: No proactive refresh timer is required for this version; reactive `401` refresh remains authoritative.
- **FR-019**: The implementation must remain compatible with the staged backend rollout and must be deployed before the backend starts issuing 15-minute access credentials.

## Key Entities

- **Access-token store**: An in-memory holder for the current access credential and optional expiry metadata.
- **Session coordinator**: The only client boundary allowed to install/clear access credentials and perform login, refresh, or logout transitions.
- **Refresh lock**: A same-origin coordination primitive that selects one tab to use the shared refresh cookie.
- **Authentication mode**: Request metadata distinguishing required authentication, optional authentication, and authentication-transport requests.

## Edge Cases

- Two requests receive `401` before either starts refresh.
- A request receives `401` after another request already refreshed and replaced the access credential.
- Two tabs bootstrap simultaneously from one rotating cookie.
- The refresh response is interrupted after backend rotation committed.
- The tab holding the cross-tab refresh lock closes.
- A FormData mutation must be reconstructed for its one allowed retry.
- Logout fails over the network, leaving an HttpOnly cookie JavaScript cannot remove.
- Google callback loads before AuthContext finishes restoration.
- An authenticated API request returns `403` while other requests remain valid.

## Assumptions

- The API and frontend run on configured HTTPS origins in production.
- The support baseline for this lifecycle is a modern browser with Web Locks and BroadcastChannel. If either coordination primitive is unavailable or fails, Horizon must fail closed into an explicit re-login path instead of risking concurrent cookie rotation.
- The backend owns the refresh cookie and returns the target access-response contract.
- RBAC private context is loaded with the current-user response but is not encoded in access credentials.
- Existing visual authentication layouts remain the design baseline; this feature changes lifecycle behavior rather than introducing a new visual system.

## Out of Scope

- Device or session-management UI.
- Displaying token details or expiry countdowns to users.
- Persisting access credentials for offline use.
- Proactive timer-based refresh.
- A full backend-for-frontend proxy that hides access tokens from all browser JavaScript.
- Changes to the RBAC role/permission matrix.
- MCP host credential storage or OAuth implementation.

## Success Criteria

- **SC-001**: Automated storage tests find no access-token writes outside the in-memory store and no client access to the refresh cookie.
- **SC-002**: Reload with a valid session restores the user; reload without one renders public/signed-out state without a loop.
- **SC-003**: Any number of simultaneous same-context `401`s causes one refresh and at most one retry per request.
- **SC-004**: Two-tab restoration produces one cookie refresh operation in supported-browser integration testing.
- **SC-005**: `403` tests retain the authenticated state in every affected feature.
- **SC-006**: Login, registration, Google callback, reload, refresh failure, and logout journeys pass in automated and manual browser checks.
- **SC-007**: Credential-leakage tests find no raw secret in logs, analytics, errors, URL history, storage, or snapshots.
- **SC-008**: Type-check, lint, tests, and production build pass before backend access lifetime is shortened.

## Implementation Gate

Before implementation:

1. The linked backend API/cookie contract and rollout sequence must be approved.
2. Existing localStorage users requiring one new login must be accepted as the migration behavior.
3. Backend and frontend deployment order must preserve refresh compatibility before the 15-minute TTL cutover.
