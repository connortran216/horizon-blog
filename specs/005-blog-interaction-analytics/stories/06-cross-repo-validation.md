# Story 06: Validate Cross-Repo Journeys

**Project**: Horizon Blog Frontend and Backend  
**Service**: Integration and release validation  
**Dependencies**: Stories 02-05 and backend implementation  
**Blockers**: Real backend contracts available

## Context

Final validation must prove that reader actions, backend analytics rollups, and author dashboards work together without privacy, accessibility, or contract regressions.

## Technical Approach

Run shared quickstart journeys against real endpoints, compare types with generated Swagger, and record static/build/accessibility evidence without adding new feature work.

## Acceptance Criteria

- Reader and author quickstart journeys pass against real endpoints.
- Frontend types match Swagger and frozen contracts.
- Active-time sequencing, stable event IDs, approximate readers, and reaction trends match backend fixtures.
- Mobile/desktop, light/dark, keyboard, labels, contrast, and reduced motion pass.
- Lint, format, and production build pass.

## Non-Goals

- No new feature scope or opportunistic refactors.

## Validation

- Verify: run cross-repo reader and author journeys. Pass: interactions become expected author metrics.
- Verify: compare frontend contracts with Swagger. Pass: no drift remains.
- Verify: run lint, format, build, and accessibility/manual checks. Pass: all required gates complete.

## Execution Notes

- Contract validation passed against `/Users/trantuancanh/Personal/work/golang/horizon-blog-be/docs/swagger.json`, `contracts/backend-api.md`, and frontend reader/author endpoints and DTO fields.
- Static journey and accessibility checks passed for protected analytics routes, user-menu entry, heart/share labels, reader interaction group semantics, date input labels, approximate-reader labels, sortable comparison controls, trend chart semantics, and reduced-motion guidance.
- Targeted feature tests passed: `yarn test src/features/reader-interactions src/features/author-analytics` reported 13 files and 40 tests passing.
- Repo gates passed: `yarn lint`, `yarn format`, `yarn build`, and `git diff --check`.
- Production build emitted existing Vite large-chunk warnings, but exited successfully.
- Live manual reader/author journeys are blocked because no owner-run frontend server is reachable on `localhost:5173`, `127.0.0.1:5173`, `localhost:3000`, or `localhost:4173`. Per repo guide, Codex does not run `yarn dev`.

## Definition of Done

- [ ] T032-T036 complete. Blocked by open T033 and T034 live manual checks.
- [x] Cross-repo evidence recorded.
- [ ] Rollout is ready for explicit owner approval. Blocked until owner starts the app and completes live quickstart journeys.
