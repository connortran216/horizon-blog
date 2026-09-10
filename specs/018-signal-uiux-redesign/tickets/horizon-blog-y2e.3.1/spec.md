# horizon-blog-y2e.3.1: Blog and author discovery

Project: Horizon Blog
Service: frontend
Dependencies: deployed R1.1 baseline
Blockers: none. User prioritized R3 before R2 on 2026-09-10.

## Context
Migrate the approved Signal prototype while preserving existing domain behavior. Source: `../../design-handoff/README.md`, prototype horizon-blog-721.

## Acceptance criteria
1. Real search/filter/pagination and author navigation are preserved in distinct tactile Blog and Author compositions.
2. Cover media supports loading, ready, no-media, error and retry; excerpts remain readable with long production-shaped content.
3. Search, filters, result changes, pagination, cards and navigation define hover, press, focus, touch and reduced-motion feedback.
4. Existing API, auth/permission, route and media boundaries remain intact; no fabricated public author data is rendered.
5. Relevant tests, lint, types, build and desktop/mobile light/dark interaction checks pass or gaps are explicitly recorded.

## Non-goals
Backend/API changes, new production dependencies, architecture replacement, automatic deployment and prototype fixture imports.

## Definition of done
Verify AC1 against the source and rendered UI; pass with matched behavior and no blocking visual drift. Verify AC2 by reviewing changed imports and service calls; pass with preserved contracts. Verify AC3 with commands and saved evidence in plan.
