# horizon-blog-y2e.3.2: Public Series journey

Project: Horizon Blog
Service: frontend
Dependencies: horizon-blog-y2e.3.1 in the same R3 worktree
Blockers: implementation follows the validated Blog/Author discovery slice.

## Context
Migrate the approved Signal prototype while preserving existing domain behavior. Source: `../../design-handoff/README.md`, prototype horizon-blog-721.

## Acceptance criteria
1. Series index and detail use the Signal book/thread identity and remain visually distinct from blog cards.
2. Public ordered published parts use the existing service; zero/one/many, loading, empty, error, retry, partial-data and not-found states remain explicit.
3. Cards, ordered parts and connectors define hover, focus, press, touch and reduced-motion feedback.
4. Existing API, auth/permission, route, ordering and failure-isolation boundaries remain intact.
5. Relevant tests, lint, types, build and desktop/mobile light/dark interaction checks pass or gaps are explicitly recorded.

## Non-goals
Backend/API changes, new production dependencies, architecture replacement, automatic deployment and prototype fixture imports.

## Definition of done
Verify AC1 against the source and rendered UI; pass with matched behavior and no blocking visual drift. Verify AC2 by reviewing changed imports and service calls; pass with preserved contracts. Verify AC3 with commands and saved evidence in plan.
