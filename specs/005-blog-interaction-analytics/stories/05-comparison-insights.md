# Story 05: Implement Comparison and Insight Presentation

**Project**: Horizon Blog Frontend  
**Service**: Author analytics interpretation  
**Dependencies**: Story 04 and backend insight DTOs  
**Blockers**: Stable page composition and insight contracts

## Context

Authors need comparison and insight presentation that preserves evidence and cautious language rather than showing charts without meaning.

## Acceptance Criteria

- Sortable blog comparison is readable and keyboard accessible.
- Insight messages preserve sample size and evidence.
- Visualizations never rely on color alone.
- Shared analytics visualization rules are documented.

## Interface Contracts

- Consumes frozen `insights` arrays; does not change their contract.
- Owns reusable analytics component guidance only.

## Technical Approach

Present comparison as an accessible sortable table and insights as evidence-backed text. Keep visual encodings secondary to labels and values.

## Non-Goals

- No AI suggestions, route edits, or new dependencies.

## Validation

- Verify: sort and scan comparison data with keyboard and mobile layouts. Pass: rows and sort state remain clear.
- Verify: render low-sample and qualifying insights. Pass: backend caution and evidence are preserved.
- Verify: review visual encodings. Pass: no meaning relies on color alone.

## Execution Notes

- Added `BlogMetricsTable` for keyboard-accessible comparison sorting and diagnostics navigation.
- Added `AnalyticsInsightList` to preserve backend insight message, sample size, and evidence labels.
- Added helper coverage for local comparison sorting and insight evidence formatting.
- Updated reusable analytics component rules; live/manual screen checks remain Story 06.

## Definition of Done

- [x] T028 and T031 complete.
- [x] Static comparison/insight validation passes; live manual scenarios remain Story 06.
- [x] Commit recorded in `checklist.md`.
