# Story: Signed-In Participation

**Project**: Horizon Blog Frontend
**Service**: Comments feature
**Dependencies**: Public discussion and authenticated create API
**Blockers**: None after backend contract

## Context

Signed-in readers need a low-friction plain-text composer, while signed-out readers need a reliable return-to-discussion login path.

## Acceptance Criteria

- Blank and over-limit content is rejected locally.
- One UUID is reused across retries for one intended contribution.
- Top-level and depth-1 replies show composers; depth 2 does not.
- Successful creation is visibly confirmed without duplicate IDs.

## Verify and Pass

- Composer, service, reducer, and repository tests cover validation and retries.

## Technical Approach

Keep pending submission identity in hook state and apply list changes only after success.

## Definition of Done

Authenticated creation and reply flows pass focused tests.
