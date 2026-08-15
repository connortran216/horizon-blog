# Story 02: Sensitive Account Actions

**Project**: Horizon Blog Frontend
**Service**: Account security and profile
**Dependencies**: Backend reauthentication and account endpoints
**Blockers**: Contract/copy approval

## Context

Password, email, and deletion must move off legacy user-by-ID mutations and require a fresh one-time proof.

## Acceptance Criteria

- Password and Google-only reauthentication return to one selected action.
- Proof remains ephemeral and each mutation submits once.
- Success signs out; last-admin and proof errors are explicit.
- Legacy mutation calls are absent.

## Verify and Pass

- Adapter, service, hook, component, storage, URL, retry, and context tests pass.

## Definition of Done

All account-security flows consume approved endpoints before backend removes legacy routes.
