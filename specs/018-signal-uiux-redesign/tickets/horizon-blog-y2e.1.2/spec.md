# horizon-blog-y2e.1.2: Signal Chakra tokens and typography

Project: Horizon Blog
Service: frontend
Dependencies: B1; previous ticket in bundle
Blockers: none for planning; upstream changes required for implementation.

## Context
Migrate the approved Signal prototype while preserving existing domain behavior. Source: `../../design-handoff/README.md`, prototype horizon-blog-721.

## Acceptance criteria
1. Semantic light/dark values match approved baseline; old names stay compatible; dark button labels and focus are readable; fonts load locally; reduced motion disables theme transitions.
2. Existing API, auth/permission and media boundaries remain intact.
3. Relevant lint, types, tests and light/dark/mobile visual checks pass or gaps are explicitly recorded.

## Non-goals
Backend/API changes, new production dependencies, architecture replacement, automatic deployment and prototype fixture imports.

## Definition of done
Verify AC1 against the source and rendered UI; pass with matched behavior and no blocking visual drift. Verify AC2 by reviewing changed imports and service calls; pass with preserved contracts. Verify AC3 with commands and saved evidence in plan.
