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

## Definition of Done

- [ ] T032-T036 complete.
- [ ] Cross-repo evidence recorded.
- [ ] Rollout is ready for explicit owner approval.
