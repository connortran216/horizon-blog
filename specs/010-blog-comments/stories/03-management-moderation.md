# Story: Management and Moderation

**Project**: Horizon Blog Frontend
**Service**: Comments feature
**Dependencies**: Participation flow and backend capabilities
**Blockers**: None

## Context

The UI should present only actions the backend authorizes and keep destructive changes deliberate.

## Acceptance Criteria

- Edit/remove/reply controls match capability flags.
- Removal requires confirmation and maps leaf/tombstone results correctly.
- Owners can close/reopen comments; closed discussion remains readable.
- Failed mutations preserve the current discussion.

## Verify and Pass

- Capability matrix and state-transition component tests pass.

## Technical Approach

Use small action components and pure reducer transitions driven by successful server responses.

## Definition of Done

Owner and commenter workflows pass focused tests and accessibility checks.
