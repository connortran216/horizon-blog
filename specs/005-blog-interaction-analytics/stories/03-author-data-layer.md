# Story 03: Implement Author Analytics Data Layer

**Project**: Horizon Blog Frontend  
**Service**: Author analytics data access  
**Dependencies**: Story 01 and backend author query APIs  
**Blockers**: Backend Story 04 for live integration

## Context

Dashboard UI needs stable display models and request lifecycle behavior without learning backend transport shapes.

## Acceptance Criteria

- Repository consumes only approved author endpoints.
- Service maps API DTOs to typed display models.
- Hooks expose loading, empty, error, and freshness state.
- Approximate unique-reader semantics are preserved for UI formatting.
- DI registration is isolated to this story.

## Interface Contracts

- Consumes backend author query contracts.
- Exclusively owns `src/core/di/container.ts`.

## Technical Approach

Keep API DTOs inside the repository, map them through an author analytics service, and expose request lifecycle state through focused hooks.

## Non-Goals

- No route or visual page composition.

## Validation

- Verify: compare repository calls and DTO mapping with backend fixtures. Pass: no endpoint or field is invented, and approximate unique-reader metadata survives mapping.
- Verify: exercise success, empty, `401`, `404`, and `5xx` hook states. Pass: each state is explicit and preserves the selected range.
- Verify: inspect DI registration. Pass: feature pages can resolve the service without direct repository access.

## Execution Notes

- Repository uses only `GET /users/me/analytics/overview`, `GET /users/me/analytics/posts`, and `GET /users/me/analytics/posts/{id}` with inclusive `from` and `to` query params.
- Backend DTOs stay in `author-analytics.repository.ts`; service output is camelCase display models for page/UI stories.
- Hook helpers classify `401`, `404`, and `5xx` states and preserve freshness/range metadata on successful empty responses.
- No route, page, or visual analytics component was added in this story.

## Definition of Done

- [x] T017-T020 complete.
- [x] Contract mapping review passes.
- [x] Commit recorded in `checklist.md`.
