# Story 01: Freeze Fixtures and Create Frontend Foundations

**Project**: Horizon Blog Frontend  
**Service**: Reader and author feature foundations  
**Dependencies**: Approved frontend TD and backend contract fixtures  
**Blockers**: Backend Story 01 contract freeze

## Context

Frontend work can proceed safely in parallel only after event, interaction, and author DTO examples are stable. This story creates isolated types, fixtures, identity/session rules, event transport, and range helpers without touching shared integration files.

## Acceptance Criteria

- Reader and author feature types match approved backend fixtures.
- Visitor/session storage handles invalid or unavailable storage.
- Event transport batches, retries, preserves stable event IDs, and performs best-effort final flush.
- Reading-session foundations track cumulative active time and the monotonic sequence required by backend contracts.
- Range and formatting helpers preserve numeric backend semantics, including approximate unique-reader display rules.

## Interface Contracts

- Owns frontend typed fixtures.
- No later story invents or renames backend fields.

## Technical Approach

Keep reader and author foundations in separate feature modules. Use pure typed helpers and in-memory delivery state so later UI work can integrate without changing contracts.

## Non-Goals

- No reader UI, live API integration, routes, DI, or dashboard pages.

## Validation

- Verify: compare typed fixtures with backend contract examples. Pass: field names, ratios, durations, capabilities, stable retry IDs, active-time sequencing, and approximate-reader flags match.
- Verify: inspect the dependency gate recorded in `research.md`. Pass: no chart or test dependency can be added without explicit owner approval.
- Verify: exercise invalid/unavailable storage and session expiration scenarios. Pass: foundations degrade without breaking reading.
- Verify: inspect event transport behavior. Pass: batching, retry limits, stable event IDs, and final flush are bounded and non-blocking.

## Execution Notes

- Backend Swagger is the contract source for Batch 1 field names: `event_type`, `progress_pct`, `accepted_count`, `duplicate_count`, flat interaction state, and `unique_readers_approximate`.
- Vitest is added as a dev-only test runner for foundation tests. Chart dependencies remain gated behind explicit approval.
- Tests cover visitor ID validation/storage fallback, reading progress milestone emission, cumulative active-time sequencing, stable event retry IDs, terminal rejected events, keepalive intent, and analytics range/format helpers.

## Definition of Done

- [x] T001-T009 complete.
- [x] Static fixture review recorded.
- [x] Commit recorded in `checklist.md`.
