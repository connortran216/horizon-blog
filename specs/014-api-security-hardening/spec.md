# Feature Specification: API Security Hardening

## Overview

Horizon's frontend must support the backend security contract without recreating sensitive rules in UI code. Registration becomes a verify-email journey, Google account conflicts become a safe recoverable state, password/email/deletion operations require fresh proof, anonymous engagement stops sending authoritative visitor IDs, and rate/request-budget failures receive clear bounded UX.

The backend remains authoritative for account state, proof validity, session revocation, authorization, and abuse controls.

## User Scenarios & Testing

### Complete verified registration (P1)

As a new user, I register, see a neutral check-email state, verify through the link, and then sign in.

**Acceptance scenarios**:

1. Registration success never treats the user as authenticated and never installs an access token.
2. The pending page does not reveal whether an address already existed.
3. A verification link displays loading, success, invalid/expired, rate-limited, and resend paths.
4. Login with correct credentials for an unverified account offers resend without exposing that state for arbitrary emails.

### Handle Google account conflict safely (P1)

As a user whose Google email matches a different Horizon login method, I receive a calm conflict message and can return to normal login or password recovery without an implicit merge.

**Acceptance scenarios**:

1. Existing linked Google users retain the normal callback journey.
2. `oauth_account_conflict` creates no local authenticated state.
3. UI copy never names another provider subject or claims an account was linked.

### Reauthenticate for sensitive account actions (P1)

As a signed-in user, I can change password, request email change, or delete my account only after fresh password or Google proof.

**Acceptance scenarios**:

1. Password-backed users enter the current password in a reauthentication step before the selected action.
2. Google-only users complete a fresh Google flow and return to the same selected action without proof in the URL.
3. Proof stays only in memory, is submitted once, and is cleared on success, expiry, cancellation, navigation, or error.
4. Password/email change success signs the user out and explains that a fresh login is required.
5. Deletion requires explicit confirmation, handles last-admin conflict, and clears local auth state after success.

### Recover clearly from abuse and request limits (P2)

As a user, I receive actionable retry guidance without the UI looping, replaying mutations, or revealing security policy internals.

**Acceptance scenarios**:

1. `429` disables repeated submit until the retry window or a safe manual retry.
2. `413` reports that the selected input/upload is too large before another automatic attempt.
3. Auth and sensitive mutation requests are never automatically replayed after a rate, proof, or verification error.
4. Error states preserve safe form fields but clear passwords, tokens, and proofs.

### Use media and engagement with the hardened contract (P2)

As an author or reader, I can use supported images and anonymous interactions without managing security identifiers.

**Acceptance scenarios**:

1. Media pickers accept JPEG/PNG and reject SVG before upload with direct copy.
2. Backend `415` remains handled in case client validation is bypassed.
3. Analytics and reaction requests stop generating or sending `visitor_id`; credentialed cookie transport remains enabled.
4. Existing rendered SVG URLs continue to display according to backend compatibility behavior.

## Functional Requirements

- **FR-001**: Registration must consume the backend pending response and must not install auth state or navigate as an authenticated user.
- **FR-002**: Verification and resend UI must preserve enumeration-resistant copy and must keep tokens only in page memory.
- **FR-003**: The Google callback must map the sanitized account-conflict code without creating a session or inventing provider details.
- **FR-004**: Sensitive account actions must use backend-issued action-bound proof and must never accept a normal access token as sufficient UI evidence.
- **FR-005**: Password and proof inputs must never enter persistent browser storage, URLs, analytics, logs, BroadcastChannel, or reusable global state.
- **FR-006**: Password policy feedback must match the backend contract of 12-128 characters without treating frontend validation as authoritative.
- **FR-007**: Successful password change, confirmed email change, and deletion must clear access state and settle signed out.
- **FR-008**: Pending email change must continue displaying the current account email until backend confirmation succeeds.
- **FR-009**: Frontend services must migrate from legacy user-by-ID mutation routes to the approved `/users/me` account-security endpoints.
- **FR-010**: `429`, `413`, proof expiry/replay, verification expiry, Google conflict, duplicate email, and last-admin conflict must have explicit status-aware handling.
- **FR-011**: Mutation requests in this feature must never be automatically retried by the generic `401` refresh pipeline after the request body or proof may have been consumed; the service must use the approved one-attempt semantics.
- **FR-012**: SVG must be removed from client upload accept lists and validation while existing media rendering remains unchanged.
- **FR-013**: Analytics and reaction clients must stop sending `visitor_id`; the API's HttpOnly visitor cookie remains opaque to JavaScript.
- **FR-014**: The UI must reuse the existing calm auth shell, semantic tokens, accessible labels, explicit non-color states, and minimal motion.
- **FR-015**: No new production dependency, route redesign, backend behavior, provider-linking UI, or deployment action is authorized by this spec.

## Key States

- **Registration pending**: Neutral completion state after registration or resend.
- **Verification result**: Verifying, verified, invalid/expired, rate-limited, or transport failure.
- **Google account conflict**: Signed-out callback result with safe recovery actions.
- **Sensitive action intent**: Password change, email change, or deletion selected by the user.
- **Reauthentication proof**: Ephemeral action-bound value held only while completing one action.
- **Pending email confirmation**: New address submitted but current identity unchanged.
- **Retry window**: Rate-limited UI state derived from sanitized backend response.

## Edge Cases

- Verification page is opened twice or after the user has already verified.
- Resend is rate-limited or mail delivery fails after a generic pending response.
- Auth state expires during reauthentication or sensitive submission.
- Google reauthentication returns to a closed tab or a different action.
- Proof expires while the user edits a password/email form.
- Password change succeeds but the response is lost; later refresh fails and must settle signed out.
- Browser back navigation exposes a stale sensitive form.
- Existing media contains SVG even though new upload validation rejects it.

## Assumptions

- Backend contract in `horizon-blog-be/specs/009-api-security-hardening/contracts/api-security-hardening.md` is approved before production code changes.
- Existing AuthSessionService remains the sole browser session coordinator.
- Sensitive action pages live in the existing profile/account feature family and do not require a new design system.
- Browser requests continue to include credentials so backend visitor and refresh cookies work.

## Out of Scope

- General social-provider linking/unlinking settings.
- MFA, passkeys, CAPTCHA, device management, or bot challenges.
- Showing rate-limit counters or security implementation details.
- SVG conversion/sanitization or rewriting existing content.
- Backend, Cloudflare, mail, migration, deployment, commit, or push operations.

## Success Criteria

- **SC-001**: Registration tests prove zero access-token installation and zero authenticated navigation before verification.
- **SC-002**: Verification, resend, conflict, and sensitive-action states have independent success/error tests with accessible copy.
- **SC-003**: All proof/token/password storage tests find zero writes to localStorage, sessionStorage, IndexedDB, URL, channel messages, or logs.
- **SC-004**: Password/email/deletion services call only approved endpoints and submit each proof-bound mutation at most once.
- **SC-005**: All successful credential/identity mutations settle signed out and never claim immediate access-token revocation beyond backend guarantees.
- **SC-006**: Media upload UI submits no SVG and analytics/reaction payloads contain no `visitor_id`.
- **SC-007**: Existing login, Google-linked login, refresh, `401`/`403`, RBAC, editor autosave, public reading, and existing media rendering regression tests remain green.

## Implementation Gates

1. Backend registration, proof, email-change, deletion, error, and deprecation contracts are approved.
2. Product copy for verification, Google conflict, reauthentication, sign-out, and deletion is approved.
3. Backend endpoints are available in test/staging before frontend compatibility removal.
4. Implementation, commit, deployment, and production rollout require separate authorization.
