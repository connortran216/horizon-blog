# Story 02: Implement Reader Interactions and Instrumentation

**Project**: Horizon Blog Frontend  
**Service**: Public reader interactions  
**Dependencies**: Story 01 and backend public interaction APIs  
**Blockers**: Backend Story 02

## Context

Readers need compact post-content interaction actions and invisible, non-blocking measurement. This story owns the only integration into the shared reader frame.

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
- Verify: inspect reader design-system behavior. Pass: the post-content icon row remains compact in mobile/desktop and light/dark modes, with only supported heart/share actions enabled.

## Execution Notes

- `BlogReaderFrame` remains the single scroll-progress source and now forwards progress changes to reader analytics.
- `BlogReaderFrame` renders the interaction bar as closing feedback after the article body, not in the opening metadata stack.
- `ReaderInteractionBar` follows the bottom icon-row pattern; comment, repost, and more actions are muted unavailable controls until backend contracts exist.
- Reader analytics link tracking is delegated from the content container and does not block navigation.
- Active-time measurement is gated by visibility, focus, and recent activity before cumulative `active_ms` events are emitted.
- Heart/unheart requests keep `visitor_id` in request bodies, including the DELETE body required by the backend contract.

## Definition of Done

- [x] T010-T016 complete.
- [x] Reader quickstart scenarios are covered by focused tests, lint, format, and build; live backend journey remains Story 06.
- [ ] Commit recorded in `checklist.md`.
