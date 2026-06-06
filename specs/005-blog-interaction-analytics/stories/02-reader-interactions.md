# Story 02: Implement Reader Interactions and Instrumentation

**Project**: Horizon Blog Frontend  
**Service**: Public reader interactions  
**Dependencies**: Story 01 and backend public interaction APIs  
**Blockers**: Backend Story 02

## Context

Readers need compact heart/share actions and invisible, non-blocking measurement. This story owns the only integration into the shared reader frame.

## Acceptance Criteria

- Heart/share actions work anonymously and authenticated.
- Progress milestones emit once.
- Active time excludes hidden, unfocused, and idle tabs while sending cumulative values through the foundation service.
- Link tracking never blocks navigation.
- Failed event delivery never blocks reading.
- Reader design guidance is updated.

## Interface Contracts

- Consumes only frozen public interaction contracts.
- Exclusively owns `BlogReaderFrame.tsx` integration.

## Technical Approach

Use focused hooks for interaction and reading-session orchestration. Reuse one reader progress source and delegated content-link handling to avoid duplicate listeners and per-link wiring.

## Non-Goals

- No author analytics code, routes, or DI changes.

## Validation

- Verify: run reader quickstart heart/share scenarios. Pass: state reconciles and actions remain accessible.
- Verify: run progress, idle, hidden-tab, active-time retry, and link scenarios. Pass: milestones emit once, invalid active time emits never, cumulative active time remains monotonic, and navigation is unaffected.
- Verify: inspect reader design-system behavior. Pass: actions remain compact in mobile/desktop and light/dark modes.

## Definition of Done

- [ ] T010-T016 complete.
- [ ] Reader quickstart journey passes.
- [ ] Commit recorded in `checklist.md`.
