# Story 04: Implement Overview and Blog-Detail Analytics UI

**Project**: Horizon Blog Frontend  
**Service**: Protected author analytics routes  
**Dependencies**: Story 03  
**Blockers**: Stable author display models

## Context

Authors need a calm, actionable analytics route that answers reach and drop-off questions without turning Horizon into a dashboard-heavy product.

## Acceptance Criteria

- Overview clearly presents range, primary metrics, trends, top blogs, and freshness.
- Overview and blog detail distinguish date-range hearts received from current active hearts.
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

## Execution Notes

- Added protected `/analytics` and `/analytics/blog/:id` route wrappers and an owner-only user menu entry.
- Overview covers range selection, primary metrics, approximate reader labeling, trends, sorted blog metrics, pagination, and freshness.
- Detail covers summary metrics, progress funnel, reaction movement, link performance, traffic sources, empty state, error state, and freshness.
- Chart/funnel primitives remain dependency-free SVG/Chakra components; comparison table and insight list remain Story 05.

## Definition of Done

- [x] T021-T027 and T029-T030 complete.
- [x] Static overview/detail validation passes; live backend journey remains Story 06.
- [x] Commit recorded in `checklist.md`.
