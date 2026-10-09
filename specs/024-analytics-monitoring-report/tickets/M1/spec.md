# M1: Report data and controls

Project: Horizon Blog. Service: frontend. Source: ../../spec.md and approved-mockup.png.
Dependencies: none. Blockers: none.

## Acceptance criteria
1. Fetch all metric pages with cancellation, no duplicate rows or silently partial failures.
2. Filter titles across pages and sort before paginating; invalid URL query values have safe defaults.
3. Use compact keyboard-accessible UTC range disclosure and report section primitives.

Non-goals: API/schema/auth changes, new dependencies, publication. Existing unknown/error states remain explicit.
