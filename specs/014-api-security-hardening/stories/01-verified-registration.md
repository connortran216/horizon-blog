# Story 01: Verified Registration

**Project**: Horizon Blog Frontend
**Service**: Auth
**Dependencies**: Backend pending/verify/resend contract
**Blockers**: Approved copy and backend compatibility stage

## Context

Registration no longer creates a session. Users need a neutral check-email and verification journey that does not leak account existence.

## Acceptance Criteria

- Registration installs no auth state.
- Verification/resend handle success, expiry, failure, and rate limit.
- Unverified login and Google conflict remain signed out.
- Tokens/passwords never persist.

## Verify and Pass

- Service, context, route, storage, and accessibility tests pass.
- Existing linked Google login and normal login remain green.

## Definition of Done

The frontend slice is deployed before backend verification enforcement and evidence is recorded.
