# Story: Public Discussion

**Project**: Horizon Blog Frontend
**Service**: Public reader
**Dependencies**: Backend public list contract
**Blockers**: Backend endpoint availability

## Context

Comments extend the reading experience but must remain isolated from article loading and layout.

## Acceptance Criteria

- Discussion renders after reader interactions in the central column.
- Guest reads, cursor loads, reply expansion, tombstones, and local retries work.
- Plain text is never treated as markup.
- Article content survives all comment failures.

## Verify and Pass

- Feature component tests and the reader failure-isolation regression pass.

## Technical Approach

Use a feature-local hook and unboxed editorial components mounted through one optional reader-frame slot.

## Definition of Done

Signed-out readers can browse discussion without any article regression.
