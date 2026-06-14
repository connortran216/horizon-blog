# Story 03: Batch Analytics Delivery

**Dependencies**: None
**Owns**: reader session and event transport modules

## Acceptance Criteria

- Routine progress and active-time events share one 30-second delivery interval.
- View starts once and existing event payload semantics remain unchanged.
- At most one flush request is in flight.
- Failed eligible events retain bounded retry behavior.
- Page hide, exit, link, and successful share triggers remain non-blocking.

## Validation

- Fake-timer tests prove routine request frequency.
- Deferred-promise tests prove single-flight delivery and queued-event retention.
- Existing activity, link, retry, progress, and event tests remain green.

## Definition of Done

- [x] T015-T022 complete.
- [x] Reader-interaction tests pass.
- [x] Commit and validation recorded in `checklist.md`.
