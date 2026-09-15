# horizon-blog-y2e.5.2: CV and Contact presentation

Project: Horizon Blog
Service: frontend
Dependencies: B5; previous ticket in bundle
Blockers: none for planning; upstream changes required for implementation.

## Context
Migrate the approved Signal prototype while preserving existing domain behavior. Source: `../../design-handoff/README.md`, prototype horizon-blog-721.

## Acceptance criteria
1. Actual CV content/direct contact links retained; print remains legible; mobile and themes match prototype.
2. Existing API, auth/permission and media boundaries remain intact.
3. Relevant lint, types, tests and light/dark/mobile visual checks pass or gaps are explicitly recorded.

## Non-goals
Backend/API changes, new production dependencies, architecture replacement, automatic deployment and prototype fixture imports.

## Definition of done
Verify AC1 against the source and rendered UI; pass with matched behavior and no blocking visual drift. Verify AC2 by reviewing changed imports and service calls; pass with preserved contracts. Verify AC3 with commands and saved evidence in plan.
