# Story 02: Owner Series Management

**Project**: Horizon Blog Frontend
**Service**: Series feature
**Dependencies**: Backend owner series contract and public story foundation
**Blockers**: None after typed adapter/service foundation

## Context

Authors need explicit series CRUD/order controls and a lightweight membership choice during publication review.

## Acceptance Criteria

- Protected management route supports create, edit, delete, add, remove, and reorder.
- Mutations retain the latest confirmed server state on failure.
- Publication review selects zero or one series and saves membership before publication.
- Controls have labels, visible focus, and non-color status cues.

## Definition of Done

- Owner service/component tests pass.
- Type check, lint, and build pass.
