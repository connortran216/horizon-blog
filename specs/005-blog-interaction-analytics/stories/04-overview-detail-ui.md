# Story 04: Implement Overview and Blog-Detail Analytics UI

**Project**: Horizon Blog Frontend  
**Service**: Protected author analytics routes  
**Dependencies**: Story 03  
**Blockers**: Stable author display models

## Context

Authors need a calm, actionable analytics route that answers reach and drop-off questions without turning Horizon into a dashboard-heavy product.

## Acceptance Criteria

- Overview clearly presents range, primary metrics, trends, top blogs, and freshness.
- Blog detail clearly presents funnel, reactions, links, and sources.
- Approximate reader counts are visibly labeled without overclaiming precision.
- Loading, empty, error, stale, and not-found states are useful.
- Routes are protected and navigation remains owner-only.
- Analytics page design guidance is documented.

## Interface Contracts

- Exclusively owns `Routes.tsx`, `UserMenu.tsx`, and analytics page-family documentation.

## Technical Approach

Build one protected analytics page family with typed display components. Use semantic tokens and accessible SVG/Chakra primitives so charts remain understandable without adding a dependency.

## Non-Goals

- No backend contract changes or reader instrumentation edits.

## Validation

- Verify: run overview and detail quickstart journeys. Pass: authors can identify reach, top blogs, drop-off, reactions, links, sources, approximation, and freshness.
- Verify: exercise loading, empty, error, stale, and not-found states. Pass: every state is actionable and does not invent data.
- Verify: inspect protected routes and user menu. Pass: analytics is owner-only and separate from profile management.

## Definition of Done

- [ ] T021-T027 and T029-T030 complete.
- [ ] Overview/detail quickstart journey passes.
- [ ] Commit recorded in `checklist.md`.
